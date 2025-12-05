export type NotificationType = 
  | 'application_new'
  | 'application_status_change'
  | 'application_withdrawn'
  | 'application_deadline'
  | 'candidate_new'
  | 'candidate_profile_updated'
  | 'candidate_job_viewed'
  | 'candidate_high_match'
  | 'job_expiring'
  | 'job_target_reached'
  | 'job_milestone'
  | 'pool_candidate_added'
  | 'pool_candidate_removed'
  | 'pool_shared'
  | 'pool_smart_update'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'interview_completed'
  | 'interview_rescheduled'
  | 'team_pool_shared'
  | 'team_job_shared'
  | 'mention'
  | 'system_update'
  | 'analytics_ready';

export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  entityType?: 'application' | 'candidate' | 'job' | 'pool' | 'interview';
  entityId?: string;
  entityName?: string;
  avatar?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  emailNotifications: {
    [key in NotificationType]: boolean;
  };
  pushNotifications: {
    [key in NotificationType]: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  priorityThreshold: NotificationPriority;
}

export interface NotificationGroup {
  type: NotificationType;
  entityType?: string;
  entityId?: string;
  notifications: Notification[];
  count: number;
  latestTimestamp: Date;
}
