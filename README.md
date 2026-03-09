🚌 Campus Ride Management System

A modern, intelligent transportation management platform for educational campuses that enables real-time bus tracking, route optimization, digital payments, and advanced analytics for students, drivers, and administrators.

The system improves transport efficiency, safety, and user experience by combining real-time communication, AI insights, and modern web technologies.

📌 Project Overview

Managing campus transportation manually leads to:

Uncertain bus arrival times

Inefficient route planning

Lack of real-time fleet visibility

Poor communication between drivers and students

Limited data insights for administrators

Campus Ride solves these challenges by delivering a fully digital transportation ecosystem with live tracking, predictive analytics, and intelligent notifications.

🌟 Key Features
🎓 Student Features

📍 Real-time Bus Tracking with live GPS and ETA updates

🗺 Smart Route Planning with multi-stop journey options

⭐ Favorites & Saved Routes for quick access

📊 Ride History & Feedback with ratings

🔔 Smart Notifications for delays, arrivals, and alerts

💳 Digital Payments (UPI, card, wallet, monthly passes)

🚨 Emergency Safety Features including panic button

🏆 Gamification System with achievements and ride streaks

♿ Accessibility Support including screen readers and voice commands

🚌 Driver Features

🧭 Turn-by-turn Navigation with live traffic updates

👥 Passenger Tracking for boarding and drop-offs

⚡ AI Route Optimization suggestions

⛽ Fuel Monitoring & Alerts

🔧 Maintenance Scheduling reminders

💬 Dispatch Communication with control center

🚑 Emergency Protocol Access

📈 Performance Metrics including punctuality and passenger feedback

📷 Incident Reporting with media and GPS data

👨‍💼 Admin Features

📊 Advanced Analytics Dashboard

🚍 Real-time Fleet Monitoring

🔍 Predictive Maintenance using AI

👥 Role-based User Management

📈 Financial and Revenue Analytics

🌱 Environmental Impact Monitoring

⚙️ System Administration Tools

📉 Demand Forecasting and Capacity Planning

🚀 Advanced Platform Capabilities
🔄 Real-Time WebSocket System

Live bus tracking updates

Real-time passenger counts

Instant notifications

Emergency alerts

System health monitoring

💳 Digital Payment System

UPI, card, wallet, and net banking

Digital student wallet

Monthly ride passes

Transaction history

Refund and dispute management

📊 Analytics & Business Intelligence

User behavior insights

Operational performance metrics

Cost and revenue tracking

Environmental analytics

Predictive demand forecasting

🔔 Smart Notification Engine

Behavior-based notifications

Multi-channel alerts (Push, Email, SMS)

Custom notification templates

Quiet hours and preferences

Notification performance analytics

🛣 AI Route Optimization

AI-based route planning

Traffic-aware adjustments

Capacity planning

Alternative route suggestions

Route performance benchmarking

🚨 Safety & Emergency System

Panic button with live GPS location

Emergency contact alerts

Safety protocol automation

Incident reporting and analysis

Real-time emergency broadcasting

🎮 Gamification System

Achievement badges

Leaderboards

Ride challenges

Referral rewards

Progress tracking

♿ Accessibility Features

WCAG accessibility compliance

Screen reader support

Voice command interaction

High contrast and large text modes

Assistive technology integration

📱 Progressive Web App (PWA)

Offline functionality

Push notifications

Installable mobile experience

Background data synchronization

Optimized responsive design

🤖 AI Powered Features

Predictive analytics

Intelligent recommendations

Natural language chat assistant

Anomaly detection

Behavioral insights

🛠️ Technical Architecture
Frontend

React 18

TypeScript

Vite

Tailwind CSS

Shadcn UI

React Router

React Query

Socket.io Client

Backend

Node.js

Express.js

MongoDB

JWT Authentication

bcrypt Password Hashing

Socket.io WebSocket Server

Express Validator

Microservice Components

WebSocket Service

Payment Service

