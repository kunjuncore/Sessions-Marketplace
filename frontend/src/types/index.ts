export type Role = "USER" | "CREATOR";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: Role;
  created_at: string;
}

export interface Session {
  id: string;
  creator: User;
  title: string;
  description: string;
  price: string;
  image: string | null;
  image_url: string | null;
  duration: number;
  booking_count: number;
  is_booked: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: string;
  user: User;
  session: Session;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface UserDashboard {
  profile: User;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  recent_bookings: Booking[];
  upcoming_bookings: Booking[];
  past_bookings: Booking[];
}

export interface CreatorStats {
  total_sessions: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_revenue: string;
}

export interface CreatorDashboard {
  profile: User;
  stats: CreatorStats;
  recent_sessions: Session[];
  recent_bookings: Booking[];
  top_sessions: Session[];
}

export interface SessionFilters {
  search?: string;
  min_price?: string;
  max_price?: string;
  min_duration?: string;
  max_duration?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
