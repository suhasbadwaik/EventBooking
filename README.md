# 🎉 EventBooking – Full Stack Event Management & Venue Booking Platform

EventBooking is a production-grade full-stack web application designed to simplify the complete event booking workflow.  
The platform enables users to discover venues, check availability, make secure bookings and payments, while venue owners can manage listings, schedules, and bookings — all with robust admin control.

Built using Spring Boot + React + MySQL, following RESTful architecture, JWT authentication, and role-based authorization for scalability, security, and maintainability.

---

## ✨ Key Features

### 👤 User Module
- Secure registration & login (JWT authentication)
- Browse venues and availability in real time
- Book events and manage bookings
- Online payment integration
- Profile and booking history management

### 🏢 Venue Owner Module
- Add and manage venue listings
- Set availability schedules and pricing
- View and manage bookings
- Owner dashboard

### 🛠 Admin Module
- Manage users and venue owners
- Monitor bookings & platform activity
- System control & oversight

---

## 🔐 Security & Performance

- JWT-based authentication
- Role-based access control (USER, OWNER, ADMIN)
- Secure REST APIs
- Optimized database operations using Hibernate & JPA

---

## 🏗️ System Architecture

Frontend (React)  →  Spring Boot REST APIs  →  MySQL Database  
UI Layer          Service Layer            Data Layer  

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security (JWT)
- Hibernate / JPA
- MySQL
- Maven

### Frontend
- React (TypeScript)
- Vite
- Axios
- HTML5, CSS3

### Tools & Platforms
- Git & GitHub
- Postman
- Spring Tool Suite (STS)
- VS Code

---

## 📂 Project Structure

EventBooking  
 ├── Backend   → Spring Boot REST API  
 ├── Frontend  → React Frontend Application  
 └── README.md  

---

## ⚙️ Setup & Installation

### Backend (Spring Boot)

```bash
cd Backend
mvn clean install
mvn spring-boot:run
