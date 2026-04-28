<template>
    <header class="app-header">
        <div class="header-left">
            <button v-if="showBack" class="back-btn" @click="goBack">
                <span class="back-icon">&#8592;</span>
                <span>Back</span>
            </button>
            <div class="welcome-section">
                <h2>{{ title }}</h2>
                <p>{{ subtitle }}</p>
            </div>
        </div>

        <div class="top-bar-right">
            <div class="search-container">
                <span class="search-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                </span>
                <input
                    :value="searchQuery"
                    type="text"
                    placeholder="Search"
                    class="search-input"
                    @input="$emit('update:searchQuery', $event.target.value)"
                >
            </div>
            <div class="calendar-wrap">
                <button class="calendar-btn" title="Calendar" @click="toggleCalendar" aria-label="Calendar">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="3" />
                        <path d="M3 10h18" />
                        <path d="M8 3v4M16 3v4" />
                    </svg>
                </button>

                <div v-if="showCalendar" class="calendar-popup">
                    <div class="calendar-popup-header">
                        <button class="calendar-nav-btn" @click="changeMonth(-1)">&#8249;</button>
                        <strong>{{ calendarLabel }}</strong>
                        <button class="calendar-nav-btn" @click="changeMonth(1)">&#8250;</button>
                    </div>

                    <div class="calendar-weekdays">
                        <span v-for="day in weekDays" :key="day">{{ day }}</span>
                    </div>

                    <div class="calendar-grid">
                        <button
                            v-for="day in calendarDays"
                            :key="day.key"
                            class="calendar-day"
                            :class="{ 'is-muted': !day.isCurrentMonth, 'is-today': day.isToday }"
                            @click="selectDate(day)"
                        >
                            {{ day.date.getDate() }}
                        </button>
                    </div>

                    <p class="calendar-selected">{{ selectedDateLabel }}</p>
                </div>
            </div>
            <div class="notif-wrap">
                <button
                    class="notif-btn"
                    :class="{ 'is-active': showNotifications }"
                    title="Notifications"
                    aria-label="Notifications"
                    @click.stop="toggleNotifications"
                >
                    <span v-if="unreadCount" class="notif-badge">{{ unreadBadge }}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 18H5.5a1.5 1.5 0 0 1-1.2-2.4L6 13V10a6 6 0 1 1 12 0v3l1.7 2.6a1.5 1.5 0 0 1-1.2 2.4H15" />
                        <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
                    </svg>
                </button>

                <div v-if="showNotifications" class="notif-popup">
                    <div class="notif-popup-header">
                        <div>
                            <strong>Notifications</strong>
                            <p>{{ unreadSummary }}</p>
                        </div>
                        <button
                            v-if="unreadCount"
                            class="notif-clear-btn"
                            @click="markAllNotificationsAsRead"
                        >
                            Mark all read
                        </button>
                    </div>

                    <div v-if="notificationsLoading" class="notif-state">
                        Loading notifications...
                    </div>

                    <div v-else-if="notificationsError" class="notif-state is-error">
                        {{ notificationsError }}
                    </div>

                    <div v-else-if="!notifications.length" class="notif-state">
                        No notifications yet.
                    </div>

                    <div v-else class="notif-list">
                        <button
                            v-for="notification in notifications"
                            :key="notification.id"
                            class="notif-item"
                            :class="{
                                'is-unread': !isNotificationRead(notification.id),
                                [`severity-${notification.severity || 'info'}`]: true
                            }"
                            @click="openNotification(notification)"
                        >
                            <span class="notif-indicator"></span>
                            <div class="notif-content">
                                <div class="notif-row">
                                    <strong>{{ notification.title }}</strong>
                                    <span>{{ formatRelativeTime(notification.occurred_at) }}</span>
                                </div>
                                <p>{{ notification.message }}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <router-link to="/profile" class="profile-link">
                <div class="user-profile">
                    <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" class="profile-img">
                    <div v-else class="profile-fallback">{{ profileInitials }}</div>
                </div>
                <span class="profile-name">{{ shortName }}</span>
            </router-link>
        </div>
    </header>
</template>

<script>
import axios from 'axios'; 
import { getStoredUser } from '../utils/auth';
import globalState from '../store/globalState';

const DEFAULT_PROFILE = {
    fullName: 'Welcome, User',
    avatar: ''
};

const NOTIFICATION_STORAGE_PREFIX = 'readNotifications';

