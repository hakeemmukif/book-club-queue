export interface EventFormData {
  title: string;
  bookTitle: string;
  bookAuthor?: string;
  location: string;
  date: string;
  totalSpots: number;
  waitlistEnabled: boolean;
  waitlistLimit?: number;
  description?: string;
}

export interface RegistrationFormData {
  name: string;
  instagramHandle: string;
}

export interface EventWithStats {
  id: string;
  title: string;
  bookTitle: string;
  bookAuthor: string | null;
  location: string;
  date: Date;
  totalSpots: number;
  waitlistEnabled: boolean;
  waitlistLimit: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  confirmedCount: number;
  waitlistCount: number;
  spotsLeft: number;
}

export interface RegistrationWithEvent {
  id: string;
  eventId: string;
  name: string;
  instagramHandle: string;
  status: string;
  position: number | null;
  createdAt: Date;
}
