import { create } from 'zustand';
import { Notification, NotificationSettings, NotificationType, NotificationPriority } from '@/types/notifications';

interface NotificationsStore {
  notifications: Notification[];
  settings: NotificationSettings;
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  snoozeNotification: (id: string, duration: number) => void;
  bulkMarkAsRead: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  fetchNotifications: () => Promise<void>;
}

// Default notification settings
const defaultSettings: NotificationSettings = {
  emailNotifications: {
    application_new: true,
    application_status_change: true,
    application_withdrawn: true,
    application_deadline: true,
    candidate_new: true,
    candidate_profile_updated: false,
    candidate_job_viewed: false,
    candidate_high_match: true,
    job_expiring: true,
    job_target_reached: true,
    job_milestone: true,
    pool_candidate_added: false,
    pool_candidate_removed: false,
    pool_shared: true,
    pool_smart_update: false,
    interview_scheduled: true,
    interview_reminder: true,
    interview_completed: true,
    interview_rescheduled: true,
    team_pool_shared: true,
    team_job_shared: true,
    mention: true,
    system_update: false,
    analytics_ready: true,
  },
  pushNotifications: {
    application_new: true,
    application_status_change: true,
    application_withdrawn: true,
    application_deadline: true,
    candidate_new: false,
    candidate_profile_updated: false,
    candidate_job_viewed: false,
    candidate_high_match: true,
    job_expiring: true,
    job_target_reached: false,
    job_milestone: true,
    pool_candidate_added: false,
    pool_candidate_removed: false,
    pool_shared: true,
    pool_smart_update: false,
    interview_scheduled: true,
    interview_reminder: true,
    interview_completed: true,
    interview_rescheduled: true,
    team_pool_shared: true,
    team_job_shared: true,
    mention: true,
    system_update: true,
    analytics_ready: true,
  },
  frequency: 'realtime',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  priorityThreshold: 'low',
};

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  settings: defaultSettings,
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      archived: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAsUnread: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: false } : n
      ),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  archiveNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, archived: true, read: true } : n
        ),
        unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  snoozeNotification: (id, duration) => {
    // For now, just archive it - in production, you'd reschedule
    get().archiveNotification(id);
  },

  bulkMarkAsRead: (ids) => {
    set((state) => {
      const unreadIds = new Set(
        state.notifications.filter((n) => ids.includes(n.id) && !n.read).map((n) => n.id)
      );
      return {
        notifications: state.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - unreadIds.size),
      };
    });
  },

  bulkDelete: (ids) => {
    set((state) => {
      const unreadCount = state.notifications.filter(
        (n) => ids.includes(n.id) && !n.read
      ).length;
      return {
        notifications: state.notifications.filter((n) => !ids.includes(n.id)),
        unreadCount: Math.max(0, state.unreadCount - unreadCount),
      };
    });
  },

  bulkArchive: (ids) => {
    set((state) => {
      const unreadCount = state.notifications.filter(
        (n) => ids.includes(n.id) && !n.read
      ).length;
      return {
        notifications: state.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, archived: true, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - unreadCount),
      };
    });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  fetchNotifications: async () => {
    // TODO: Replace with actual API call
    // For now, generate mock data
    const mockNotifications = generateMockNotifications();
    const unreadCount = mockNotifications.filter((n) => !n.read).length;
    
    set({
      notifications: mockNotifications,
      unreadCount,
    });
  },
}));

// Mock data generator
function generateMockNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: 'notif_1',
      type: 'application_new',
      priority: 'high',
      title: 'New Application',
      message: 'John Doe applied to Senior Frontend Developer',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      archived: false,
      entityType: 'application',
      entityId: 'app_123',
      entityName: 'Senior Frontend Developer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      actionUrl: '/dashboard/applications',
    },
    {
      id: 'notif_2',
      type: 'candidate_high_match',
      priority: 'high',
      title: 'Perfect Match Found',
      message: 'Sarah Johnson (95% match) is available for Backend Developer',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      archived: false,
      entityType: 'candidate',
      entityId: 'cand_456',
      entityName: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      actionUrl: '/dashboard/candidates',
    },
    {
      id: 'notif_3',
      type: 'interview_reminder',
      priority: 'high',
      title: 'Interview Tomorrow',
      message: 'Interview with Michael Chen scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      archived: false,
      entityType: 'interview',
      entityId: 'int_789',
      entityName: 'Michael Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      actionUrl: '/dashboard/applications',
    },
    {
      id: 'notif_4',
      type: 'application_status_change',
      priority: 'medium',
      title: 'Application Updated',
      message: 'Emily Brown moved to Interview stage',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      archived: false,
      entityType: 'application',
      entityId: 'app_234',
      entityName: 'Emily Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      actionUrl: '/dashboard/applications',
    },
    {
      id: 'notif_5',
      type: 'pool_shared',
      priority: 'medium',
      title: 'Talent Pool Shared',
      message: 'Jane Smith shared "Frontend Stars" pool with you',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      archived: false,
      entityType: 'pool',
      entityId: 'pool_345',
      entityName: 'Frontend Stars',
      actionUrl: '/dashboard/talent-pools',
    },
    {
      id: 'notif_6',
      type: 'analytics_ready',
      priority: 'low',
      title: 'Monthly Analytics Ready',
      message: 'Your October 2025 recruitment analytics report is ready',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      archived: false,
      actionUrl: '/dashboard/analytics',
    },
    {
      id: 'notif_7',
      type: 'job_expiring',
      priority: 'high',
      title: 'Job Posting Expiring',
      message: 'Senior Backend Developer posting expires in 3 days',
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      read: false,
      archived: false,
      entityType: 'job',
      entityId: 'job_567',
      entityName: 'Senior Backend Developer',
      actionUrl: '/dashboard/jobs',
    },
  ];
}