Analytics Engine

Notification Service

Route Optimization Service

Emergency Safety System

Gamification Engine

Accessibility Engine

PWA Service

AI Feature Service

📦 Installation & Setup
Prerequisites

Node.js (v18+)

MongoDB (v5+)

npm or yarn

1️⃣ Clone the Repository
git clone https://github.com/your-username/campus-ride.git
cd campus-ride
2️⃣ Install Dependencies

Frontend

npm install

Backend

cd backend
npm install
cd ..
3️⃣ Environment Setup
cp env.example .env
cp backend/env.example backend/.env

Edit the environment variables accordingly.

4️⃣ Database Setup
cd backend
npm run seed
5️⃣ Start Development Servers

Backend

cd backend
npm run dev

Frontend

npm run dev
6️⃣ Access the Application

Frontend

http://localhost:8080

Backend API

http://localhost:5000

Health Check

http://localhost:5000/health
🔐 Demo Credentials
Role	Email	Password
Student	student@university.edu
	password123
Driver	driver@university.edu
	password123
Admin	admin@university.edu
	password123
📱 Mobile & PWA Capabilities

Installable mobile app experience

Offline support with caching

Push notifications

Background sync

Mobile-first responsive design

⚙️ Configuration
Frontend Environment
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_VAPID_PUBLIC_KEY=your_vapid_key
Backend Environment
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-ride
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12
📊 Analytics & Monitoring
Built-in Analytics

User behavior tracking

Operational performance metrics

Financial analytics

Environmental impact reports

System health monitoring

Reporting

Automated reports

Custom analytics dashboards

Export data (PDF / Excel / CSV)

Scheduled reporting

🚀 Deployment
Production Build
npm run build
cd backend
npm run build
Recommended Hosting

Frontend

Vercel

Netlify

Backend

AWS

DigitalOcean

Heroku

Database

MongoDB Atlas

Docker Deployment
docker-compose up -d
🤝 Contributing

Fork the repository

Create a feature branch

Implement changes

Add tests if necessary

Submit a Pull Request

📜 License

This project is licensed under the MIT License.

🎯 Future Roadmap

Mobile Apps (iOS / Android)

IoT Integration for Smart Buses

Blockchain-based Transactions

Augmented Reality Navigation

Voice Assistant Integration

Multi-language Support

Advanced AI Recommendation Engine

University ERP Integration

🙏 Acknowledgments

React Team

Tailwind CSS

Shadcn UI

MongoDB

Socket.io

👨‍💻 Repository Owner

Rahul Gunda
B.Tech — Computer Science and Business Systems
RVR & JC Engineering College (2023 – 2027)

💡 Passionate about AI, Full-Stack Development, and Intelligent Systems

This project was designed and developed to demonstrate modern transportation system architecture, real-time systems, and AI-powered analytics for campus mobility solutions.

🔗 Connect With Me

📧 Email: rahulgunda206@gmail.com

💼 LinkedIn: https://www.linkedin.com/in/rahul-gunda-411394318/
💻 GitHub: https://github.com/Rahul-gits


🧠 Skills & Interests

Artificial Intelligence & Machine Learning

Computer Vision Systems

Full Stack Development (React + Node.js)

Real-Time Systems (WebSockets)

Data Analytics & Visualization

System Design & Scalable Architecture

🚀 Other Projects
🏋️ AI Fitness Tracker

AI-powered fitness coaching system using Computer Vision, MediaPipe Pose, and ML models for real-time workout tracking and posture correction.

📊 Construction Management Dashboard

Role-based analytics dashboard built using React and modern UI frameworks to monitor construction workflows and project progress.

⭐ Support the Project

If you find this project useful:

⭐ Star the repository

🍴 Fork the project

🛠 Contribute improvements

📢 Share with others

📬 Contact

For collaborations, improvements, or queries:

📧 rahulgunda206@gmail.com

Special thanks to all contributors and developers improving campus transportation technology.
