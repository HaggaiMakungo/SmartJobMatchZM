import { 
  FileText, 
  UserPlus, 
  Eye, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Target,
  Trophy,
  FolderHeart,
  UserMinus,
  Share2,
  Sparkles,
  Bell,
  Users,
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react';
import { NotificationType } from '@/types/notifications';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

export function NotificationIcon({ type, className = 'w-5 h-5' }: NotificationIconProps) {
  const iconMap: Record<NotificationType, any> = {
    application_new: FileText,
    application_status_change: CheckCircle2,
    application_withdrawn: AlertCircle,
    application_deadline: Clock,
    candidate_new: UserPlus,
    candidate_profile_updated: Settings,
    candidate_job_viewed: Eye,
    candidate_high_match: TrendingUp,
    job_expiring: Clock,
    job_target_reached: Target,
    job_milestone: Trophy,
    pool_candidate_added: UserPlus,
    pool_candidate_removed: UserMinus,
    pool_shared: Share2,
    pool_smart_update: Sparkles,
    interview_scheduled: Calendar,
    interview_reminder: Bell,
    interview_completed: CheckCircle2,
    interview_rescheduled: Calendar,
    team_pool_shared: Share2,
    team_job_shared: Briefcase,
    mention: MessageSquare,
    system_update: Settings,
    analytics_ready: BarChart3,
  };

  const Icon = iconMap[type] || Bell;
  
  const colorMap: Record<NotificationType, string> = {
    application_new: 'text-tangerine',
    application_status_change: 'text-green-600',
    application_withdrawn: 'text-red-600',
    application_deadline: 'text-tangerine',
    candidate_new: 'text-blue-600',
    candidate_profile_updated: 'text-sage',
    candidate_job_viewed: 'text-sage',
    candidate_high_match: 'text-green-600',
    job_expiring: 'text-tangerine',
    job_target_reached: 'text-green-600',
    job_milestone: 'text-tangerine',
    pool_candidate_added: 'text-blue-600',
    pool_candidate_removed: 'text-red-600',
    pool_shared: 'text-blue-600',
    pool_smart_update: 'text-tangerine',
    interview_scheduled: 'text-blue-600',
    interview_reminder: 'text-tangerine',
    interview_completed: 'text-green-600',
    interview_rescheduled: 'text-tangerine',
    team_pool_shared: 'text-blue-600',
    team_job_shared: 'text-blue-600',
    mention: 'text-tangerine',
    system_update: 'text-sage',
    analytics_ready: 'text-blue-600',
  };

  return <Icon className={`${className} ${colorMap[type]}`} />;
}
