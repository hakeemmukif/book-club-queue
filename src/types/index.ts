export interface EventFormData {
  title: string;
  bookTitle: string;
  bookAuthor?: string;
  location: string;
  date: string;
  totalSpots: number;
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
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  confirmedCount: number;
  spotsLeft: number;
}

export interface RegistrationWithEvent {
  id: string;
  eventId: string;
  name: string;
  email: string;
  instagramHandle: string;
  receiptUrl?: string | null;
  hasReceipt?: boolean;
  status: string;
  createdAt: Date;
}
