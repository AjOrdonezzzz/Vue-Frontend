<template>
    <div class="rooms-layout">
        <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

        <div class="main-content">
            <AppHeader
                title="Room Management"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            />

            <div class="rooms-content">
                <section class="hero-card">
                    <div>
                        <p class="eyebrow">Facilities</p>
                        <h1>Manage campus rooms and section assignments.</h1>
                        <p class="hero-copy">
                            Keep classrooms, laboratories, and shared spaces organized in one place.
                        </p>
                    </div>
                    <button v-if="canManage" class="primary-btn" @click="openCreateForm">
                        {{ isEditing ? 'Create Another Room' : 'Add Room' }}
                    </button>
                    <span v-else class="reference-pill">Reference Only</span>
                </section>

                <section class="stats-grid">
                    <article class="stat-card">
                        <span>Total Rooms</span>
                        <strong>{{ filteredRooms.length }}</strong>
                    </article>
                    <article class="stat-card">
                        <span>Available</span>
                        <strong>{{ statusCount.available }}</strong>
                    </article>
                    <article class="stat-card">
                        <span>Occupied</span>
                        <strong>{{ statusCount.occupied }}</strong>
                    </article>
                    <article class="stat-card">
                        <span>Maintenance</span>
                        <strong>{{ statusCount.maintenance }}</strong>
                    </article>
                </section>

                <section :class="['workspace-grid', { 'full-width': !canManage }]">
                    <article v-if="canManage" class="form-panel">
                        <div class="panel-heading">
                            <div>
                                <p class="panel-label">{{ isEditing ? 'Edit room' : 'New room' }}</p>
                                <h2>{{ isEditing ? form.room_name : 'Create a room record' }}</h2>
                            </div>
                            <button v-if="isEditing || hasFormValues" class="ghost-btn" @click="resetForm">
                                Clear
                            </button>
                        </div>

                        <form class="room-form" @submit.prevent="submitRoom">
                            <label class="field">
                                <span>Room Name</span>
                                <input v-model.trim="form.room_name" type="text" maxlength="20" placeholder="Room 101">
                            </label>

                            <label class="field">
                                <span>Room Type</span>
                                <select v-model="form.room_type">
                                    <option value="">Select type</option>
                                    <option v-for="type in roomTypes" :key="type" :value="type">{{ type }}</option>
                                </select>
                            </label>

                            <label class="field">
                                <span>Capacity</span>
                                <input v-model.number="form.capacity" type="number" min="1" placeholder="40">
                            </label>

                            <label class="field">
                                <span>Building</span>
                                <input v-model.trim="form.building" type="text" maxlength="50" placeholder="Main Building">
                            </label>

                            <label class="field">
                                <span>Floor</span>
                                <input v-model="form.floor" type="number" min="0" placeholder="1">
                            </label>

                            <label class="field">
                                <span>Status</span>
                                <select v-model="form.status">
                                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>
                            </label>

                            <div class="form-actions">
                                <button class="primary-btn" type="submit" :disabled="saving">
                                    {{ saving ? 'Saving...' : isEditing ? 'Update Room' : 'Save Room' }}
                                </button>
                                <span v-if="feedbackMessage" class="feedback success">{{ feedbackMessage }}</span>
                                <span v-if="errorMessage" class="feedback error">{{ errorMessage }}</span>
                            </div>
                        </form>
                    </article>

                    <article class="table-panel">
                        <div class="panel-heading">
                            <div>
                                <p class="panel-label">Directory</p>
                                <h2>Registered rooms</h2>
                            </div>
                            <span class="result-pill">{{ filteredRooms.length }} shown</span>
                        </div>

                        <div v-if="loading" class="state-card">Loading room records...</div>
                        <div v-else-if="!filteredRooms.length" class="state-card">
                            No rooms matched your search.
                        </div>
                        <div v-else class="table-wrap">
                            <table class="room-table">
                                <thead>
                                    <tr>
                                        <th>Room</th>
                                        <th>Type</th>
                                        <th>Building</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th>Sections</th>
                                        <th v-if="canManage">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="room in filteredRooms" :key="room.room_id">
                                        <td>
                                            <div class="room-cell">
                                                <strong>{{ room.room_name }}</strong>
                                                <span>Floor {{ room.floor ?? 'N/A' }}</span>
                                            </div>
                                        </td>
                                        <td>{{ room.room_type }}</td>
                                        <td>{{ room.building }}</td>
                                        <td>{{ room.capacity }}</td>
                                        <td>
                                            <span class="status-pill" :class="room.status">
                                                {{ formatStatus(room.status) }}
                                            </span>
                                        </td>
                                        <td>{{ room.sections_count ?? 0 }}</td>
                                        <td v-if="canManage">
                                            <div class="action-group">
                                                <button class="table-btn" @click="openEditForm(room)">Edit</button>
                                                <button
                                                    class="table-btn danger"
                                                    :disabled="deletingId === room.room_id"
                                                    @click="deleteRoom(room)"
                                                >
                                                    {{ deletingId === room.room_id ? 'Deleting...' : 'Delete' }}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </article>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import api from '../services/api.js';
