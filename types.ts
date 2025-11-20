
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  USER = 'USER'
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
}

export interface Badge {
  type: 'gold' | 'silver' | 'bronze';
  month: string; // Format YYYY-MM
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  verified?: boolean;
  // Profile additions
  bio?: string;
  location?: string;
  interests?: string[];
  social?: SocialLinks;
  // Security
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  notificationsEnabled?: boolean;
  badges?: Badge[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'achievement' | 'announcement' | 'general';
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string; // For group chat
  text: string;
  image?: string; // Added for image sharing
  timestamp: number;
  isSystem?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  verified: boolean;
  isGroup?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image?: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
}

export interface AttendanceEntry {
    userId: string;
    userName: string;
    status: 'present' | 'absent';
}

export interface AttendanceSession {
  date: string; // YYYY-MM-DD
  villageName: string; // Optional context
  entries: AttendanceEntry[];
  markedBy: string;
  submitted: boolean;
}

export interface StartupConfig {
  enabled: boolean;
  title: string;
  message: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'like' | 'comment' | 'mention' | 'system';
    content: string;
    read: boolean;
    timestamp: number;
}
