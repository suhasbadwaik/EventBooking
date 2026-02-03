# Activity Diagrams

## 1) User Authentication (Register + Login + JWT)

```mermaid
flowchart TD
  A([Start]) --> B{New user?}
  B -->|Yes| C[Enter registration details]
  C --> D[POST /api/auth/register or /api/users/register]
  D --> E{Email exists?}
  E -->|Yes| F[Error: Email already exists] --> Z([End])
  E -->|No| G[Encode password + Save user active=true]
  G --> H[200 OK UserResponse]
  H --> I[User enters email + password]
  B -->|No| I

  I --> J[POST /api/auth/login]
  J --> K[authenticationManager.authenticate]
  K -->|Invalid| L[401 Unauthorized] --> Z
  K -->|Valid| M[Find user by email]
  M --> N{user.active?}
  N -->|No| O[Error: inactive account] --> Z
  N -->|Yes| P[jwtUtil.generateToken]
  P --> Q[200 OK LoginResponse(token)]
  Q --> R[Use Bearer token for protected APIs]
  R --> Z
```

## 2) Venue Management (Create / Update / Delete / My Venues)

```mermaid
flowchart TD
  A([Start]) --> B[Bearer token (VENUE_OWNER/ADMIN)]
  B --> C{Action}
  C -->|Create| D[POST /api/venues]
  D --> E[Extract ownerId from token]
  E --> F[createVenue -> save venue]
  F --> G[200 OK VenueResponse] --> Z([End])

  C -->|Update| H[PUT /api/venues/{id}]
  H --> I[Find venue + current user]
  I --> J{Owner or Admin?}
  J -->|No| K[Error: no permission] --> Z
  J -->|Yes| L[Update fields + save] --> M[200 OK VenueResponse] --> Z

  C -->|Delete| N[DELETE /api/venues/{id}]
  N --> O[Find venue + current user]
  O --> P{Owner or Admin?}
  P -->|No| Q[Error: no permission] --> Z
  P -->|Yes| R[Delete venue] --> S[204 No Content] --> Z

  C -->|My venues| T[GET /api/venues/my-venues]
  T --> U[getVenuesByOwner] --> V[200 OK List<VenueResponse>] --> Z
```

## 3) Availability Scheduling (Create / Delete / View Slots)

```mermaid
flowchart TD
  A([Start]) --> B{Action}

  B -->|Create| C[POST /api/availabilities]
  C --> D[Find venue + current user]
  D --> E{Owner or Admin?}
  E -->|No| F[Error: no permission] --> Z([End])
  E -->|Yes| G{startTime < endTime?}
  G -->|No| H[Error: invalid time] --> Z
  G -->|Yes| I{startTime in future?}
  I -->|No| J[Error: must be future] --> Z
  I -->|Yes| K{Overlaps existing slot?}
  K -->|Yes| L[Error: overlaps] --> Z
  K -->|No| M[Save Availability status=AVAILABLE] --> N[200 OK AvailabilityResponse] --> Z

  B -->|Delete| O[DELETE /api/availabilities/{id}]
  O --> P[Find availability + current user]
  P --> Q{Owner or Admin?}
  Q -->|No| R[Error: no permission] --> Z
  Q -->|Yes| S{status == BOOKED?}
  S -->|Yes| T[Error: cannot delete booked slot] --> Z
  S -->|No| U[Delete availability] --> V[204 No Content] --> Z

  B -->|View| W{Public or Owner/Admin}
  W -->|Public| X[GET /public/venue/{venueId} -> available from now]
  W -->|Owner/Admin| Y[GET /venue/{venueId} -> all slots]
  X --> AA[200 OK slots] --> Z
  Y --> AB[200 OK slots] --> Z
```

## 4) Venue Search (Public)

```mermaid
flowchart TD
  A([Start]) --> B[GET /api/venues/public/all?city&searchTerm]
  B --> C{city or searchTerm present?}
  C -->|Yes| D[venueRepository.searchVenues] --> E[200 OK filtered venues] --> Z([End])
  C -->|No| F[venueRepository.findByActive(true)] --> G[200 OK all active venues] --> Z
```

## 5) Booking & Payment (Create booking + Razorpay order + Confirm payment)

