# Entity-Relationship Diagram

## ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ VENUE : "owns"
    USER ||--o{ BOOKING : "books"
    VENUE ||--o{ AVAILABILITY : "has"
    VENUE ||--o{ BOOKING : "booked_for"
    AVAILABILITY ||--|| BOOKING : "reserves"

    USER {
        bigint id PK
        string email UK "unique"
        string password
        string firstName
        string lastName
        enum role "CUSTOMER, VENUE_OWNER, ADMIN"
        string phoneNumber
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    VENUE {
        bigint id PK
        string name
        string description "max 1000 chars"
        string address
        string city
        string state
        string zipCode
        double pricePerHour
        int capacity
        bigint owner_id FK
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    AVAILABILITY {
        bigint id PK
        bigint venue_id FK
        datetime startTime
        datetime endTime
        enum status "AVAILABLE, BOOKED, CANCELLED"
        datetime createdAt
        datetime updatedAt
    }

    BOOKING {
        bigint id PK
        bigint customer_id FK
        bigint venue_id FK
        bigint availability_id FK "unique"
        datetime startTime
        datetime endTime
        double totalAmount
        enum status "PENDING, CONFIRMED, CANCELLED, COMPLETED"
        string razorpayOrderId UK "unique"
        string razorpayPaymentId UK "unique"
        string paymentStatus
        datetime createdAt
        datetime updatedAt
    }
```

## Relationships

1. **USER → VENUE** (One-to-Many)
   - A user (VENUE_OWNER) can own multiple venues
   - A venue belongs to one owner

2. **USER → BOOKING** (One-to-Many)
   - A user (CUSTOMER) can make multiple bookings
   - A booking belongs to one customer

3. **VENUE → AVAILABILITY** (One-to-Many)
   - A venue can have multiple availability slots
   - An availability slot belongs to one venue

4. **VENUE → BOOKING** (One-to-Many)
   - A venue can have multiple bookings
   - A booking is for one venue

5. **AVAILABILITY → BOOKING** (One-to-One)
   - An availability slot can be reserved by one booking
   - A booking reserves one availability slot

## Legend

- **PK** = Primary Key
- **FK** = Foreign Key
- **UK** = Unique Key
- **enum** = Enumeration type