export default {
    name: 'AppHeader',
    props: {
        title: {
            type: String,
            required: true
        },
        subtitle: {
            type: String,
            default: ''
        },
        showBack: {
            type: Boolean,
            default: false
        },
        searchQuery: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            profile: { ...DEFAULT_PROFILE },
            showCalendar: false,
            showNotifications: false,
            currentMonthDate: new Date(),
            selectedDate: new Date(),
            notifications: [],
            notificationsLoading: false,
            notificationsError: '',
            readNotificationIds: []
        };
    },
    computed: {
        shortName() {
            return this.profile.fullName || 'Profile';
        },
        profileInitials() {
            return this.profile.fullName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() || '')
                .join('') || 'JP';
        },
        weekDays() {
            return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        },
        calendarLabel() {
            return this.currentMonthDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        },
        selectedDateLabel() {
            return `Selected: ${this.selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })}`;
        },
        unreadCount() {
            return this.notifications.filter((notification) => !this.isNotificationRead(notification.id)).length;
        },
        unreadBadge() {
            return this.unreadCount > 9 ? '9+' : String(this.unreadCount);
        },
        unreadSummary() {
            if (!this.notifications.length) {
                return 'No activity yet';
            }

            if (!this.unreadCount) {
                return 'All caught up';
            }

            return `${this.unreadCount} unread notification${this.unreadCount > 1 ? 's' : ''}`;
        },
        calendarDays() {
            const monthStart = new Date(
                this.currentMonthDate.getFullYear(),
                this.currentMonthDate.getMonth(),
                1
            );
            const monthEnd = new Date(
                this.currentMonthDate.getFullYear(),
                this.currentMonthDate.getMonth() + 1,
                0
            );
            const gridStart = new Date(monthStart);
            gridStart.setDate(gridStart.getDate() - gridStart.getDay());

            const gridEnd = new Date(monthEnd);
            gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

            const today = new Date();
            const days = [];
            const cursor = new Date(gridStart);

            while (cursor <= gridEnd) {
                const current = new Date(cursor);
                days.push({
                    key: current.toISOString(),
                    date: current,
                    isCurrentMonth: current.getMonth() === this.currentMonthDate.getMonth(),
                    isToday:
                        current.getDate() === today.getDate() &&
                        current.getMonth() === today.getMonth() &&
                        current.getFullYear() === today.getFullYear()
                });
                cursor.setDate(cursor.getDate() + 1);
            }

            return days;
        }
    },
    methods: {
        getProfileStorageKey() {
            const user = globalState.state.user || getStoredUser();
            return user?.username ? `profileData:${user.username}` : 'profileData';
        },
        loadProfile() {
            const storedUser = globalState.state.user || getStoredUser();
            const profileKey = this.getProfileStorageKey();

            try {
                const savedProfile = JSON.parse(localStorage.getItem(profileKey) || 'null');
                this.profile = {
                    fullName: storedUser?.fullName || savedProfile?.fullName || DEFAULT_PROFILE.fullName,
                    avatar: savedProfile?.avatar || ''
                };
            } catch {
                this.profile = {
                    fullName: storedUser?.fullName || DEFAULT_PROFILE.fullName,
                    avatar: ''
                };
            }
        },
        getNotificationStorageKey() {
            const user = globalState.state.user || getStoredUser();
            const identifier = user?.username || user?.name || 'guest';
            return `${NOTIFICATION_STORAGE_PREFIX}:${identifier}`;
        },
        loadReadNotifications() {
            try {
                const savedIds = JSON.parse(localStorage.getItem(this.getNotificationStorageKey()) || '[]');
                this.readNotificationIds = Array.isArray(savedIds) ? savedIds : [];
            } catch {
                this.readNotificationIds = [];
            }
        },
        saveReadNotifications() {
            localStorage.setItem(this.getNotificationStorageKey(), JSON.stringify(this.readNotificationIds));
        },
        isNotificationRead(notificationId) {
            return this.readNotificationIds.includes(notificationId);
        },
        trimReadNotifications() {
            const activeIds = new Set(this.notifications.map((notification) => notification.id));
            this.readNotificationIds = this.readNotificationIds.filter((notificationId) => activeIds.has(notificationId));
            this.saveReadNotifications();
        },
        async fetchNotifications(force = false) {
        if (this.notificationsLoading) return;
        if (!force && this.notifications.length) return;

        this.notificationsLoading = true;
        this.notificationsError = '';
        
        // Get the token from localStorage
        const token = localStorage.getItem('user_token');

        try {
            // Use full URL and send the Bearer Token
            const { data } = await axios.get('http://127.0.0.1:8000/api/v1/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            this.notifications = Array.isArray(data) ? data : (Array.isArray(data?.notifications) ? data.notifications : []);
            this.trimReadNotifications();
        } catch (error) {
            // If it's a 401, it means your token is expired or missing
            if (error.response?.status === 401) {
                this.notificationsError = 'Please log in again to see notifications.';
            } else {
                this.notificationsError = error?.response?.data?.message || 'Unable to load notifications.';
            }
        } finally {
            this.notificationsLoading = false;
        }
    },
        goBack() {
            if (window.history.length > 1) {
                this.$router.back();
                return;
            }

            this.$router.push('/dashboard');
        },
        toggleCalendar() {
            this.showCalendar = !this.showCalendar;
            if (this.showCalendar) {
                this.showNotifications = false;
            }
        },
        changeMonth(direction) {
            this.currentMonthDate = new Date(
                this.currentMonthDate.getFullYear(),
                this.currentMonthDate.getMonth() + direction,
                1
            );
        },
        async toggleNotifications() {
            this.showNotifications = !this.showNotifications;

            if (!this.showNotifications) {
                return;
            }

            this.showCalendar = false;
            await this.fetchNotifications(true);
        },
        markNotificationAsRead(notificationId) {
            if (this.isNotificationRead(notificationId)) {
                return;
            }

            this.readNotificationIds = [...this.readNotificationIds, notificationId];
            this.saveReadNotifications();
        },
        markAllNotificationsAsRead() {
            this.readNotificationIds = this.notifications.map((notification) => notification.id);
            this.saveReadNotifications();
        },
        openNotification(notification) {
            this.markNotificationAsRead(notification.id);
            this.showNotifications = false;

            if (notification.route && this.$route.path !== notification.route) {
                this.$router.push(notification.route);
            }
        },
        formatRelativeTime(timestamp) {
            if (!timestamp) {
                return 'Just now';
            }

            const date = new Date(timestamp);
            const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
            const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
            const units = [
                ['day', 86400],
                ['hour', 3600],
                ['minute', 60]
            ];

            for (const [unit, seconds] of units) {
                if (Math.abs(diffInSeconds) >= seconds || unit === 'minute') {
                    return formatter.format(Math.round(diffInSeconds / seconds), unit);
                }
            }

            return 'Just now';
        },
        selectDate(day) {
            this.selectedDate = new Date(day.date);
        },
        handleWindowFocus() {
            this.loadProfile();
            this.fetchNotifications(true);
        },
        handleStorageChange() {
            this.loadProfile();
            this.loadReadNotifications();
        },
        handleOutsideClick(event) {
            const calendarElement = this.$el.querySelector('.calendar-wrap');
            if (this.showCalendar && calendarElement && !calendarElement.contains(event.target)) {
                this.showCalendar = false;
            }

            const notificationElement = this.$el.querySelector('.notif-wrap');
            if (this.showNotifications && notificationElement && !notificationElement.contains(event.target)) {
                this.showNotifications = false;
            }
        }
    },
    mounted() {
        this.loadProfile();
        this.loadReadNotifications();
        this.fetchNotifications(true);
        window.addEventListener('storage', this.handleStorageChange);
        window.addEventListener('focus', this.handleWindowFocus);
        document.addEventListener('click', this.handleOutsideClick);
    },
    beforeUnmount() {
        window.removeEventListener('storage', this.handleStorageChange);
        window.removeEventListener('focus', this.handleWindowFocus);
        document.removeEventListener('click', this.handleOutsideClick);
    }
};
</script>

