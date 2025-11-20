
import { User, UserRole, Post, Event, Slide, AttendanceSession, AttendanceEntry, StartupConfig, ChatMessage, Comment, Badge, Notification } from '../types';
import * as OTPAuth from 'otpauth';

// STORAGE KEYS
const KEYS = {
  USER: 'parivartan_user',
  POSTS: 'parivartan_posts',
  EVENTS: 'parivartan_events',
  SLIDES: 'parivartan_slides',
  ALL_USERS: 'parivartan_all_users',
  ATTENDANCE_SESSIONS: 'parivartan_attendance_sessions',
  STARTUP_MSG: 'parivartan_startup_msg',
  CHAT_PREFIX: 'parivartan_chat_',
  NOTIFICATIONS: 'parivartan_notifications_'
};

// Mock Initial Data for robust start
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
    title: 'Community Impact',
    description: 'Join us to make a real difference on the ground.',
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

const INITIAL_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Village Educational Drive',
        date: '2024-12-10',
        description: 'Teaching basic math and science to children in Rampur.',
        location: 'Rampur Village',
        image: 'https://picsum.photos/800/400?random=10'
    }
];

// Specific Super Admins as requested
const SUPER_ADMIN_EMAILS = [
  'abdul.salam.bt.2024@miet.ac.in',
  'hayatamr9608@gmail.com'
];

