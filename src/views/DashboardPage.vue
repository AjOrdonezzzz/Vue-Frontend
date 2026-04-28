<template>
    <div class="dashboard-container">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                :title="welcomeTitle"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="dashboard-content">
                <h1 class="dashboard-title">Dashboard</h1>

                <div v-if="filteredStats.length" class="stats-grid">
                    <div v-for="stat in filteredStats" :key="stat.title" class="stat-card">
                        <div class="stat-icon">
                            <svg v-if="stat.icon === 'students'" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M16 19a4 4 0 0 0-8 0" />
                                <circle cx="12" cy="9" r="3" />
                                <path d="M5 19a3 3 0 0 1 3-3" />
                                <circle cx="6" cy="10" r="2" />
                                <path d="M19 19a3 3 0 0 0-3-3" />
                                <circle cx="18" cy="10" r="2" />
                            </svg>
                            <svg v-else-if="stat.icon === 'shield'" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 3 5 6v6c0 5 3.5 7.5 7 9 3.5-1.5 7-4 7-9V6l-7-3Z" />
                                <path d="m9.5 12 1.8 1.8 3.7-4.3" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 19V9" />
                                <path d="M10 19V5" />
                                <path d="M16 19v-7" />
                                <path d="M22 19V3" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3>{{ stat.title }}</h3>
                            <p class="stat-number">{{ stat.value }}</p>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    No dashboard statistics matched your search.
                </div>

                <div class="violations-section">
                    <h2>Students With Violations</h2>
                    <table class="violations-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Student Number</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Violation Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="student in recentViolationStudents" :key="student.id">
                                <td>{{ student.name }}</td>
                                <td>{{ student.number }}</td>
                                <td>{{ student.date }}</td>
                                <td><span class="status-badge">{{ student.status }}</span></td>
                                <td>{{ student.violation }}</td>
                            </tr>
                            <tr v-if="!recentViolationStudents.length">
                                <td colspan="5" class="empty-table-state">No violation records matched your search.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="events-section">
                    <h2>Upcoming Events</h2>
                    <div v-if="filteredUpcomingEvents.length" class="events-list">
                        <article v-for="event in filteredUpcomingEvents" :key="event.id" class="event-item">
                            <strong>{{ event.title }}</strong>
                            <span>{{ event.date }} | {{ event.location }}</span>
                        </article>
                    </div>
                    <div v-else class="events-placeholder">
                        <p>No upcoming events matched your search.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import api from '../services/api.js';
import { getStoredUser } from '../utils/auth';

