# OOP Project — Plant Disease Detection

A full-stack agricultural application that uses deep learning to detect plant diseases from leaf images. The project fine-tunes **ResNet18** (a pre-trained residual neural network) on a plant disease dataset sourced from **Kaggle**. It supports disease classification across **14 plant types**: Beans, Chilli, Coconut, Coffee, Cucumber, Lettuce, Mango, Onion, Potato, Rice, Sugarcane, Tobacco, Tomato, and Wheat.

Each plant type has a dedicated ResNet18 model that was fine-tuned via transfer learning. When a user uploads a leaf image, the system identifies the plant, predicts the disease (or confirms the plant is healthy), reports a confidence score, and provides treatment recommendations.

Beyond disease detection, the application also includes an e-commerce marketplace for agricultural products, a community blog for farmers, and user authentication.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** (for backend)
- **Node.js 16+** and **npm** (for frontend)
- **MySQL** database server
- **pip** (Python package manager)

## Project Structure

```
OOPproject/
├── backend/          # FastAPI backend with ML model
├── frontend/         # React + Vite frontend
├── ML Model/         # Machine learning models
└── package.json      # Root package for running all services
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OOPproject
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

#### Configure Environment Variables

1. Copy the `.env.example` file to `.env` in the backend folder:
   ```bash
   copy backend\.env.example backend\.env
   ```

2. Edit `backend/.env` and update the following variables:
   - `DATABASE_URL`: Your MySQL database connection string
   - `RAZORPAY_KEY_ID`: Your Razorpay API key
   - `RAZORPAY_KEY_SECRET`: Your Razorpay secret key
   - `RAZORPAY_WEBHOOK_SECRET`: Your Razorpay webhook secret
   - `CORS_ORIGINS`: Allowed origins for CORS (default is set for local development)

### 3. Frontend Setup

#### Install Node Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Root Dependencies

Install concurrently for running multiple services:

```bash
npm install
```

## Running the Application

### Option 1: Run All Services Together (Recommended)

From the root directory:

```bash
npm start
```

This will start:
- Backend API server on `http://localhost:8000`
- ML Model server on `http://localhost:3000`
- Frontend development server on `http://localhost:5173`

### Option 2: Run Services Individually

#### Start Backend API

```bash
npm run start:backend1
```

#### Start ML Model Server

```bash
npm run start:backend2
```

#### Start Frontend

```bash
npm run start:frontend
```

## Database Setup

1. Create a MySQL database named `OOPSproject`
2. Update the `DATABASE_URL` in `backend/.env` with your database credentials
3. Run database migrations (if any) or create sample data:
   ```bash
   cd backend
   python create_sample_data.py
   ```

## API Documentation

Once the backend is running, visit:
- API Docs (Swagger): `http://localhost:8000/docs`
- Alternative API Docs (ReDoc): `http://localhost:8000/redoc`

## ML Model Details

| Detail | Value |
|--------|-------|
| Architecture | ResNet18 (Residual Network, 18 layers) |
| Framework | PyTorch + Torchvision |
| Training Approach | Transfer learning — pre-trained on ImageNet, fine-tuned on a Kaggle plant disease dataset |
| Input Size | 224 x 224 pixels |
| Normalization | ImageNet standard (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`) |
| Supported Plants | 14 (Beans, Chilli, Coconut, Coffee, Cucumber, Lettuce, Mango, Onion, Potato, Rice, Sugarcane, Tobacco, Tomato, Wheat) |
| Output | Disease class, confidence score, and treatment recommendations |

Each plant has its own fine-tuned model (e.g., `beans_classifier.pth`) and a corresponding class-names JSON file. Models are lazily loaded and cached for performance.

## Technologies Used

### Backend
- FastAPI
- SQLAlchemy
- PyMySQL
- PyTorch & Torchvision (ML — ResNet18)
- Razorpay (Payment Integration)
- Passlib & Bcrypt (Authentication)

### Frontend
- React 19
- Vite
- React Router
- React Bootstrap
- Bootstrap 5

## Troubleshooting

### Port Already in Use
If you get a port conflict error, you can change the ports in `package.json` scripts.

### Database Connection Issues
- Ensure MySQL server is running
- Verify database credentials in `.env`
- Check if the database `OOPSproject` exists

### Module Not Found Errors
- Backend: Run `pip install -r requirements.txt` in the backend folder
- Frontend: Run `npm install` in the frontend folder

## License

[Add your license here]
