# 🌱 Environment Setup Guide

This guide explains how to set up environment variables for the Agriculture Marketplace project.

## 📋 Quick Setup

### 1. Copy Environment Template
```bash
# Navigate to backend directory
cd backend

# Copy the template file
cp .env.example .env
```

### 2. Edit Your .env File
Open `.env` file and update the following critical values:

```env
# ✅ REQUIRED: Database Configuration
DATABASE_URL=mysql+pymysql://your_username:your_password@localhost:3306/your_database

# ✅ REQUIRED: Security Keys (generate strong passwords!)
SECRET_KEY=your-super-secret-key-minimum-32-characters
SESSION_SECRET=your-session-secret-minimum-32-characters

# ✅ REQUIRED: Razorpay Credentials (from your Razorpay dashboard)
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_secret_key
```

## 🔧 Database Setup

### Option 1: MySQL (Recommended)
```bash
# Install MySQL and create database
mysql -u root -p
CREATE DATABASE agriculture_db;
```

### Option 2: SQLite (For Testing)
```env
DATABASE_URL=sqlite:///./agriculture.db
```

## 🔑 Security Keys Generation

### Generate Strong Secret Keys:
```python
# Run this in Python to generate secure keys
import secrets
print("SECRET_KEY:", secrets.token_urlsafe(32))
print("SESSION_SECRET:", secrets.token_urlsafe(32))
```

## 💳 Razorpay Setup

1. **Sign up** at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Get Test Credentials**:
   - Go to Account & Settings → API Keys
   - Generate Test API Keys
   - Copy Key ID and Key Secret to your `.env`

## 🚀 Starting the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
# or
uvicorn main:app --reload

# Your API will be available at:
# http://127.0.0.1:8000
```

## 📂 Project Structure
```
backend/
├── .env                 # 🔒 Your private environment variables
├── .env.example         # 📝 Template for other developers
├── main.py             # 🚀 FastAPI application
├── database.py         # 🗄️ Database configuration
├── models.py           # 📊 Database models
└── routes/             # 🛣️ API routes
```

## ⚠️ Security Important Notes

### ✅ DO:
- Keep `.env` file private (never commit to Git)
- Use strong, unique passwords
- Rotate secrets regularly
- Use different values for dev/prod

### ❌ DON'T:
- Share `.env` file contents
- Use default/weak passwords
- Commit sensitive data to version control
- Use production keys in development

## 🔍 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `mysql+pymysql://user:pass@host:3306/db` |
| `SECRET_KEY` | App secret key | `your-32-char-secret-key` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | `rzp_test_1234567890` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | `your-secret-key` |
| `CORS_ORIGINS` | Allowed frontend URLs | `http://localhost:3000,http://localhost:5173` |
| `DEBUG` | Enable debug mode | `True` or `False` |

## 🆘 Troubleshooting

### Database Connection Issues:
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u your_username -p your_database
```

### Import Errors:
```bash
# Install missing packages
pip install python-dotenv
pip install razorpay
pip install pymysql
```

### Permission Errors:
```bash
# Fix file permissions
chmod 600 .env
```

## 🎯 Next Steps

1. ✅ Set up your `.env` file
2. ✅ Create your database
3. ✅ Get Razorpay test credentials
4. ✅ Start the backend server
5. ✅ Test the API endpoints

## 📞 Need Help?

- Check the main `README.md` for detailed setup
- Review the API documentation at `/docs` 
- Ensure all environment variables are correctly set

---

🎉 **You're ready to build an amazing agriculture marketplace!** 🌾