export default {
    name: 'DashboardPage',
    components: { AppHeader, Sidebar },

    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            statsLoading: false,
            violationsLoading: false,
            stats: [],
            violationStudents: [],
            upcomingEvents: [
                { id: 1, title: 'Student Orientation', date: 'Apr 3, 2026', location: 'Main Hall' },
                { id: 2, title: 'Hackathon Kickoff',   date: 'Apr 8, 2026', location: 'Lab 2' },
                { id: 3, title: 'Department Assembly', date: 'Apr 20, 2026', location: 'Auditorium' },
            ],
        };
    },

    computed: {
        currentUser() {
            return getStoredUser() || {};
        },

        welcomeTitle() {
            const name = this.currentUser.fullName || this.currentUser.username;
            return name ? `Welcome, ${name}!` : 'Welcome, User!';
        },

        filteredStats() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.stats;
            return this.stats.filter((stat) =>
                [stat.title, String(stat.value)].some((v) =>
                    v.toLowerCase().includes(query)
                )
            );
        },

        filteredViolationStudents() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.violationStudents;
            return this.violationStudents.filter((v) =>
                [v.name, v.number, v.date, v.status, v.violation]
                    .some((val) => String(val ?? '').toLowerCase().includes(query))
            );
        },

        recentViolationStudents() {
            return this.filteredViolationStudents.slice(0, 10);
        },

        filteredUpcomingEvents() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.upcomingEvents;
            return this.upcomingEvents.filter((event) =>
                [event.title, event.date, event.location].some((v) =>
                    v.toLowerCase().includes(query)
                )
            );
        },
    },

    methods: {
        getFormattedDate() {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            return new Date().toLocaleDateString('en-US', options);
        },

        formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },

        getStatusClass(status) {
            const map = {
                'Active':   'badge-active',
                'Pending':  'badge-pending',
                'Resolved': 'badge-resolved',
            };
            return map[status] ?? 'badge-default';
        },

        getAgeFromBirthdate(birthdate) {
            if (!birthdate) return null;
            const birth = new Date(birthdate);
            if (Number.isNaN(birth.getTime())) return null;
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const isBirthdayPassed = (today.getMonth() > birth.getMonth()) ||
                (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
            if (!isBirthdayPassed) {
                age -= 1;
            }
            return age >= 0 ? age : null;
        },

        buildStats(totalStudents, activeProfiles, averageAge) {
            const avgAgeDisplay = Number.isFinite(averageAge) ? Number(averageAge).toFixed(1) : 'N/A';
            this.stats = [
                { title: 'Total Students',  value: totalStudents.toLocaleString(), icon: '👥' },
                { title: 'Active Profiles', value: activeProfiles.toLocaleString(), icon: '✅' },
                { title: 'Average Age',     value: avgAgeDisplay, icon: '📊' },
            ];
        },

        async fetchStatsFallback() {
            try {
                const { data } = await api.get('/students');
                const totalStudents = Array.isArray(data) ? data.length : 0;
                const activeProfiles = Array.isArray(data)
                    ? data.filter((student) => student.status === 'Active').length
                    : 0;
                const ages = Array.isArray(data)
                    ? data.map((student) => this.getAgeFromBirthdate(student.birthdate)).filter(Number.isFinite)
                    : [];
                const averageAge = ages.length ? ages.reduce((sum, age) => sum + age, 0) / ages.length : null;
                this.buildStats(totalStudents, activeProfiles, averageAge);
            } catch (err) {
                console.error('Failed to compute fallback stats:', err);
                this.stats = [
                    { title: 'Total Students',  value: '—', icon: '👥' },
                    { title: 'Active Profiles', value: '—', icon: '✅' },
                    { title: 'Average Age',     value: '—', icon: '📊' },
                ];
            }
        },

        // GET /api/v1/dashboard/stats
        async fetchStats() {
            this.statsLoading = true;
            try {
                const { data } = await api.get('/dashboard/stats');

                const totalStudents = Number(data.total_students ?? 0);
                const activeProfiles = Number(data.active_profiles ?? 0);
                const averageAgeVal = Number(data.average_age);

                if (!Number.isFinite(totalStudents) || !Number.isFinite(activeProfiles) || Number.isNaN(averageAgeVal) && data.average_age !== null) {
                    // fallback to students route if stats are invalid
                    await this.fetchStatsFallback();
                } else {
                    this.buildStats(totalStudents, activeProfiles, Number.isFinite(averageAgeVal) ? averageAgeVal : null);
                }
            } catch (err) {
                console.error('Failed to load stats:', err);
                await this.fetchStatsFallback();
            } finally {
                this.statsLoading = false;
            }
        },

        // GET /api/v1/student-violations
        async fetchViolations() {
            this.violationsLoading = true;
            try {
                const { data } = await api.get('/student-violations');
                this.violationStudents = data.map((v) => ({
                    id:        v.violation_id,
                    name:      `${v.student.first_name} ${v.student.middle_name ? v.student.middle_name[0] + '. ' : ''}${v.student.last_name}`,
                    number:    v.student.student_number,
                    date:      this.formatDate(v.violation_date),
                    status:    v.status,
                    violation: v.violationType?.violation_name + (v.description ? ` — ${v.description}` : ''),
                }));
            } catch (err) {
                console.error('Failed to load violations:', err);
                this.violationStudents = [];
            } finally {
                this.violationsLoading = false;
            }
        },
    },  // ← methods closes here

    mounted() {  // ← mounted is OUTSIDE methods
        this.currentDate = this.getFormattedDate();
        this.fetchStats();
        this.fetchViolations();
    },
};
</script>


<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.dashboard-container {
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

.dashboard-content {
    padding: 40px;
}

.dashboard-title {
    font-size: 32px;
    color: white;
    margin-bottom: 30px;
    font-weight: 700;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: white;
    border-radius: 15px;
    padding: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.empty-state {
    margin: -12px 0 28px;
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    color: #7a4a12;
    font-weight: 600;
    text-align: center;
}

.stat-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 12px;
}

.stat-icon svg {
    width: 30px;
    height: 30px;
    stroke: #8a5a20;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
}

.stat-info h3 {
    font-size: 14px;
    color: #666;
    font-weight: 500;
    margin-bottom: 8px;
}

.stat-number {
    font-size: 28px;
    color: #1a1a1a;
    font-weight: 700;
}

.violations-section {
    background: white;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 40px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.violations-section h2 {
    font-size: 20px;
    color: #1a1a1a;
    margin-bottom: 25px;
    font-weight: 700;
}

.violations-table {
    width: 100%;
    border-collapse: collapse;
}

.violations-table thead {
    background: #f5f5f5;
}

.violations-table th {
    padding: 15px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #555;
    border-bottom: 2px solid #eee;
}

.violations-table td {
    padding: 15px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #333;
}

.violations-table tbody tr:hover {
    background: #f9f9f9;
}

.empty-table-state {
    text-align: center;
    color: #7a4a12;
    font-weight: 600;
}

.status-badge {
    background: #d1fae5;
    color: #065f46;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.events-section {
    background: linear-gradient(135deg, #ff6b35 0%, #ff5520 100%);
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    min-height: 200px;
    display: flex;
    flex-direction: column;
}

.events-section h2 {
    font-size: 20px;
    color: white;
    margin-bottom: 20px;
    font-weight: 700;
}

.events-list {
    display: grid;
    gap: 14px;
}

.event-item {
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    color: #3a2b1a;
}

.event-item strong {
    display: block;
    margin-bottom: 6px;
}

.events-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0.88;
    font-size: 16px;
}

@media (max-width: 768px) {
    .dashboard-content {
        padding: 20px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .dashboard-title {
        font-size: 24px;
    }
}
</style>
