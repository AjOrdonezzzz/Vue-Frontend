<template>
    <div class="settings-layout">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                title="System Preferences"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="settings-content">
                <div class="page-header">
                    <h1 class="page-title">Settings</h1>
                    <p class="page-subtitle">Manage profile details, notifications, and account preferences.</p>
                </div>

                <div class="settings-grid">
                    <section v-for="section in filteredSections" :key="section.title" class="settings-card">
                        <h3>{{ section.title }}</h3>
                        <div v-for="item in section.items" :key="item.label" class="setting-row">
                            <span>{{ item.label }}</span>
                            <strong>{{ item.value }}</strong>
                        </div>
                    </section>
                </div>

                <div v-if="!filteredSections.length" class="empty-state">
                    No settings matched your search.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import globalState from '../store/globalState';
import { getStoredUser } from '../utils/auth';

export default {
    name: 'SettingsPage',
    components: {
        AppHeader,
        Sidebar
    },
    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: ''
        };
    },
    computed: {
        currentUser() {
            return globalState.state.user || getStoredUser() || {};
        },
        sections() {
            const user = this.currentUser;
            const displayName = user.fullName || user.username || 'Guest User';
            const username = user.username || 'Not signed in';
            const role = user.role ? this.capitalize(user.role) : 'User';
            const email = user.email || (user.username ? `${user.username}@example.com` : 'Not provided');
            const notifications = user.rememberMe ? 'Enabled' : 'Disabled';

            return [
                {
                    title: 'Profile',
                    items: [
                        { label: 'Display Name', value: displayName },
                        { label: 'Username', value: username },
                        { label: 'Role', value: role }
                    ]
                },
                {
                    title: 'Preferences',
                    items: [
                        { label: 'Email Notifications', value: notifications },
                        { label: 'Primary Email', value: email }
                    ]
                },
                {
                    title: 'Security',
                    items: [
                        { label: 'Password Status', value: user.username ? 'Set' : 'Not available' },
                        { label: 'Session', value: 'Active on this device' }
                    ]
                }
            ];
        },
        filteredSections() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.sections;

            return this.sections
                .map((section) => ({
                    ...section,
                    items: section.items.filter((item) => {
                        return [section.title, item.label, item.value]
                            .some((value) => String(value).toLowerCase().includes(query));
                    })
                }))
                .filter((section) => section.items.length);
        }
    },
    methods: {
        getFormattedDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        },
        capitalize(value) {
            if (!value) return '';
            return String(value).charAt(0).toUpperCase() + String(value).slice(1);
        }
    },
    mounted() {
        this.currentDate = this.getFormattedDate();
        window.addEventListener('storage', globalState.refreshUser);
        window.addEventListener('focus', globalState.refreshUser);
    },
    beforeUnmount() {
        window.removeEventListener('storage', globalState.refreshUser);
        window.removeEventListener('focus', globalState.refreshUser);
    }
};
</script>

<style scoped>
.settings-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
    font-family: 'Poppins', sans-serif;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.settings-content {
    padding: 24px 32px 40px;
}

.page-header {
    margin-bottom: 26px;
    color: white;
}

.page-title {
    font-size: 38px;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 15px;
    opacity: 0.85;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
}

.empty-state {
    margin-top: 18px;
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    color: #7a4a12;
    font-weight: 600;
    text-align: center;
}

.settings-card {
    background: white;
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.settings-card h3 {
    font-size: 22px;
    color: #1a1a1a;
    margin-bottom: 18px;
}

.setting-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    color: #555;
}

.setting-row:last-child {
    border-bottom: none;
}

.setting-row strong {
    color: #8a5a20;
}

@media (max-width: 768px) {
    .settings-content,
    .top-bar {
        padding-left: 20px;
        padding-right: 20px;
    }

    .page-title {
        font-size: 30px;
    }
}
</style>