```mermaid
flowchart TD
  A([Start]) --> B[POST /api/bookings (availabilityId)]
  B --> C[Find availability]
  C --> D{availability AVAILABLE?}
  D -->|No| E[Error: slot not available] --> Z([End])
  D -->|Yes| F{startTime >= now?}
  F -->|No| G[Error: cannot book past slot] --> Z
  F -->|Yes| H[Calculate totalAmount]
  H --> I[Create booking status=PENDING]
  I --> J[Mark availability = BOOKED]
  J --> K[razorpayService.createOrder]
  K -->|Fail| L[Error: payment order creation failed] --> Z
  K -->|OK| M[Save razorpayOrderId + return BookingResponse]

  M --> N[Client pays on Razorpay]
  N --> O[POST /api/bookings/confirm-payment]
  O --> P[verifyPayment(signature)]
  P -->|Valid| Q[Set SUCCESS + status CONFIRMED] --> R[200 OK confirmed] --> Z
  P -->|Invalid| S[Set FAILED + status CANCELLED]
  S --> T[Release availability = AVAILABLE]
  T --> U[Error: payment verification failed] --> Z
```

## 6) Booking Cancellation

```mermaid
flowchart TD
  A([Start]) --> B[DELETE /api/bookings/{id}]
  B --> C[Find booking + current user]
  C --> D{Customer or Admin?}
  D -->|No| E[Error: no permission] --> Z([End])
  D -->|Yes| F{Already CANCELLED or COMPLETED?}
  F -->|Yes| G[Error: cannot cancel] --> Z
  F -->|No| H[Release availability = AVAILABLE]
  H --> I[Set booking status=CANCELLED]
  I --> J[204 No Content] --> Z
```

## (Older) Login Activity (based on `AuthController` → `AuthServiceImpl` → Spring Security AuthManager → `JwtUtil`)

```mermaid
flowchart TD
  A([Start]) --> B[User enters email + password]
  B --> C[POST /api/auth/login]
  C --> D[AuthController.login]
  D --> E[AuthServiceImpl.login]
  E --> F[authenticationManager.authenticate]
  F -->|Invalid credentials| X[401 Unauthorized] --> Z([End])
  F -->|OK| G[userRepository.findByEmail]
  G -->|Not found| Y[Error: User not found] --> Z
  G -->|Found| H{user.active?}
  H -->|No| I[Error: User account is inactive] --> Z
  H -->|Yes| J[jwtUtil.generateToken(email, role, userId)]
  J --> K[Build LoginResponse]
  K --> L[200 OK + token]
  L --> Z([End])
```

## User Profile Activity (GET/PUT `/api/users/{id}` with JWT + role/self checks)

```mermaid
flowchart TD
  A([Start]) --> B[Client calls /api/users/{id} (GET or PUT)]
  B --> C[JwtAuthenticationFilter checks Authorization header]
  C --> D{Bearer token present?}
  D -->|No| E[No auth set] --> F{PreAuthorize passes?}
  D -->|Yes| G[Extract token + getEmailFromToken]
  G --> H{validateToken?}
  H -->|No| E
  H -->|Yes| I[loadUserByUsername + set SecurityContext] --> F

  F -->|No| P[403 Forbidden] --> Z([End])
  F -->|Yes| J[UserController getUserIdFromToken]
  J --> K{ROLE_ADMIN?}
  K -->|Yes| L[Allowed] --> M{Method}
  K -->|No| N{currentUserId == {id}?}
  N -->|No| O[Error: only own profile] --> Z
  N -->|Yes| L --> M

  M -->|GET| Q[userManagementService.getUserById] --> R[200 OK UserResponse] --> Z
  M -->|PUT| S[userManagementService.updateUser] --> T[200 OK UserResponse] --> Z
```

## PlantUML Source Files

- `docs/diagrams/01-user-authentication.puml`
- `docs/diagrams/02-venue-management.puml`
- `docs/diagrams/03-availability-scheduling.puml`
- `docs/diagrams/04-venue-search.puml`
- `docs/diagrams/05-booking-and-payment.puml`
- `docs/diagrams/06-booking-cancellation.puml`
- `docs/diagrams/login-activity.puml` (older, login-only)
- `docs/diagrams/user-profile-activity.puml` (older, user profile)

