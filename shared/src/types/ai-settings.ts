export interface ServiceItem {
  name: string;
  description: string;
  price: string;
  duration: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface AISettings {
  id: string;
  businessName: string;
  services: ServiceItem[];
  businessHours: string;
  location: string;
  faqs: FaqItem[];
  bookingInstructions: string;
  aiGreeting: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateAISettingsInput = Omit<AISettings, 'id' | 'createdAt' | 'updatedAt'>;
