'use client';

import { useState, useEffect } from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { NotificationSettingsModal } from '@/components/notifications/NotificationSettingsModal';
import { BulkActionsBar } from '@/components/notifications/BulkActionsBar';
import { Bell, CheckCheck, Search, Settings, RefreshCw } from 'lucide-react';
import { NotificationType, NotificationPriority } from '@/types/notifications';

type TabType = 'all' | 'unread' | 'applications' | 'candidates' | 'jobs_pools' | 'system';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, fetchNotifications } = useNotificationsStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh on page focus
    const handleFocus = () => {
      fetchNotifications();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchNotifications]);

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    let filtered = notifications.filter((n) => !n.archived);

    // Tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (activeTab === 'applications') {
      filtered = filtered.filter((n) => n.type.startsWith('application_'));
    } else if (activeTab === 'candidates') {
      filtered = filtered.filter((n) => n.type.startsWith('candidate_'));
    } else if (activeTab === 'jobs_pools') {
      filtered = filtered.filter((n) => 
        n.type.startsWith('job_') || n.type.startsWith('pool_') || n.type.startsWith('interview_')
      );
    } else if (activeTab === 'system') {
      filtered = filtered.filter((n) => 
        n.type.startsWith('team_') || n.type === 'mention' || n.type === 'system_update' || n.type === 'analytics_ready'
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query) ||
        n.entityName?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((n) => n.priority === priorityFilter);
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  // Calculate stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const unreadToday = notifications.filter(
    (n) => !n.read && !n.archived && new Date(n.timestamp) >= todayStart
  ).length;

  const highPriorityCount = notifications.filter(
    (n) => !n.read && !n.archived && n.priority === 'high'
  ).length;

  const tabs = [
    { id: 'all' as TabType, name: 'All', count: notifications.filter((n) => !n.archived).length },
    { id: 'unread' as TabType, name: 'Unread', count: unreadCount },
    { id: 'applications' as TabType, name: 'Applications', count: notifications.filter((n) => !n.archived && n.type.startsWith('application_')).length },
    { id: 'candidates' as TabType, name: 'Candidates', count: notifications.filter((n) => !n.archived && n.type.startsWith('candidate_')).length },
    { id: 'jobs_pools' as TabType, name: 'Jobs & Pools', count: notifications.filter((n) => !n.archived && (n.type.startsWith('job_') || n.type.startsWith('pool_') || n.type.startsWith('interview_'))).length },
    { id: 'system' as TabType, name: 'System', count: notifications.filter((n) => !n.archived && (n.type.startsWith('team_') || n.type === 'mention' || n.type === 'system_update' || n.type === 'analytics_ready')).length },
  ];

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gunmetal dark:text-peach flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-sage mt-1">Stay updated with your recruitment activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gunmetal dark:text-peach hover:bg-sage/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gunmetal dark:text-peach hover:bg-sage/10 rounded-lg transition-colors"
            title="Notification Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-tangerine text-white rounded-lg hover:bg-tangerine/90 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gunmetal/50 rounded-lg p-6 border border-sage/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sage mb-1">Total Unread</p>
              <p className="text-3xl font-bold text-gunmetal dark:text-peach">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-tangerine/10 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-tangerine" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gunmetal/50 rounded-lg p-6 border border-sage/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sage mb-1">Unread Today</p>
              <p className="text-3xl font-bold text-gunmetal dark:text-peach">{unreadToday}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gunmetal/50 rounded-lg p-6 border border-sage/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sage mb-1">High Priority</p>
              <p className="text-3xl font-bold text-gunmetal dark:text-peach">{highPriorityCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gunmetal/50 rounded-lg border border-sage/10 overflow-hidden">
        <div className="border-b border-sage/10 overflow-x-auto">
          <nav className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedIds([]);
                }}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-tangerine text-tangerine'
                    : 'border-transparent text-sage hover:text-gunmetal dark:hover:text-peach'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-tangerine/10 text-tangerine'
                      : 'bg-sage/10 text-sage'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-sage/10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gunmetal border border-sage/20 rounded-lg text-gunmetal dark:text-peach placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-tangerine/50"
              />
            </div>
            <NotificationFilters
              typeFilter={typeFilter}
              priorityFilter={priorityFilter}
              onTypeChange={setTypeFilter}
              onPriorityChange={setPriorityFilter}
            />
          </div>
          
          {filteredNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-tangerine border-sage/30 rounded focus:ring-tangerine"
              />
              <label htmlFor="select-all" className="text-sm text-sage cursor-pointer">
                Select all ({filteredNotifications.length})
              </label>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-sage/10">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              {unreadCount === 0 && activeTab === 'all' ? (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gunmetal dark:text-peach mb-2">
                    You're all caught up! 🎉
                  </h3>
                  <p className="text-sage">No new notifications at the moment.</p>
                </>
              ) : (
                <>
                  <Bell className="w-16 h-16 text-sage/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gunmetal dark:text-peach mb-2">
                    No notifications found
                  </h3>
                  <p className="text-sage">
                    {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Check back later for updates'}
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isSelected={selectedIds.includes(notification.id)}
                onSelect={() => handleSelectNotification(notification.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <NotificationSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
