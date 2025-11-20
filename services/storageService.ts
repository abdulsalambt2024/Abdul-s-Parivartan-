import { User, UserRole, Post, Event, Slide, AttendanceRecord } from '../types';
import * as OTPAuth from 'otpauth';

const KEYS = {
  USER: 'parivartan_user',
  POSTS: 'parivartan_posts',
  EVENTS: 'parivartan_events',
  SLIDES: 'parivartan_slides',
  ATTENDANCE: 'parivartan_attendance',
  ALL_USERS: 'parivartan_all_users'
};

// Mock Initial Data
const INITIAL_SLIDES: Slide[] = [
  {
    id: '1',
    image: 'https://picsum.photos/1200/600?random=1',
    title: 'Welcome to PARIVARTAN',
    description: 'Driving change in our community through innovation and unity.',
  },
  {
    id: '2',
    image: 'https://picsum.photos/1200/600?random=2',
    title: 'Sunday Village Visits',
    description: 'Join us every weekend to make a real difference on the ground.',
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    userId: 'admin',
    userName: 'Abdul Salam',
    userAvatar: 'https://ui-avatars.com/api/?name=Abdul+Salam&background=random',
    type: 'announcement',
    content: 'Welcome to Parivartan! We are excited to launch our new platform.',
    likes: 45,
    comments: [],
    timestamp: Date.now() - 100000,
  }
];

const SUPER_ADMIN_EMAILS = [
  'abdul.salam.bt.2024@miet.ac.in',
  'hayatamr9608@gmail.com'
];

export const storageService = {
  getUser: (): User | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },
  
  setUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    // Update in "database" too
    const all = storageService.getAllUsers();
    const index = all.findIndex(u => u.id === user.id);
    if (index >= 0) {
      all[index] = user;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(all));
    }
  },
  
  clearUser: () => localStorage.removeItem(KEYS.USER),

  getAllUsers: (): User[] => {
    const u = localStorage.getItem(KEYS.ALL_USERS);
    return u ? JSON.parse(u) : [];
  },

  updateUserRole: (userId: string, newRole: UserRole) => {
    const all = storageService.getAllUsers();
    const index = all.findIndex(u => u.id === userId);
    if (index >= 0) {
      all[index].role = newRole;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(all));
      
      // If editing self, update session
      const current = storageService.getUser();
      if (current && current.id === userId) {
        localStorage.setItem(KEYS.USER, JSON.stringify(all[index]));
      }
      return all[index];
    }
    return null;
  },

  getPosts: (): Post[] => {
    const p = localStorage.getItem(KEYS.POSTS);
    return p ? JSON.parse(p) : INITIAL_POSTS;
  },
  
  savePost: (post: Post) => {
    const posts = storageService.getPosts();
    const newPosts = [post, ...posts];
    localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
    return newPosts;
  },

  getEvents: (): Event[] => {
    const e = localStorage.getItem(KEYS.EVENTS);
    return e ? JSON.parse(e) : [];
  },
  
  saveEvent: (event: Event) => {
    const events = storageService.getEvents();
    const newEvents = [...events, event];
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(newEvents));
    return newEvents;
  },

  getSlides: (): Slide[] => {
    const s = localStorage.getItem(KEYS.SLIDES);
    return s ? JSON.parse(s) : INITIAL_SLIDES;
  },
  
  saveSlides: (slides: Slide[]) => {
    localStorage.setItem(KEYS.SLIDES, JSON.stringify(slides));
  },

  getAttendance: (): AttendanceRecord[] => {
    const a = localStorage.getItem(KEYS.ATTENDANCE);
    return a ? JSON.parse(a) : [];
  },

  saveAttendance: (record: AttendanceRecord) => {
    const records = storageService.getAttendance();
    const newRecords = [record, ...records];
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(newRecords));
    return newRecords;
  },

  // 2FA Helpers
  generate2FASecret: () => {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  },

  verify2FAToken: (secret: string, token: string): boolean => {
    if (!secret) return true; // Fail-safe
    const totp = new OTPAuth.TOTP({
      issuer: 'PARIVARTAN',
      label: 'ParivartanUser',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });
    
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  },
  
  // Auth logic simulation
  authenticate: (email: string): { user: User, isNew: boolean } => {
    const allUsers = storageService.getAllUsers();
    let user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    let isNew = false;

    if (!user) {
      isNew = true;
      // Determine Role
      let role = UserRole.USER;
      if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
        role = UserRole.SUPER_ADMIN;
      }

      user = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${email}&background=random`,
        verified: role === UserRole.SUPER_ADMIN,
        bio: '',
        location: '',
        interests: [],
        social: {},
        twoFactorEnabled: false
      };
      
      allUsers.push(user);
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
    } else {
        // Ensure Super Admins always have their role
        if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) && user.role !== UserRole.SUPER_ADMIN) {
            user.role = UserRole.SUPER_ADMIN;
            const idx = allUsers.findIndex(u => u.id === user?.id);
            if (idx !== -1) allUsers[idx] = user;
            localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
        }
    }

    return { user, isNew };
  },

  updateProfile: (userId: string, updates: Partial<User>) => {
    const allUsers = storageService.getAllUsers();
    const idx = allUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      allUsers[idx] = { ...allUsers[idx], ...updates };
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
      
      // Update current session if it matches
      const currentUser = storageService.getUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(KEYS.USER, JSON.stringify(allUsers[idx]));
      }
      return allUsers[idx];
    }
    return null;
  }
};