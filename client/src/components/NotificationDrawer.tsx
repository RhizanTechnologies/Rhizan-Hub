'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { AppNotification, NotificationType } from '@/types';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Target,
  UserPlus,
  Trophy,
  CheckSquare,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Clock,
  Briefcase,
  CheckCircle2,
  Calendar,
  DollarSign,
  Flame,
  Zap,
  Info,
  ChevronRight,
  Check,
} from 'lucide-react';

type FilterTab = 'ALL' | 'UNREAD' | 'OUTREACH' | 'TASKS' | 'OPS';

export const NotificationDrawer: React.FC = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    isDrawerOpen,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'UNREAD':
        return notifications.filter((n) => !n.read);
      case 'OUTREACH':
        return notifications.filter((n) =>
          ['OUTREACH_FOLLOWUP', 'OUTREACH_ASSIGNED', 'DEAL_WON'].includes(n.type)
        );
      case 'TASKS':
        return notifications.filter((n) =>
          [
            'TASK_ASSIGNED',
            'TASK_DUE',
            'TASK_REVIEW',
            'TASK_COMMENT',
            'WIP_LIMIT',
            'PROJECT_DEADLINE',
            'PROJECT_ASSIGNED',
            'MILESTONE_COMPLETED',
          ].includes(n.type)
        );
      case 'OPS':
        return notifications.filter((n) =>
          ['CLIENT_MEETING', 'PAYMENT_RECEIVED', 'PAYMENT_DUE', 'STANDUP_REMINDER', 'CAPACITY_ALERT', 'SYSTEM'].includes(
            n.type
          )
        );
      case 'ALL':
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  if (!isDrawerOpen) return null;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'OUTREACH_FOLLOWUP':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'OUTREACH_ASSIGNED':
        return <UserPlus className="w-4 h-4 text-sky-400" />;
      case 'DEAL_WON':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'TASK_ASSIGNED':
        return <CheckSquare className="w-4 h-4 text-teal-400" />;
      case 'TASK_DUE':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'TASK_REVIEW':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'TASK_COMMENT':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'PROJECT_DEADLINE':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'PROJECT_ASSIGNED':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      case 'MILESTONE_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'CLIENT_MEETING':
        return <Calendar className="w-4 h-4 text-teal-400" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_DUE':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'STANDUP_REMINDER':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'CAPACITY_ALERT':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-teal-400" />;
    }
  };

  const getPriorityStyle = (priority: string, read: boolean) => {
    if (read) return 'border-[#222222] bg-[#141414] hover:bg-[#181818]';
    switch (priority) {
      case 'urgent':
        return 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 to-[#181818] hover:border-rose-500/60';
      case 'high':
        return 'border-amber-500/35 bg-gradient-to-r from-amber-950/20 to-[#181818] hover:border-amber-500/50';
      case 'medium':
        return 'border-teal-500/30 bg-gradient-to-r from-teal-950/20 to-[#181818] hover:border-teal-500/50';
      default:
        return 'border-[#282828] bg-[#161616] hover:border-[#383838]';
    }
  };

  const formatRelativeTime = (isoDate: string) => {
    try {
      const now = new Date();
      const past = new Date(isoDate);
      const diffMs = now.getTime() - past.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markAsRead(notif._id);
    }
    closeDrawer();
    if (notif.link && notif.link !== '#') {
      router.push(notif.link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] max-w-full bg-[#111111] border-l border-[#222222] shadow-2xl flex flex-col z-10 transition-transform transform translate-x-0">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#222222] flex items-center justify-between shrink-0 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-white tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">Real-time alerts, follow-ups & workspace updates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="w-8 h-8 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-neutral-400 hover:text-white flex items-center justify-center transition"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Controls Bar */}
        <div className="px-4 py-2 bg-[#121212] border-b border-[#1f1f1f] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-300 font-medium transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          {notifications.some((n) => n.read) && (
            <button
              type="button"
              onClick={clearAllRead}
              className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-rose-400 font-medium transition"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear read</span>
            </button>
          )}
        </div>

        {/* Tabs Filter */}
        <div className="px-4 pt-2.5 pb-2 border-b border-[#1f1f1f] bg-[#121212] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'ALL'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#242424]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'UNREAD'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#242424]'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-400 text-black text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OUTREACH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'OUTREACH'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#242424]'
            }`}
          >
            Follow-ups & Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TASKS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'TASKS'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#242424]'
            }`}
          >
            Tasks & Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OPS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'OPS'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#242424]'
            }`}
          >
            Operations
          </button>
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 mt-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-center text-neutral-500">
                <Bell className="w-5 h-5 opacity-40" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-300">No notifications here</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {activeTab === 'UNREAD'
                    ? "You're all caught up! No unread notifications."
                    : 'Activity, task assignments, and reminders will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative ${getPriorityStyle(
                  notif.priority,
                  notif.read
                )}`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-xs font-bold truncate ${notif.read ? 'text-neutral-300' : 'text-white'}`}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" title="Unread" />
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                      {notif.link && (
                        <span className="text-teal-400/80 group-hover:text-teal-300 flex items-center gap-0.5 transition font-medium">
                          <span>View details</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Card Action Buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    {!notif.read ? (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif._id)}
                        className="p-1 rounded-lg bg-[#202020] text-neutral-400 hover:text-teal-300 hover:bg-[#282828] transition"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => deleteNotification(notif._id)}
                      className="p-1 rounded-lg bg-[#202020] text-neutral-400 hover:text-rose-400 hover:bg-[#282828] transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
