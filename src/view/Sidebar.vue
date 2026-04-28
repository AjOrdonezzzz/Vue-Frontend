<template>
    <aside :class="['sidebar', { collapsed: !isOpen }]">
        <div class="sidebar-header">
            <div class="logo-area" v-show="isOpen">
                <span class="logo-text">Menu</span>
            </div>
            <button class="toggle-btn" @click="$emit('toggle')">
                <svg viewBox="0 0 24 24" class="toggle-icon" :class="{ collapsed: !isOpen }" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" />
                </svg>
            </button>
        </div>

        <nav class="sidebar-nav">
            <component
                v-for="item in visibleMenuItems"
                :key="item.id"
                :is="item.route ? 'router-link' : 'div'"
                v-bind="item.route ? { to: item.route } : {}"
                class="nav-item"
                :class="{ active: item.route && $route.path === item.route }"
            >
                <span class="nav-icon">
                    <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="8" rx="2" />
                        <rect x="14" y="3" width="7" height="5" rx="2" />
                        <rect x="14" y="11" width="7" height="10" rx="2" />
                        <rect x="3" y="14" width="7" height="7" rx="2" />
                    </svg>
                    <svg v-else-if="item.icon === 'students'" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M16 19a4 4 0 0 0-8 0" />
                        <circle cx="12" cy="9" r="3" />
                        <path d="M5 19a3 3 0 0 1 3-3" />
                        <circle cx="6" cy="10" r="2" />
                        <path d="M19 19a3 3 0 0 0-3-3" />
                        <circle cx="18" cy="10" r="2" />
                    </svg>
                    <svg v-else-if="item.icon === 'violations'" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 4 3 20h18L12 4Z" />
                        <path d="M12 9v5" />
                        <circle cx="12" cy="17" r="1" />
                    </svg>
                    <svg v-else-if="item.icon === 'events'" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="3" />
                        <path d="M3 10h18" />
                        <path d="M8 3v4M16 3v4" />
                    </svg>
                    <svg v-else-if="item.icon === 'reports'" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 3h7l5 5v13H7z" />
                        <path d="M14 3v5h5" />
                        <path d="M10 13h6M10 17h6M10 9h2" />
                    </svg>
                    <svg v-else-if="item.icon === 'settings'" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
                    </svg>
                </span>
                <span class="nav-label" v-show="isOpen">{{ item.label }}</span>
                <div class="tooltip" v-show="!isOpen">{{ item.label }}</div>
            </component>
        </nav>

        <div class="sidebar-footer">
            <button class="logout-btn" @click="handleLogout">
                <span class="logout-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                        <path d="M10 12h11" />
                        <path d="m18 8 4 4-4 4" />
                    </svg>
                </span>
                <span class="logout-text" v-show="isOpen">Logout</span>
            </button>
        </div>
    </aside>
</template>

<script>
import { isAdminUser } from '../utils/auth';
import globalState from '../store/globalState';

export default {
    name: 'Sidebar',
    props: {
        isOpen: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            menuItems: [
                { id: 1, label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
                { id: 2, label: 'Students', icon: 'students', route: '/students' },
                { id: 3, label: 'Violations', icon: 'violations', route: '/violations' },
                { id: 4, label: 'Events', icon: 'events', route: '/events' },
                { id: 5, label: 'Reports', icon: 'reports', route: '/reports', adminOnly: true },
                { id: 6, label: 'Users', icon: 'students', route: '/users', adminOnly: true },
                { id: 7, label: 'Settings', icon: 'settings', route: '/settings' }
            ]
        };
    },
    computed: {
        visibleMenuItems() {
            return this.menuItems.filter((item) => !item.adminOnly || isAdminUser(globalState.state.user));
        }
    },
    methods: {
        handleLogout() {
            globalState.clearUserState();
            this.$router.push('/');
        }
    },
    mounted() {
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
.sidebar {
    width: 250px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.sidebar.collapsed {
    width: 70px;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    min-height: 36px;
}

.logo-text {
    color: white;
    font-weight: 700;
    font-size: 16px;
    white-space: nowrap;
}

.toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
    flex-shrink: 0;
    margin-left: auto;
}

.toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.toggle-icon {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2.4;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.25s ease;
}

.toggle-icon.collapsed {
    transform: rotate(180deg);
}

.sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px;
    color: rgba(255, 255, 255, 0.72);
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.3s ease;
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    text-decoration: none;
}

.nav-item:hover,
.nav-item.active {
    background: rgba(255, 255, 255, 0.12);
    color: white;
}

.nav-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.nav-icon svg {
    width: 22px;
    height: 22px;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
}

.nav-label {
    overflow: hidden;
    transition: opacity 0.2s ease;
}

.tooltip {
    position: absolute;
    left: 65px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 999;
}

.nav-item:hover .tooltip {
    opacity: 1;
}

.sidebar-footer {
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
    width: 100%;
    padding: 12px;
    background: #ff6b35;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    white-space: nowrap;
    overflow: hidden;
}

.logout-btn:hover {
    background: #ff5520;
    transform: translateY(-2px);
}

.logout-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.logout-icon svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
}

@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
        width: 250px !important;
    }

    .sidebar.open {
        transform: translateX(0);
    }
}
</style>
