'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { formatDistanceToNow } from 'date-fns';
import { NotificationIcon } from './NotificationIcon';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotificationsStore();
  
  // Get recent 5 notifications
  const recentNotifications = notifications
    .filter((n) => !n.archived)
    .slice(0, 5);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    markAsRead(notificationId);
    setIsOpen(false);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gunmetal dark:text-peach hover:bg-sage/10 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-tangerine rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sage/10">
            <div>
              <h3 className="font-semibold text-gunmetal dark:text-peach">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-sage">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-sage/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-sage" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-sage/30 mb-2" />
                <p className="text-sage">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-sage/10">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-sage/5 ${
                      !notification.read ? 'bg-peach/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon/Avatar */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.priority === 'high'
                              ? 'bg-tangerine/10'
                              : notification.priority === 'medium'
                              ? 'bg-peach/20'
                              : 'bg-sage/10'
                          }`}>
                            <NotificationIcon type={notification.type} className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm text-gunmetal dark:text-peach line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-tangerine rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-sage line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-sage/70">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-sage/10">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="block w-full py-2 text-center text-sm font-medium text-tangerine hover:text-tangerine/80 transition-colors"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
