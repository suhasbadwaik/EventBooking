<<<<<<< HEAD
# Event Management System

A comprehensive Spring Boot backend application for managing events, venues, bookings, and payments.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **MySQL** (Database)
- **Flyway** (Database Migration)
- **JWT** (Authentication & Authorization)
- **Razorpay** (Payment Integration)
- **Maven** (Build Tool)

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Customer, Venue Owner, Admin)
- Secure password encryption using BCrypt

### User Management
- User registration and login
- CRUD operations for users
- User search functionality
- Admin can manage all users

### Venue Management
- Venue owners can add, update, and delete venues
- Venue search by city and keywords
- Public venue listing for customers

### Availability Management
- Venue owners can add/remove availability slots
- Automatic filtering of past and booked slots
- Real-time availability status

### Booking Management
- Customers can book available slots
- Booking status tracking (Pending, Confirmed, Cancelled, Completed)
- Automatic slot reservation on booking
- Booking cancellation with slot release

### Payment Integration
- Razorpay payment gateway integration
- Payment verification
- Order creation and payment confirmation

## Project Structure

```
src/
├── main/
│   ├── java/com/eventmanagement/
│   │   ├── controller/          # REST Controllers
│   │   ├── service/             # Business Logic
│   │   ├── repository/          # Data Access Layer
│   │   ├── entity/              # JPA Entities
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── security/            # Security Configuration
│   │   ├── util/                # Utility Classes
│   │   └── exception/           # Exception Handlers
│   └── resources/
│       ├── application.properties
│       └── db/migration/        # Flyway Migrations
└── pom.xml
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Razorpay account (for payment integration)

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE event_management;
```

2. Update `application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_management
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Razorpay Configuration

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your Key ID and Key Secret from the dashboard
3. Update `application.properties`:
```properties
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret
```

### JWT Configuration

Update the JWT secret in `application.properties`:
```properties
jwt.secret=your-strong-secret-key-change-this-in-production
jwt.expiration=86400000  # 24 hours in milliseconds
```

### Running the Application

1. Clone the repository
2. Navigate to the project directory
3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users (Admin only, except own profile)
- `GET /api/users` - Get all users (with optional search and role filter)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (Admin only)

### Venues
- `GET /api/venues/public/all` - Get all active venues (public)
- `GET /api/venues/{id}` - Get venue by ID
- `GET /api/venues/my-venues` - Get venues owned by logged-in user
- `POST /api/venues` - Create venue (Venue Owner/Admin)
- `PUT /api/venues/{id}` - Update venue (Owner/Admin)
- `DELETE /api/venues/{id}` - Delete venue (Owner/Admin)

### Availabilities
- `GET /api/availabilities/public/venue/{venueId}` - Get available slots for a venue (public)
- `GET /api/availabilities/venue/{venueId}` - Get all availabilities for a venue (Owner/Admin)
- `GET /api/availabilities/{id}` - Get availability by ID
- `POST /api/availabilities` - Create availability (Venue Owner/Admin)
- `DELETE /api/availabilities/{id}` - Delete availability (Owner/Admin)

### Bookings
- `GET /api/bookings/my-bookings` - Get bookings by logged-in customer
- `GET /api/bookings/venue/{venueId}` - Get bookings for a venue (Owner/Admin)
- `GET /api/bookings/{id}` - Get booking by ID
- `POST /api/bookings` - Create booking (Customer/Admin)
- `POST /api/bookings/confirm-payment` - Confirm payment (Customer/Admin)
- `DELETE /api/bookings/{id}` - Cancel booking (Customer/Admin)

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "phoneNumber": "1234567890"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "customer@example.com",
  "role": "CUSTOMER",
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe"
}
```

### Create Venue
```json
POST /api/venues
Authorization: Bearer {token}
{
  "name": "Grand Hall",
  "description": "A spacious hall for events",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "pricePerHour": 5000.00,
  "capacity": 200
}
```

### Create Availability
```json
POST /api/availabilities
Authorization: Bearer {token}
{
  "venueId": 1,
  "startTime": "2024-12-25T10:00:00",
  "endTime": "2024-12-25T14:00:00"
}
```

### Create Booking
```json
POST /api/bookings
Authorization: Bearer {token}
{
  "availabilityId": 1
}

Response includes razorpayOrderId for payment
```

### Confirm Payment
```json
POST /api/bookings/confirm-payment
Authorization: Bearer {token}
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

## Business Rules

1. **Slot Booking**: Only one customer can book a single availability slot
2. **Past Slots**: Past slots are automatically filtered and not available for booking
3. **Booked Slots**: Booked slots are not visible in public availability listings
4. **Admin Access**: Admin can perform all operations regardless of ownership
5. **Ownership**: Venue owners can only manage their own venues and availabilities
6. **Payment**: Booking requires payment confirmation via Razorpay

## Security Features

- Password encryption using BCrypt
- JWT token-based authentication
- Role-based authorization
- SQL injection prevention (JPA)
- Input validation
- CORS configuration

## Database Migrations

Flyway automatically runs migrations on application startup. The initial migration (`V1__Initial_schema.sql`) creates all necessary tables.

## Error Handling

The application includes global exception handling that returns appropriate HTTP status codes and error messages.

## Notes

- Ensure MySQL is running before starting the application
- The database will be created automatically if it doesn't exist (based on configuration)
- JWT tokens expire after 24 hours (configurable)
- All timestamps are in UTC
- Payment amounts are in INR (Indian Rupees)

## License

This project is for educational/demonstration purposes.
=======
# EventBooking
this is a supper cool eventbooking application on which we are working
<br>
make by Shivam Parashar
>>>>>>> 399fc734a77fdeeca2f81b05280d95fd0feb4e1e