<style scoped>
.app-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 32px 18px;
    color: white;
    background: linear-gradient(180deg, rgba(98, 48, 4, 0.96), rgba(125, 63, 6, 0.93));
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.header-left {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.welcome-section h2 {
    font-size: 20px;
    margin-bottom: 6px;
}

.welcome-section p {
    opacity: 0.85;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.22);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}

.back-icon {
    font-size: 18px;
    line-height: 1;
}

.top-bar-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-container {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    max-width: 300px;
}

.search-icon {
    position: absolute;
    left: 12px;
    pointer-events: none;
    opacity: 0.5;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.search-icon svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.search-input {
    padding: 10px 15px 10px 36px;
    border: none;
    border-radius: 25px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    width: 220px;
    background: rgba(255, 255, 255, 0.92);
}

.calendar-wrap {
    position: relative;
}

.notif-wrap {
    position: relative;
}

.calendar-btn,
.notif-btn {
    position: relative;
    background: rgba(255, 255, 255, 0.18);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background 0.3s ease;
}

.calendar-btn svg,
.notif-btn svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 1.9;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.calendar-btn:hover,
.notif-btn:hover {
    background: rgba(255, 255, 255, 0.28);
}

.notif-btn.is-active {
    background: rgba(255, 255, 255, 0.32);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.45);
}