export const storageService = {
  getUser: (): User | null => {
    try {
        const u = localStorage.getItem(KEYS.USER);
        return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  
  setUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    // Sync with "database"
    const all = storageService.getAllUsers();
    const index = all.findIndex(u => u.id === user.id);
    if (index >= 0) {
      all[index] = user;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(all));
    }
  },
  
  clearUser: () => localStorage.removeItem(KEYS.USER),

  getAllUsers: (): User[] => {
    try {
        const u = localStorage.getItem(KEYS.ALL_USERS);
        return u ? JSON.parse(u) : [];
    } catch { return []; }
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
        const updatedUser = all[index];
        localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
      }
      return all[index];
    }
    return null;
  },

  getPosts: (): Post[] => {
    try {
        const p = localStorage.getItem(KEYS.POSTS);
        return p ? JSON.parse(p) : INITIAL_POSTS;
    } catch { return INITIAL_POSTS; }
  },
  
  savePost: (post: Post) => {
    const posts = storageService.getPosts();
    const newPosts = [post, ...posts];
    localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
    return newPosts;
  },

  deletePost: (postId: string) => {
    const posts = storageService.getPosts();
    const newPosts = posts.filter(p => p.id !== postId);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
    return newPosts;
  },

  updatePost: (post: Post) => {
    const posts = storageService.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
        posts[index] = post;
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
    return posts;
  },

  addComment: (postId: string, comment: Comment) => {
    const posts = storageService.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index].comments.push(comment);
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
    return posts;
  },

  deleteComment: (postId: string, commentId: string) => {
    const posts = storageService.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index].comments = posts[index].comments.filter(c => c.id !== commentId);
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
    return posts;
  },

  getEvents: (): Event[] => {
    try {
        const e = localStorage.getItem(KEYS.EVENTS);
        return e ? JSON.parse(e) : INITIAL_EVENTS;
    } catch { return INITIAL_EVENTS; }
  },
  
  saveEvent: (event: Event) => {
    const events = storageService.getEvents();
    const newEvents = [...events, event];
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(newEvents));
    return newEvents;
  },

  getSlides: (): Slide[] => {
    try {
        const s = localStorage.getItem(KEYS.SLIDES);
        return s ? JSON.parse(s) : INITIAL_SLIDES;
    } catch { return INITIAL_SLIDES; }
  },
  
  saveSlides: (slides: Slide[]) => {
    localStorage.setItem(KEYS.SLIDES, JSON.stringify(slides));
  },

  // --- ATTENDANCE & BADGE SYSTEM ---
  getAttendanceSessions: (): AttendanceSession[] => {
    try {
        const s = localStorage.getItem(KEYS.ATTENDANCE_SESSIONS);
        return s ? JSON.parse(s) : [];
    } catch { return []; }
  },

  saveAttendanceSession: (session: AttendanceSession) => {
    const sessions = storageService.getAttendanceSessions();
    const index = sessions.findIndex(s => s.date === session.date);
    
    if (index !== -1) {
        sessions[index] = session;
    } else {
        sessions.push(session);
    }
    localStorage.setItem(KEYS.ATTENDANCE_SESSIONS, JSON.stringify(sessions));

    // Recalculate Badges for the month of this session
    const month = session.date.substring(0, 7); // YYYY-MM
    storageService.calculateBadges(month);
    
    return sessions;
  },

  calculateBadges: (month: string) => {
      const sessions = storageService.getAttendanceSessions().filter(s => s.date.startsWith(month) && s.submitted);
      const allUsers = storageService.getAllUsers();
      
      if (sessions.length === 0) return;

      // Count attendance
      const presenceCount: Record<string, number> = {};
      
      sessions.forEach(session => {
          session.entries.forEach(entry => {
              if (entry.status === 'present') {
                  presenceCount[entry.userId] = (presenceCount[entry.userId] || 0) + 1;
              }
          });
      });

      // Sort users by count
      const sortedUsers = Object.entries(presenceCount)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([userId, count]) => ({ userId, count }));

      // Award Badges
      const updatedUsers = allUsers.map(user => {
          // Remove existing badges for this specific month to avoid dupes
          const otherBadges = (user.badges || []).filter(b => b.month !== month);
          
          const rank = sortedUsers.findIndex(u => u.userId === user.id);
          
          if (rank === 0 && sortedUsers[rank].count > 0) {
              otherBadges.push({ type: 'gold', month, label: 'Top Attendee' });
          } else if (rank === 1 && sortedUsers[rank].count > 0) {
              otherBadges.push({ type: 'silver', month, label: '2nd Place' });
          } else if (rank === 2 && sortedUsers[rank].count > 0) {
              otherBadges.push({ type: 'bronze', month, label: '3rd Place' });
          }

          return { ...user, badges: otherBadges };
      });

      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(updatedUsers));
      
      // Sync current session if needed
      const currentUser = storageService.getUser();
      if (currentUser) {
          const updatedCurrent = updatedUsers.find(u => u.id === currentUser.id);
          if (updatedCurrent) localStorage.setItem(KEYS.USER, JSON.stringify(updatedCurrent));
      }
  },

  // Notification System
  getNotifications: (userId: string): Notification[] => {
      try {
          const n = localStorage.getItem(KEYS.NOTIFICATIONS + userId);
          return n ? JSON.parse(n) : [];
      } catch { return []; }
  },

  addNotification: (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const notifications = storageService.getNotifications(userId);
      const newNotif: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false
      };
      localStorage.setItem(KEYS.NOTIFICATIONS + userId, JSON.stringify([newNotif, ...notifications]));
  },
  
  markNotificationsRead: (userId: string) => {
      const notifications = storageService.getNotifications(userId);
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem(KEYS.NOTIFICATIONS + userId, JSON.stringify(updated));
  },

  // Startup Config
  getStartupConfig: (): StartupConfig => {
      try {
          const c = localStorage.getItem(KEYS.STARTUP_MSG);
          return c ? JSON.parse(c) : { enabled: true, title: "Welcome to PARIVARTAN", message: "Together we can make a difference." };
      } catch {
          return { enabled: true, title: "Welcome to PARIVARTAN", message: "Together we can make a difference." };
      }
  },

  saveStartupConfig: (config: StartupConfig) => {
      localStorage.setItem(KEYS.STARTUP_MSG, JSON.stringify(config));
  },

  // Chat Messages
  getChatMessages: (chatId: string): ChatMessage[] => {
      try {
          const m = localStorage.getItem(KEYS.CHAT_PREFIX + chatId);
          return m ? JSON.parse(m) : [];
      } catch { return []; }
  },

  saveChatMessage: (chatId: string, message: ChatMessage) => {
      const msgs = storageService.getChatMessages(chatId);
      const newMsgs = [...msgs, message];
      localStorage.setItem(KEYS.CHAT_PREFIX + chatId, JSON.stringify(newMsgs));
      return newMsgs;
  },

  // 2FA Helpers
  generate2FASecret: () => {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  },

  verify2FAToken: (secret: string, token: string): boolean => {
    if (!secret) return true; // Fail-safe
    try {
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
    } catch (e) {
        console.error("2FA Error", e);
        return false;
    }
  },
  
  // Auth logic simulation with Supabase-like behavior
  authenticate: (email: string): { user: User, isNew: boolean } => {
    const allUsers = storageService.getAllUsers();
    const normalizedEmail = email.toLowerCase().trim();
    let user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    let isNew = false;

    if (!user) {
      isNew = true;
      // Determine Role based on specific list
      let role = UserRole.USER;
      if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
        role = UserRole.SUPER_ADMIN;
      }

      user = {
        id: Date.now().toString(),
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role,
        avatar: `https://ui-avatars.com/api/?name=${normalizedEmail}&background=random`,
        verified: role === UserRole.SUPER_ADMIN, 
        bio: '',
        location: '',
        interests: [],
        social: {},
        twoFactorEnabled: false,
        notificationsEnabled: true
      };
      
      allUsers.push(user);
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
    } else {
        // Enforce Super Admin privileges if email matches, regardless of stored role
        if (SUPER_ADMIN_EMAILS.includes(normalizedEmail) && user.role !== UserRole.SUPER_ADMIN) {
            user.role = UserRole.SUPER_ADMIN;
            // Update storage
            const idx = allUsers.findIndex(u => u.id === user?.id);
            if (idx !== -1) {
                allUsers[idx] = user;
                localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
            }
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
