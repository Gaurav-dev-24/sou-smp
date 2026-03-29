// src/types/content.ts

export type Event = {
    id: string;
    title: string;
    date: string;
    description: string;
    learnMore?: string;
    location: string;
    imageUrl: string;
    ieeeCount?: number;
    nonIeeeCount?: number;
  };
export type Award = {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    imageUrl: string;
    winners: string; // Could be a list or comma-separated string based on your data structure
    location: string;
    recipient?: string;
    pdfUrl?: string; // For Newsletters to display directly
  };

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  education?: string;
  category: 'Faculty Advisor' | 'Advisory Board' | 'Executive Committee' | 'Core Committee';
  linkedIn?: string;
  imageUrl?: string;
  year?: number;
}

export interface JourneyItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
