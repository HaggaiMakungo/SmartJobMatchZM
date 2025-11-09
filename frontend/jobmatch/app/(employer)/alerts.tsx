import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/theme';
import { Bell, Users, Calendar, MessageCircle, CheckCircle, Filter } from 'lucide-react-native';

export default function EmployerAlertsScreen() {
  const { isDarkMode } = useThemeStore();
  const colors = getTheme(isDarkMode);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Mock notifications with more variety
  const allNotifications = [
    {
      id: 1,
      type: 'new_applicant',
      title: 'New Applicant',
      message: 'John Phiri applied to Driver Needed',
      time: '5 min ago',
      unread: true,
      icon: Users,
      color: '#10B981',
      action: 'View Application',
    },
    {
      id: 2,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: 'Interview with Sarah Banda tomorrow at 2 PM',
      time: '1 hour ago',
      unread: true,
      icon: Calendar,
      color: '#3B82F6',
      action: 'View Details',
    },
    {
      id: 3,
      type: 'new_message',
      title: 'New Message',
      message: 'Brian Mwale sent you a message',
      time: '3 hours ago',
      unread: true,
      icon: MessageCircle,
      color: '#8B5CF6',
      action: 'Reply',
    },
    {
      id: 4,
      type: 'new_applicant',
      title: '3 New Applicants',
      message: 'Your Wedding Caterer job received 3 new applications',
      time: '5 hours ago',
      unread: false,
      icon: Users,
      color: '#10B981',
      action: 'Review All',
    },
    {
      id: 5,
      type: 'job_expiring',
      title: 'Job Expiring Soon',
      message: 'Shop Cashier position expires in 3 days',
      time: '1 day ago',
      unread: false,
      icon: Bell,
      color: '#F59E0B',
      action: 'Renew',
    },
    {
      id: 6,
      type: 'job_filled',
      title: 'Job Successfully Filled',
      message: 'Congratulations! Gardener position has been filled',
      time: '2 days ago',
      unread: false,
      icon: CheckCircle,
      color: '#10B981',
      action: 'View Details',
    },
    {
      id: 7,
      type: 'interview_reminder',
      title: 'Interview Reminder',
      message: 'You have an interview with Joseph Mwansa at 10 AM today',
      time: '3 days ago',
      unread: false,
      icon: Calendar,
      color: '#3B82F6',
      action: 'Confirmed',
    },
  ];

  const notifications = filter === 'unread' 
    ? allNotifications.filter(n => n.unread)
    : allNotifications;

  const unreadCount = allNotifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    // TODO: Implement mark all as read
    console.log('Mark all as read');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                Alerts
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: colors.accent + '15',
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === 'all' ? colors.actionBox : colors.card,
                borderWidth: 1.5,
                borderColor: filter === 'all' ? colors.actionText : colors.cardBorder,
              }}
            >
              <Text style={{
                color: filter === 'all' ? colors.actionText : colors.textMuted,
                fontSize: 13,
                fontWeight: '600',
              }}>
                All ({allNotifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('unread')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === 'unread' ? colors.actionBox : colors.card,
                borderWidth: 1.5,
                borderColor: filter === 'unread' ? colors.actionText : colors.cardBorder,
              }}
            >
              <Text style={{
                color: filter === 'unread' ? colors.actionText : colors.textMuted,
                fontSize: 13,
                fontWeight: '600',
              }}>
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {notifications.map((notification, index) => {
              const IconComponent = notification.icon;
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1.5,
                    borderColor: notification.unread ? colors.accent + '40' : colors.cardBorder,
                    borderLeftWidth: 4,
                    borderLeftColor: notification.color,
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: notification.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComponent size={24} color={notification.color} strokeWidth={2.5} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={{
                          color: colors.text,
                          fontSize: 15,
                          fontWeight: 'bold',
                          flex: 1,
                        }}>
                          {notification.title}
                        </Text>
                        {notification.unread && (
                          <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.accent,
                          }} />
                        )}
                      </View>

                      <Text style={{
                        color: colors.textMuted,
                        fontSize: 14,
                        marginBottom: 12,
                        lineHeight: 20,
                      }}>
                        {notification.message}
                      </Text>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{
                          color: colors.textMuted,
                          fontSize: 12,
                        }}>
                          {notification.time}
                        </Text>

                        <TouchableOpacity
                          style={{
                            backgroundColor: colors.actionBox,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{
                            color: colors.actionText,
                            fontSize: 12,
                            fontWeight: '600',
                          }}>
                            {notification.action}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View style={{
            paddingHorizontal: 24,
            paddingTop: 100,
            alignItems: 'center',
          }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
            }}>
              <Bell size={40} color={colors.textMuted} strokeWidth={2} />
            </View>
            <Text style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              {filter === 'unread' ? 'All Caught Up!' : 'No Alerts Yet'}
            </Text>
            <Text style={{
              color: colors.textMuted,
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 20,
              paddingHorizontal: 40,
            }}>
              {filter === 'unread' 
                ? "You've read all your notifications.\nKeep up the great work! 👏"
                : "We'll notify you about new applicants,\nmessages, and important updates"
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
