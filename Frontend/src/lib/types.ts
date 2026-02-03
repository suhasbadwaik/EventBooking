export type UserRole = 'CUSTOMER' | 'VENUE_OWNER' | 'ADMIN';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  email: string;
  role: UserRole;
  userId: number;
  firstName: string;
  lastName: string;
};

export type UserRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
};

export type UserResponse = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VenueRequest = {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  pricePerHour: number;
  capacity: number;
};

export type VenueResponse = VenueRequest & {
  id: number;
  ownerId: number;
  ownerName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'CANCELLED';

export type AvailabilityRequest = {
  venueId: number;
  startTime: string; // LocalDateTime string, e.g. 2026-01-29T10:00:00
  endTime: string;
};

export type AvailabilityResponse = {
  id: number;
  venueId: number;
  venueName: string;
  startTime: string;
  endTime: string;
  status: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type BookingRequest = {
  availabilityId: number;
};

export type BookingResponse = {
  id: number;
  customerId: number;
  customerName: string;
  venueId: number;
  venueName: string;
  availabilityId: number;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  razorpayOrderId?: string | null;
  paymentStatus?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRequest = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

