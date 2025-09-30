import torch
from torch import nn, optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import csv

metrics = [] 

# Paths
train_dir = r"D:/OOPS Project/ayushman/datasets/07 beans/train"
val_dir   = r"D:/OOPS Project/ayushman/datasets/07 beans/valid"

# Data transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

train_ds = datasets.ImageFolder(train_dir, transform=transform)
val_ds   = datasets.ImageFolder(val_dir, transform=transform)

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader   = DataLoader(val_ds, batch_size=32)

# Pretrained model (ResNet18)
model = models.resnet18(pretrained=True)
for param in model.parameters():
    param.requires_grad = False  # freeze backbone

# Replace final layer
num_classes = len(train_ds.classes)
model.fc = nn.Linear(model.fc.in_features, num_classes)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=0.001)

# Training loop
epochs=100

print(f"Starting training on device: {device}")

for epoch in range(epochs):
    model.train()
    running_loss, correct = 0.0, 0
    for imgs, labels in train_loader:
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * imgs.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()

    train_loss = running_loss / len(train_ds)
    train_acc = correct / len(train_ds)

    # 🔹 VALIDATION STEP (add this)
    model.eval()
    val_loss, val_correct = 0.0, 0
    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            val_loss += loss.item() * imgs.size(0)
            val_correct += (outputs.argmax(1) == labels).sum().item()

    val_loss = val_loss / len(val_ds)
    val_acc  = val_correct / len(val_ds)
    # 🔹 END validation

    # store metrics for this epoch
    metrics.append([epoch+1, train_loss, train_acc, val_loss, val_acc])
    print(f"Epoch {epoch+1}: loss={running_loss/len(train_ds):.4f}, acc={train_acc:.3f}")

with open("ayushman/training_metrics/beans_training_metrics.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["epoch", "train_loss", "train_acc", "val_loss", "val_acc"])
    writer.writerows(metrics)

# Save model
torch.save(model.state_dict(), "ayushman/pth_files/beans_classifier.pth")

print("Training complete! Model saved.")