import { isAdminUser } from '../utils/auth';

const defaultForm = () => ({
    room_name: '',
    room_type: '',
    capacity: '',
    building: '',
    floor: '',
    status: 'available'
});

export default {
    name: 'RoomsPage',
    components: { AppHeader, Sidebar },
    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            loading: false,
            saving: false,
            deletingId: null,
            rooms: [],
            editingRoomId: null,
            feedbackMessage: '',
            errorMessage: '',
            roomTypes: ['Classroom', 'Laboratory', 'Office', 'Conference Room', 'Auditorium'],
            statusOptions: [
                { label: 'Available', value: 'available' },
                { label: 'Occupied', value: 'occupied' },
                { label: 'Maintenance', value: 'maintenance' }
            ],
            form: defaultForm()
        };
    },
    computed: {
        isEditing() {
            return this.editingRoomId !== null;
        },
        canManage() {
            return isAdminUser();
        },
        hasFormValues() {
            return Object.values(this.form).some((value) => value !== '' && value !== 'available');
        },
        filteredRooms() {
            const query = this.searchQuery.trim().toLowerCase();

            if (!query) {
                return this.rooms;
            }

            return this.rooms.filter((room) => {
                return [
                    room.room_name,
                    room.room_type,
                    room.building,
                    this.formatStatus(room.status),
                    String(room.capacity ?? ''),
                    String(room.floor ?? '')
                ].some((value) => String(value).toLowerCase().includes(query));
            });
        },
        statusCount() {
            return this.filteredRooms.reduce((counts, room) => {
                const status = room.status || 'available';
                counts[status] = (counts[status] || 0) + 1;
                return counts;
            }, { available: 0, occupied: 0, maintenance: 0 });
        }
    },
    methods: {
        getFormattedDate() {
            return new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        formatStatus(status) {
            return String(status || '')
                .split('_')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
        },
        normalizePayload() {
            return {
                room_name: this.form.room_name,
                room_type: this.form.room_type,
                capacity: Number(this.form.capacity),
                building: this.form.building,
                floor: this.form.floor === '' || this.form.floor === null ? null : Number(this.form.floor),
                status: this.form.status
            };
        },
        resetForm(clearMessages = true) {
            this.form = defaultForm();
            this.editingRoomId = null;
            if (clearMessages) {
                this.feedbackMessage = '';
                this.errorMessage = '';
            }
        },
        openCreateForm() {
            this.resetForm();
        },
        openEditForm(room) {
            this.editingRoomId = room.room_id;
            this.feedbackMessage = '';
            this.errorMessage = '';
            this.form = {
                room_name: room.room_name || '',
                room_type: room.room_type || '',
                capacity: room.capacity ?? '',
                building: room.building || '',
                floor: room.floor ?? '',
                status: room.status || 'available'
            };
        },
        async fetchRooms() {
            this.loading = true;

            try {
                const { data } = await api.get('/rooms');
                this.rooms = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Failed to load rooms:', error);
                this.errorMessage = error?.response?.data?.message || 'Unable to load room records.';
            } finally {
                this.loading = false;
            }
        },
        async submitRoom() {
            this.saving = true;
            this.feedbackMessage = '';
            this.errorMessage = '';

            try {
                const payload = this.normalizePayload();
                const wasEditing = this.isEditing;

                if (wasEditing) {
                    await api.put(`/rooms/${this.editingRoomId}`, payload);
                } else {
                    await api.post('/rooms', payload);
                }

                await this.fetchRooms();
                this.resetForm(false);
                this.feedbackMessage = wasEditing ? 'Room updated successfully.' : 'Room created successfully.';
            } catch (error) {
                const validationErrors = error?.response?.data?.errors;
                if (validationErrors) {
                    this.errorMessage = Object.values(validationErrors).flat().join(' ');
                } else {
                    this.errorMessage = error?.response?.data?.message || 'Unable to save room.';
                }
            } finally {
                this.saving = false;
            }
        },
        async deleteRoom(room) {
            if (!window.confirm(`Delete ${room.room_name} from ${room.building}?`)) {
                return;
            }

            this.deletingId = room.room_id;
            this.feedbackMessage = '';
            this.errorMessage = '';

            try {
                await api.delete(`/rooms/${room.room_id}`);
                if (this.editingRoomId === room.room_id) {
                    this.resetForm(false);
                }
                this.feedbackMessage = 'Room deleted successfully.';
                await this.fetchRooms();
            } catch (error) {
                this.errorMessage = error?.response?.data?.message || 'Unable to delete room.';
            } finally {
                this.deletingId = null;
            }
        }
    },
    mounted() {
        this.currentDate = this.getFormattedDate();
        this.fetchRooms();
    }
};
</script>