.notif-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #ff8452;
    color: white;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.calendar-popup {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 280px;
    padding: 16px;
    border-radius: 20px;
    background: rgba(255, 248, 240, 0.98);
    color: #3a2b1a;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(122, 74, 18, 0.12);
}

.notif-popup {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 340px;
    max-height: 420px;
    overflow: hidden;
    border-radius: 22px;
    background: rgba(255, 248, 240, 0.99);
    color: #3a2b1a;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
    border: 1px solid rgba(122, 74, 18, 0.12);
}

.notif-popup-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 18px 14px;
    border-bottom: 1px solid rgba(122, 74, 18, 0.12);
}

.notif-popup-header strong {
    display: block;
    font-size: 15px;
    margin-bottom: 4px;
}

.notif-popup-header p {
    margin: 0;
    font-size: 12px;
    color: rgba(58, 43, 26, 0.7);
}

.notif-clear-btn {
    border: none;
    background: rgba(138, 90, 32, 0.12);
    color: #8a5a20;
    border-radius: 999px;
    padding: 8px 12px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
}

.notif-list {
    max-height: 340px;
    overflow-y: auto;
    padding: 10px;
}

.notif-item {
    width: 100%;
    border: none;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.notif-item + .notif-item {
    margin-top: 10px;
}

.notif-item:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
}

.notif-item.is-unread {
    background: linear-gradient(135deg, rgba(255, 236, 214, 0.96), rgba(255, 248, 240, 0.96));
}

.notif-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 7px;
    flex-shrink: 0;
    background: #b27722;
    box-shadow: 0 0 0 5px rgba(178, 119, 34, 0.12);
}

.notif-item.severity-low .notif-indicator {
    background: #db9e27;
}

.notif-item.severity-medium .notif-indicator {
    background: #d97706;
}

.notif-item.severity-high .notif-indicator {
    background: #dc2626;
}

.notif-item.severity-info .notif-indicator {
    background: #2563eb;
}

.notif-content {
    min-width: 0;
    flex: 1;
}

.notif-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
}

.notif-row strong {
    font-size: 14px;
    color: #2f1f10;
}

.notif-row span {
    font-size: 11px;
    color: rgba(58, 43, 26, 0.65);
    white-space: nowrap;
}

.notif-content p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: rgba(58, 43, 26, 0.82);
}

.notif-state {
    padding: 22px 18px 24px;
    text-align: center;
    font-size: 13px;
    color: rgba(58, 43, 26, 0.7);
}

.notif-state.is-error {
    color: #b91c1c;
}

.calendar-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.calendar-popup-header strong {
    font-size: 15px;
}

.calendar-nav-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: rgba(138, 90, 32, 0.12);
    color: #8a5a20;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
}

.calendar-weekdays,
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
}

.calendar-weekdays {
    margin-bottom: 10px;
}

.calendar-weekdays span {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #8a5a20;
}

.calendar-day {
    border: none;
    border-radius: 12px;
    padding: 10px 0;
    background: rgba(138, 90, 32, 0.08);
    color: #3a2b1a;
    font: inherit;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
}

.calendar-day:hover {
    background: rgba(138, 90, 32, 0.18);
    transform: translateY(-1px);
}

.calendar-day.is-muted {
    opacity: 0.45;
}

.calendar-day.is-today {
    background: linear-gradient(135deg, #f0c48a, #9d5a16);
    color: white;
    font-weight: 700;
}

.calendar-selected {
    margin-top: 14px;
    font-size: 13px;
    font-weight: 600;
    color: #8a5a20;
    text-align: center;
}

.profile-link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1a1a1a;
    text-decoration: none;
}

.user-profile {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-fallback {
    color: white;
    font-size: 14px;
    font-weight: 700;
}

.profile-name {
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
}

@media (max-width: 768px) {
    .app-header {
        flex-direction: column;
        align-items: stretch;
        padding: 18px 20px 16px;
    }

    .header-left,
    .top-bar-right {
        width: 100%;
    }

    .top-bar-right {
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    .search-input {
        width: 100%;
    }

    .profile-name {
        font-size: 14px;
    }

    .notif-popup,
    .calendar-popup {
        right: auto;
        left: 0;
        width: min(340px, calc(100vw - 40px));
    }
}
</style>
