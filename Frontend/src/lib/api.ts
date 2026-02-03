import type {
  AvailabilityRequest,
  AvailabilityResponse,
  BookingRequest,
  BookingResponse,
  LoginRequest,
  LoginResponse,
  PaymentRequest,
  UserRequest,
  UserResponse,
  VenueRequest,
  VenueResponse,
  UserRole,
} from './types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  opts: {
    method?: string;
    token?: string | null;
    body?: unknown;
    query?: Record<string, string | number | undefined | null>;
  } = {},
): Promise<T> {
  const url = new URL(API_BASE_URL + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = (payload && (payload.message || payload.error)) ? String((payload as any).message || (payload as any).error) : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
}

export const api = {
  // Auth
  register: (body: UserRequest) => request<UserResponse>('/api/auth/register', { method: 'POST', body }),
  login: (body: LoginRequest) => request<LoginResponse>('/api/auth/login', { method: 'POST', body }),

  // Users (admin + self rules enforced by backend)
  getUsers: (token: string, query?: { searchTerm?: string; role?: UserRole }) =>
    request<UserResponse[]>('/api/users', { token, query }),
  getUserById: (token: string, id: number) => request<UserResponse>(`/api/users/${id}`, { token }),
  createUser: (token: string, body: UserRequest) => request<UserResponse>('/api/users', { method: 'POST', token, body }),
  updateUser: (token: string, id: number, body: UserRequest) =>
    request<UserResponse>(`/api/users/${id}`, { method: 'PUT', token, body }),
  deleteUser: (token: string, id: number) => request<void>(`/api/users/${id}`, { method: 'DELETE', token }),

  // Venues
  getPublicVenues: (query?: { city?: string; searchTerm?: string }) =>
    request<VenueResponse[]>('/api/venues/public/all', { query }),
  getVenueById: (id: number, token: string) => request<VenueResponse>(`/api/venues/${id}`, { token } ),
  getMyVenues: (token: string) => request<VenueResponse[]>('/api/venues/my-venues', { token }),
  createVenue: (token: string, body: VenueRequest) => request<VenueResponse>('/api/venues', { method: 'POST', token, body }),
  updateVenue: (token: string, id: number, body: VenueRequest) =>
    request<VenueResponse>(`/api/venues/${id}`, { method: 'PUT', token, body }),
  deleteVenue: (token: string, id: number) => request<void>(`/api/venues/${id}`, { method: 'DELETE', token }),

  // Availabilities
  getPublicAvailabilities: (venueId: number) =>
    request<AvailabilityResponse[]>(`/api/availabilities/public/venue/${venueId}`),
  getAllSlotsForVenue: (token: string, venueId: number) =>
    request<AvailabilityResponse[]>(`/api/availabilities/venue/${venueId}`, { token }),
  createAvailability: (token: string, body: AvailabilityRequest) =>
    request<AvailabilityResponse>('/api/availabilities', { method: 'POST', token, body }),
  deleteAvailability: (token: string, id: number) =>
    request<void>(`/api/availabilities/${id}`, { method: 'DELETE', token }),
  getAvailabilityById: (token: string, id: number) => request<AvailabilityResponse>(`/api/availabilities/${id}`, { token }),

  // Bookings
  createBooking: (token: string, body: BookingRequest) =>
    request<BookingResponse>('/api/bookings', { method: 'POST', token, body }),
  confirmPayment: (token: string, body: PaymentRequest) =>
    request<BookingResponse>('/api/bookings/confirm-payment', { method: 'POST', token, body }),
  cancelBooking: (token: string, id: number) => request<void>(`/api/bookings/${id}`, { method: 'DELETE', token }),
  getMyBookings: (token: string) => request<BookingResponse[]>('/api/bookings/my-bookings', { token }),
  getBookingsByVenue: (token: string, venueId: number) =>
    request<BookingResponse[]>(`/api/bookings/venue/${venueId}`, { token }),
  getBookingById: (token: string, id: number) => request<BookingResponse>(`/api/bookings/${id}`, { token }),
};