<style scoped>
.rooms-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
    font-family: 'Poppins', sans-serif;
}

.main-content { flex: 1; display: flex; flex-direction: column; }

.rooms-content {
    padding: 24px 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Hero Card */
.hero-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 28px;
    border-radius: 24px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    color: white;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
}

.eyebrow, .panel-label {
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 12px;
    font-weight: 700;
    opacity: 0.72;
}

.hero-card h1, .panel-heading h2 { margin: 0; }
.hero-card h1 { max-width: 560px; font-size: 34px; line-height: 1.1; }
.hero-copy { margin: 12px 0 0; max-width: 560px; color: rgba(255, 255, 255, 0.82); }

/* Grids */
.stats-grid, .workspace-grid { display: grid; gap: 18px; }
.stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.workspace-grid { grid-template-columns: minmax(320px, 380px) minmax(0, 1fr); align-items: start; }

/* ✅ Full width for non-admin users */
.workspace-grid.full-width { grid-template-columns: 1fr; }

/* Cards */
.stat-card, .form-panel, .table-panel {
    border-radius: 24px;
    background: white;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.stat-card { padding: 20px 22px; }
.stat-card span {
    display: block;
    color: #666;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
.stat-card strong {
    display: block;
    margin-top: 10px;
    color: #1a1a1a;
    font-size: 34px;
}

/* Form & Table Panels */
.form-panel, .table-panel { padding: 24px; }
.panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
}
.panel-heading h2 { color: #1a1a1a; font-size: 24px; }
.panel-label { color: #8a5a20; }

/* Form */
.room-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field span { color: #555; font-size: 13px; font-weight: 700; }

.field input, .field select {
    border: 1px solid #ddd;
    border-radius: 14px;
    background: #fff;
    color: #1a1a1a;
    font: inherit;
    padding: 12px 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus, .field select:focus {
    outline: none;
    border-color: #b27722;
    box-shadow: 0 0 0 4px rgba(178, 119, 34, 0.15);
}

/* Form Actions */
.form-actions {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
}

/* Buttons */
.primary-btn, .ghost-btn, .table-btn {
    border: none;
    border-radius: 999px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

.primary-btn {
    padding: 12px 18px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.primary-btn:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #b8a090 0%, #9a8a7a 100%);
}

.ghost-btn {
    padding: 10px 14px;
    background: rgba(122, 57, 2, 0.08);
    color: #7a3902;
}

.ghost-btn:hover { background: rgba(122, 57, 2, 0.15); transform: translateY(-1px); }

.table-btn {
    padding: 8px 14px;
    background: rgba(122, 57, 2, 0.08);
    color: #7a3902;
    font-size: 13px;
}

.table-btn:hover { background: rgba(122, 57, 2, 0.15); transform: translateY(-1px); }

.primary-btn:disabled, .table-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
}

/* Feedback */
.feedback { font-size: 13px; font-weight: 600; }
.feedback.success { color: #0f766e; }
.feedback.error   { color: #b91c1c; }

/* Pills */
.result-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: rgba(122, 57, 2, 0.08);
    color: #7a3902;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
}

.reference-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    color: white;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

/* Table */
.state-card {
    padding: 36px 24px;
    border-radius: 20px;
    background: rgba(255, 243, 220, 0.5);
    text-align: center;
    color: #7a4a12;
    font-weight: 600;
}

.table-wrap { overflow-x: auto; }

.room-table { width: 100%; border-collapse: collapse; }

.room-table th, .room-table td {
    padding: 16px 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
}

.room-table th {
    background: #f5f5f5;
    color: #555;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.room-table td { color: #333; font-size: 14px; }
.room-table tbody tr:hover { background: #f9f9f9; }

.room-cell { display: flex; flex-direction: column; gap: 4px; }
.room-cell strong { font-size: 15px; color: #1a1a1a; }
.room-cell span   { color: #8a5a20; font-size: 12px; }

/* Status Pills — keep semantic colors */
.status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
}

.status-pill.available    { background: #dcfce7; color: #166534; }
.status-pill.occupied     { background: #fef3c7; color: #92400e; }
.status-pill.maintenance  { background: #fee2e2; color: #b91c1c; }

/* Action Group */
.action-group { display: flex; gap: 8px; }

.table-btn.danger {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
}

.table-btn.danger:hover { background: rgba(239, 68, 68, 0.2); }

/* Responsive */
@media (max-width: 1100px) {
    .stats-grid, .workspace-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .rooms-content { padding: 16px 20px 32px; }
    .hero-card { flex-direction: column; align-items: flex-start; }
    .hero-card h1 { font-size: 28px; }
    .room-form { grid-template-columns: 1fr; }
    .form-actions, .action-group { flex-direction: column; align-items: stretch; }
    .primary-btn, .ghost-btn, .table-btn { width: 100%; text-align: center; }
}
</style>