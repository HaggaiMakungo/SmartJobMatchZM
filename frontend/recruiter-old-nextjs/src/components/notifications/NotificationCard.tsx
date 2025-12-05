'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Check, Eye, Trash2, Archive, Clock } from 'lucide-react';
import { Notification } from '@/types/notifications';
import { useNotificationsStore } from '@/store/notificationsStore';
import { NotificationIcon } from '../NotificationIcon';

interface NotificationCardProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: () => void;
}

export function NotificationCard({ notification, isSelected, onSelect }: NotificationCardProps) {
  const router = useRouter();
  const { markAsRead, markAsUnread, deleteNotification, archiveNotification, snoozeNotification } = useNotificationsStore();

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-tangerine',
    low: 'border-l-sage',
  };

  const priorityBadges = {
    high: 'bg-red-500/10 text-red-600 border-red-500/20',
    medium: 'bg-tangerine/10 text-tangerine border-tangerine/20',
    low: 'bg-sage/10 text-sage border-sage/20',
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read) {
      markAsUnread(notification.id);
    } else {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveNotification(notification.id);
  };

  const handleSnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Show snooze options (for now, default to 1 hour)
    snoozeNotification(notification.id, 3600000); // 1 hour in ms
  };

  return (
    <div
      className={`relative p-4 hover:bg-sage/5 transition-colors cursor-pointer border-l-4 ${
        priorityColors[notification.priority]
      } ${!notification.read ? 'bg-peach/5' : ''} ${isSelected ? 'bg-tangerine/5' : ''}`}
      onClick={handleClick}
    >
      <div className="flex gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-4 h-4 text-tangerine border-sage/30 rounded focus:ring-tangerine"
          />
        </div>

        {/* Avatar/Icon */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt=""
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              notification.priority === 'high'
                ? 'bg-red-500/10'
                : notification.priority === 'medium'
                ? 'bg-tangerine/10'
                : 'bg-sage/10'
            }`}>
              <NotificationIcon type={notification.type} className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gunmetal dark:text-peach">
                {notification.title}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${priorityBadges[notification.priority]}`}>
                {notification.priority.toUpperCase()}
              </span>
              {!notification.read && (
                <span className="w-2 h-2 bg-tangerine rounded-full" />
              )}
            </div>
            <span className="text-xs text-sage whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-sage mb-3 line-clamp-2">
            {notification.message}
          </p>

          {notification.entityName && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-sage/5 rounded text-xs text-sage mb-3">
              <span className="font-medium">{notification.entityType}:</span>
              <span>{notification.entityName}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {notification.actionUrl && (
              <button
                onClick={handleClick}
                className="px-3 py-1 text-xs font-medium text-tangerine hover:bg-tangerine/10 rounded transition-colors"
              >
                View Details
              </button>
            )}
            <button
              onClick={handleMarkToggle}
              className="p-1.5 text-sage hover:bg-sage/10 rounded transition-colors"
              title={notification.read ? 'Mark as unread' : 'Mark as read'}
            >
              {notification.read ? <Eye className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSnooze}
              className="p-1.5 text-sage hover:bg-sage/10 rounded transition-colors"
              title="Snooze"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={handleArchive}
              className="p-1.5 text-sage hover:bg-sage/10 rounded transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
