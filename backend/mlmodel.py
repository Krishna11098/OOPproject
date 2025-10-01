# main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image
import io
import os
import json
from datetime import datetime
from typing import Dict, Any
import glob

app = FastAPI(
    title="Plant Disease Detection API",
    description="API for detecting plant diseases using specialized ResNet18 models for each plant type",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Base paths (update these according to your actual folder structure)
BASE_MODEL_PATH = "D:/OOPS Project/ayushman_new/ML Model/pth_files"
BASE_JSON_PATH = "D:/OOPS Project/ayushman_new/ML Model/json_files"

class PlantDiseasePredictor:
    def __init__(self):
        self.models = {}
        self.class_names = {}
        self.treatments = {}
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def get_model_path(self, plant_type: str) -> str:
        """Get model path based on plant type using switch-case approach"""
        plant_type_lower = plant_type.lower()
        
        # Switch-case using dictionary mapping
        model_mapping = {
            "beans": f"{BASE_MODEL_PATH}/beans_classifier.pth",
            "chilli": f"{BASE_MODEL_PATH}/chilli_classifier.pth",
            "coconut": f"{BASE_MODEL_PATH}/coconut_classifier.pth",
            "coffee": f"{BASE_MODEL_PATH}/coffee_classifier.pth",
            "cucumber": f"{BASE_MODEL_PATH}/cucumber_classifier.pth",
            "lettuce": f"{BASE_MODEL_PATH}/lettuce_classifier.pth",
            "mango": f"{BASE_MODEL_PATH}/mango_classifier.pth",
            "onion": f"{BASE_MODEL_PATH}/onion_classifier.pth",
            "potato": f"{BASE_MODEL_PATH}/potato_classifier.pth",
            "rice": f"{BASE_MODEL_PATH}/rice_classifier.pth",
            "sugarcane": f"{BASE_MODEL_PATH}/sugarcane_classifier.pth",
            "tobacco": f"{BASE_MODEL_PATH}/tobacco_classifier.pth",
            "tomato": f"{BASE_MODEL_PATH}/tomato_classifier.pth",
            "wheat": f"{BASE_MODEL_PATH}/wheat_classifier.pth"
        }
        
        model_path = model_mapping.get(plant_type_lower)
        if not model_path:
            raise ValueError(f"Unsupported plant type: {plant_type}")
        
        # Check if file exists
        if not os.path.exists(model_path):
            # Try to find similar files
            similar_files = glob.glob(f"{BASE_MODEL_PATH}/*{plant_type_lower}*.pth")
            if similar_files:
                model_path = similar_files[0]
                print(f"Using similar model file: {model_path}")
            else:
                raise FileNotFoundError(f"Model file not found: {model_path}")
        
        return model_path
    
    def get_json_paths(self, plant_type: str) -> tuple:
        """Get class names and treatments JSON paths"""
        plant_type_lower = plant_type.lower()
        
        classnames_mapping = {
            "beans": f"{BASE_JSON_PATH}/beans_classnames.json",
            "chilli": f"{BASE_JSON_PATH}/chilli_classnames.json",
            "coconut": f"{BASE_JSON_PATH}/coconut_classnames.json",
            "coffee": f"{BASE_JSON_PATH}/coffee_classnames.json",
            "cucumber": f"{BASE_JSON_PATH}/cucumber_classnames.json",
            "lettuce": f"{BASE_JSON_PATH}/lettuce_classnames.json",
            "mango": f"{BASE_JSON_PATH}/mango_classnames.json",
            "onion": f"{BASE_JSON_PATH}/onion_classnames.json",
            "potato": f"{BASE_JSON_PATH}/potato_classnames.json",
            "rice": f"{BASE_JSON_PATH}/rice_classnames.json",
            "sugarcane": f"{BASE_JSON_PATH}/sugarcane_classnames.json",
            "tobacco": f"{BASE_JSON_PATH}/tobacco_classnames.json",
            "tomato": f"{BASE_JSON_PATH}/tomato_classnames.json",
            "wheat": f"{BASE_JSON_PATH}/wheat_classnames.json"
        }
        
        treatments_mapping = {
            "beans": f"{BASE_JSON_PATH}/beans_treatments.json",
            "chilli": f"{BASE_JSON_PATH}/chilli_treatments.json",
            "coconut": f"{BASE_JSON_PATH}/coconut_treatments.json",
            "coffee": f"{BASE_JSON_PATH}/coffee_treatments.json",
            "cucumber": f"{BASE_JSON_PATH}/cucumber_treatments.json",
            "lettuce": f"{BASE_JSON_PATH}/lettuce_treatments.json",
            "mango": f"{BASE_JSON_PATH}/mango_treatments.json",
            "onion": f"{BASE_JSON_PATH}/onion_treatments.json",
            "potato": f"{BASE_JSON_PATH}/potato_treatments.json",
            "rice": f"{BASE_JSON_PATH}/rice_treatments.json",
            "sugarcane": f"{BASE_JSON_PATH}/sugarcane_treatments.json",
            "tobacco": f"{BASE_JSON_PATH}/tobacco_treatments.json",
            "tomato": f"{BASE_JSON_PATH}/tomato_treatments.json",
            "wheat": f"{BASE_JSON_PATH}/wheat_treatments.json"
        }
        
        classnames_path = classnames_mapping.get(plant_type_lower)
        treatments_path = treatments_mapping.get(plant_type_lower)
        
        return classnames_path, treatments_path
    
    def load_model(self, plant_type: str):
        """Load model and related data for a specific plant type"""
        if plant_type in self.models:
            return self.models[plant_type], self.class_names[plant_type], self.treatments[plant_type]
        
        try:
            # Get paths
            model_path = self.get_model_path(plant_type)
            classnames_path, treatments_path = self.get_json_paths(plant_type)
            
            # Load class names
            if os.path.exists(classnames_path):
                with open(classnames_path, 'r') as f:
                    class_names = json.load(f)
            else:
                print(f"Class names file not found: {classnames_path}")
                class_names = ["Unknown"]
            
            # Load treatments
            if os.path.exists(treatments_path):
                with open(treatments_path, 'r') as f:
                    treatments = json.load(f)
            else:
                print(f"Treatments file not found: {treatments_path}")
                treatments = {}
            
            # Load model
            model = models.resnet18(weights=None)
            num_classes = len(class_names)
            model.fc = nn.Linear(model.fc.in_features, num_classes)
            
            state_dict = torch.load(model_path, map_location=device, weights_only=True)
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()
            
            # Cache loaded data
            self.models[plant_type] = model
            self.class_names[plant_type] = class_names
            self.treatments[plant_type] = treatments
            
            print(f"Successfully loaded model for {plant_type}")
            return model, class_names, treatments
            
        except Exception as e:
            raise Exception(f"Failed to load model for {plant_type}: {str(e)}")
    
    def predict_image(self, image_data: bytes, plant_type: str) -> Dict[str, Any]:
        """Run prediction on the image"""
        try:
            model, class_names, treatments = self.load_model(plant_type)
            
            # Load and preprocess image
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            img_t = self.transform(image).unsqueeze(0).to(device)
            
            # Run inference
            with torch.no_grad():
                outputs = model(img_t)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
            
            predicted_class = class_names[predicted.item()]
            confidence_score = confidence.item()
            
            # Get treatments
            treatment_list = treatments.get(predicted_class, ["No specific treatment information available."])
            
            return {
                "plant_type": plant_type,
                "disease": predicted_class,
                "confidence": f"{confidence_score:.2%}",
                "treatments": treatment_list,
                "additional_info": self.get_additional_info(predicted_class, plant_type, confidence_score)
            }
            
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")
    
    def get_additional_info(self, disease: str, plant_type: str, confidence: float) -> str:
        """Generate additional information based on prediction"""
        if "healthy" in disease.lower():
            return f"Your {plant_type} plant appears healthy with {confidence:.2%} confidence. Continue regular care practices."
        elif confidence > 0.8:
            return f"High confidence detection of {disease} in {plant_type}. Immediate treatment recommended."
        elif confidence > 0.6:
            return f"Moderate confidence detection of {disease} in {plant_type}. Monitor closely and apply treatments."
        else:
            return f"Low confidence detection. Please verify the diagnosis and consider consulting an agricultural expert."

# Initialize predictor
predictor = PlantDiseasePredictor()

@app.post("/analyze")
async def analyze_plant(
    image: UploadFile = File(...),
    plant_type: str = Form(...)
):
    """Analyze plant image for diseases"""
    try:
        # Validate plant type
        supported_plants = [
            "Beans", "chilli", "Coconut", "Coffee", "Cucumber", 
            "Lettuce", "Mango", "Onion", "Potato", "Rice", 
            "Sugarcane", "Tobacco", "Tomato", "Wheat"
        ]
        
        if plant_type not in supported_plants:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported plant type: {plant_type}. Supported plants: {', '.join(supported_plants)}"
            )
        
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await image.read()
        
        if len(image_data) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="Image size should be less than 10MB")
        
        # Run prediction
        result = predictor.predict_image(image_data, plant_type)
        
        return JSONResponse(content=result)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)