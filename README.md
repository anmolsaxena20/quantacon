# 🚀 Project Setup Guide

Follow the steps below to run this project locally.

---

## 📦 1. Clone the Repository

git clone <your-repo-url>
cd <project-folder>

---

## 🔧 2. Environment Variables Setup

Before running the project, create a **.env** file inside the **backend root folder**:

server/backend/.env

⚠️ Do NOT commit this file to GitHub. It contains sensitive credentials.

### 📄 .env File Structure

# Database

MONGO_URI=mongodb://localhost:27017/your_database_name

# Server

PORT=5000

# JWT Secrets

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Google OAuth (if used)

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twilio (OTP / SMS)

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Twilio Verify (if using Verify API)

TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# Razorpay (Payments)

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary (CDN)

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional – for email OTP)

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

---

## 📥 3. Install Dependencies

### Backend

cd server/backend
npm install

### Frontend (if applicable)

cd ../../frontend
npm install

---

## ▶️ 4. Start the Servers

### Start Backend

cd server/backend
nodemon server.js

### Start Frontend

cd frontend
npm run dev

---

## 🔐 Security Reminder

- Never expose API keys or secrets in frontend code
- Never push .env to GitHub
- Always use environment variables for credentials

---

## 💳 Payment Testing (Razorpay)

Use Razorpay Test Mode while developing.

---

## 📱 OTP Testing (Twilio)

Make sure:

- Your phone number is verified in Twilio (Trial account)
- Geo permissions are enabled (for India if applicable)

---

You are now ready to run the project locally 🎉
