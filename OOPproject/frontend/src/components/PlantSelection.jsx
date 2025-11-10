import React from "react";
import "./PlantSelection.css";

const PlantSelection = ({ onPlantSelect }) => {
  const plants = [
    "Beans",
    "chilli",
    "Coconut",
    "Coffee",
    "Cucumber",
    "Lettuce",
    "Mango",
    "Onion",
    "Potato",
    "Rice",
    "Sugarcane",
    "Tobacco",
    "Tomato",
    "Wheat",
  ];

  return (
    <div className="plant-selection-container">
      <header className="selection-header">
        <h1>Plant Disease Detection</h1>
        <p>Select your plant type to begin analysis</p>
      </header>

      <div className="plant-grid">
        {plants.map((plant, index) => (
          <div
            key={index}
            className="plant-card"
            onClick={() => onPlantSelect(plant)}
          >
            {/* <div className="plant-icon">🌱</div> */}
            <div className="plant-name">{plant}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantSelection;
