import torch
from torch import nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
from pathlib import Path
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd 

# config
test_dir = r"D:/OOPS Project/ayushman/datasets/07 beans/test"
model_path = r"D:/OOPS Project/ayushman/pth_files/beans_classifier.pth"
results_dir = Path(r"D:/OOPS Project/ayushman/test_results")

batch_size = 16
device = "cuda" if torch.cuda.is_available() else "cpu"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

test_ds = datasets.ImageFolder(test_dir, transform=transform)
test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)
class_names = test_ds.classes

# model
model = models.resnet18(weights=None)
num_classes = len(class_names)
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Load trained weights
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# evaluation
all_preds, all_labels = [], []

with torch.no_grad():
    for imgs, labels in test_loader:
        imgs = imgs.to(device)
        outputs = model(imgs)
        preds = outputs.argmax(1).cpu().numpy()

        all_preds.extend(preds)
        all_labels.extend(labels.numpy())

all_preds = np.array(all_preds)
all_labels = np.array(all_labels)

# save report
results_dir.mkdir(parents=True, exist_ok=True)

report = classification_report(
    all_labels, all_preds,
    labels=range(num_classes),
    target_names=class_names,
    digits=4
)

cm = confusion_matrix(all_labels, all_preds, labels=range(num_classes))

with open(results_dir / "coconut_test_report.txt", "w") as f:
    f.write(f"Test Accuracy: {(all_preds == all_labels).mean():.4f}\n\n")
    f.write("Classification Report:\n")
    f.write(report + "\n\n")
    f.write("Confusion Matrix:\n")
    f.write(str(cm) + "\n")

# Save confusion matrix heatmap
cm_df = pd.DataFrame(cm, index=class_names, columns=class_names)

plt.figure(figsize=(10, 8))
sns.heatmap(cm_df, annot=True, fmt="d", cmap="Blues")
plt.title("Confusion Matrix - Coconut Test Set")
plt.ylabel("True Label")
plt.xlabel("Predicted Label")
plt.tight_layout()
plt.savefig(results_dir / "coconut_confusion_matrix.png")
plt.close()

# print result
print(f"\nTest Accuracy: {(all_preds == all_labels).mean():.4f}")
print("\nClassification Report:")
print(report)
print("\nConfusion Matrix:")
print(cm)
