# Project Requirements

This document contains all the dependencies and setup instructions for both frontend and backend components of the OOP Project.

## Backend Requirements (Python/FastAPI)

### Prerequisites
- Python 3.11 or higher
- Virtual environment (venv)

### Python Dependencies
Create a `requirements.txt` file with the following dependencies:

```txt
# FastAPI Core
fastapi==0.115.0
uvicorn[standard]==0.30.6

# Database
sqlalchemy==2.0.35
pymysql==1.1.1
cryptography

# Validation & Settings
pydantic==2.9.2
pydantic-settings==2.3.3

# Security & Authentication
python-multipart==0.0.9
bcrypt==5.0.0
python-jose==3.3.0

# Payment Processing
razorpay==2.0.0
requests

# Environment Variables
python-dotenv==1.0.1

# Additional Dependencies
starlette
typing-extensions
```

### Backend Setup Instructions

1. **Create Virtual Environment:**
   ```bash
   cd "d:\padhai\oops  Project\OOPproject\backend"
   python -m venv ../oopproject_env
   ```

2. **Activate Virtual Environment:**
   ```bash
   # Windows PowerShell
   & "D:/padhai/oops  Project/oopproject_env/Scripts/Activate.ps1"
   
   # Windows Command Prompt
   "D:\padhai\oops  Project\oopproject_env\Scripts\activate.bat"
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   - Create `.env` file in backend directory
   - Configure database connection string
   - Set session secrets and CORS origins

5. **Run Backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## Frontend Requirements (React/Vite)

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Node.js Dependencies
The `package.json` includes:

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    "bootstrap": "^5.3.8",
    "react-bootstrap": "^2.10.10"
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",
    "@types/react": "^19.1.13",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.3",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.4.0",
    "vite": "^7.1.7"
  }
}
```

### Frontend Setup Instructions

1. **Navigate to Frontend Directory:**
   ```bash
   cd "d:\padhai\oops  Project\OOPproject\frontend\app"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## Complete Installation Script

### For Backend (PowerShell):
```powershell
# Navigate to project root
cd "d:\padhai\oops  Project\OOPproject"

# Create and activate virtual environment
python -m venv oopproject_env
& "./oopproject_env/Scripts/Activate.ps1"

# Install backend dependencies
cd backend
pip install fastapi==0.115.0 uvicorn[standard]==0.30.6 sqlalchemy==2.0.35 pymysql==1.1.1 cryptography pydantic==2.9.2 pydantic-settings==2.3.3 python-multipart==0.0.9 "passlib[bcrypt]==1.7.4" python-jose==3.3.0 python-dotenv==1.0.1
```

### For Frontend (PowerShell):
```powershell
# Navigate to frontend directory
cd "d:\padhai\oops  Project\OOPproject\frontend\app"

# Install frontend dependencies
npm install
```

---

## Project Structure

```
OOPproject/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   ├── .env
│   └── routes/
│       ├── product_routes.py
│       ├── product_system.py
│       ├── cart_routes.py
│       └── order_routes.py
├── frontend/
│   └── app/
│       ├── package.json
│       ├── package-lock.json
│       ├── vite.config.js
│       ├── index.html
│       └── src/
├── oopproject_env/
└── REQUIREMENTS.md (this file)
```

---

## Running the Complete Application

1. **Start Backend (Terminal 1):**
   ```bash
   cd "d:\padhai\oops  Project\OOPproject\backend"
   & "D:/padhai/oops  Project/oopproject_env/Scripts/Activate.ps1"
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend (Terminal 2):**
   ```bash
   cd "d:\padhai\oops  Project\OOPproject\frontend\app"
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

---

## Troubleshooting

### Common Issues:

1. **ModuleNotFoundError: No module named 'passlib'**
   - Solution: Ensure virtual environment is activated and dependencies are installed

2. **Database Connection Errors**
   - Solution: Configure proper DATABASE_URL in .env file

3. **CORS Errors**
   - Solution: Verify CORS origins in backend configuration

4. **Port Already in Use**
   - Solution: Change port numbers or kill existing processes

---

## Environment Variables

### Backend (.env file):
```env
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

### Frontend (.env file):
```env
VITE_API_URL=http://localhost:8000
```

---

## Dependencies Status: ✅ INSTALLED

- ✅ Backend Python dependencies
- ✅ Frontend Node.js dependencies  
- ✅ Authentication modules (passlib, bcrypt)
- ✅ Database connectivity (SQLAlchemy, PyMySQL, cryptography)
- ✅ React ecosystem (React, React Router, Bootstrap)
- ✅ Development tools (Vite, ESLint)

The project is ready to run!