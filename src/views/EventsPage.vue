<template>
    <div class="events-layout">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                title="Upcoming Activities"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="events-content">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Events</h1>
                        <p class="page-subtitle">Track department schedules, deadlines, and campus activities.</p>
                    </div>
                    <button class="add-event-btn" @click="showAddForm = !showAddForm">
                        {{ showAddForm ? 'Close Form' : 'Add Event' }}
                    </button>
                </div>

                <section v-if="showAddForm" class="event-form-card">
                    <div class="form-grid">
                        <label class="field">
                            <span>Title</span>
                            <input v-model="newEvent.title" type="text" placeholder="Enter event title">
                        </label>

                        <label class="field">
                            <span>Date</span>
                            <input v-model="newEvent.date" type="date">
                        </label>

                        <label class="field">
                            <span>Time</span>
                            <input v-model="newEvent.time" type="text" placeholder="e.g. 9:00 AM">
                        </label>

                        <label class="field">
                            <span>Location</span>
                            <input v-model="newEvent.location" type="text" placeholder="Enter location">
                        </label>

                        <label class="field field-full">
                            <span>Description</span>
                            <input v-model="newEvent.description" type="text" placeholder="Short description">
                        </label>
                    </div>

                    <div class="form-actions">
                        <button class="save-event-btn" @click="addEvent">Save Event</button>
                        <span v-if="eventMessage" class="event-message">{{ eventMessage }}</span>
                    </div>
                </section>

                <div class="events-grid">
                    <article class="event-card" v-for="event in filteredEvents" :key="event.id" @click="openEvent(event)">
                        <div class="event-date">
                            <span class="event-month">{{ formatMonth(event) }}</span>
                            <strong class="event-day">{{ formatDay(event) }}</strong>
                        </div>
                        <div class="event-details">
                            <h3>{{ event.title }}</h3>
                            <p>{{ event.description }}</p>
                            <span class="event-meta">{{ event.time }} | {{ event.location }}</span>
                        </div>
                    </article>
                </div>

                <div v-if="!filteredEvents.length" class="empty-state">
                    No events matched your search.
                </div>

                <div v-if="selectedEvent" class="event-modal-overlay" @click.self="closeEvent">
                    <div class="event-modal">
                        <div class="event-modal-header">
                            <h2>{{ isEditingEvent ? 'Edit Event' : 'Event Details' }}</h2>
                            <button class="close-btn" @click="closeEvent">X</button>
                        </div>

                        <div v-if="!isEditingEvent" class="event-view-card">
                            <div class="event-date">
                                <span class="event-month">{{ formatMonth(selectedEvent) }}</span>
                                <strong class="event-day">{{ formatDay(selectedEvent) }}</strong>
                            </div>
                            <div class="event-details">
                                <h3>{{ selectedEvent.title }}</h3>
                                <p>{{ selectedEvent.description }}</p>
                                <span class="event-meta">{{ selectedEvent.time }} | {{ selectedEvent.location }}</span>
                            </div>
                        </div>

                        <div v-else class="form-grid">
                            <label class="field">
                                <span>Title</span>
                                <input v-model="selectedEvent.title" type="text">
                            </label>

                            <label class="field">
                                <span>Date</span>
                                <input v-model="selectedEvent.date" type="date">
                            </label>

                            <label class="field">
                                <span>Time</span>
                                <input v-model="selectedEvent.time" type="text">
                            </label>

                            <label class="field">
                                <span>Location</span>
                                <input v-model="selectedEvent.location" type="text">
                            </label>

                            <label class="field field-full">
                                <span>Description</span>
                                <input v-model="selectedEvent.description" type="text">
                            </label>
                        </div>

                        <div class="form-actions">
                            <button v-if="!isEditingEvent" class="save-event-btn" @click="isEditingEvent = true">Edit Event</button>
                            <button v-else class="save-event-btn" @click="updateEvent">Update Event</button>
                            <button class="delete-event-btn" @click="deleteEvent">Delete Event</button>
                            <span v-if="editMessage" class="event-message">{{ editMessage }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
    name: 'EventsPage',
    components: {
        AppHeader,
        Sidebar
    },
    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            showAddForm: false,
            eventMessage: '',
            editMessage: '',
            selectedEvent: null,
            isEditingEvent: false,
            newEvent: {
                title: '',
                date: '',
                time: '',
                location: '',
                description: ''
            },
            events: []
        };
    },
    computed: {
        filteredEvents() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.events;

            return this.events.filter((event) => {
                return [event.title, event.description, event.time, event.location, event.date]
                    .some((value) => String(value).toLowerCase().includes(query));
            });
        }
    },
    methods: {
        getFormattedDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        },
        formatMonth(event) {
            if (event.month) return event.month;
            if (!event.date) return '--';
            return new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        },
        formatDay(event) {
            if (event.day) return event.day;
            if (!event.date) return '--';
            return new Date(event.date).getDate().toString().padStart(2, '0');
        },
        saveEvents() {
            localStorage.setItem('eventsData', JSON.stringify(this.events));
        },
        loadEvents() {
            const savedEvents = JSON.parse(localStorage.getItem('eventsData') || 'null');
            if (savedEvents && Array.isArray(savedEvents) && savedEvents.length) {
                this.events = savedEvents;
                return;
            }
            this.events = [
                { id: 1, date: '2026-04-03', title: 'Student Orientation', description: 'Welcome session for incoming CCS students.', time: '9:00 AM', location: 'Main Hall' },
                { id: 2, date: '2026-04-08', title: 'Hackathon Kickoff', description: 'Team formation and mechanics briefing.', time: '1:00 PM', location: 'Lab 2' },
                { id: 3, date: '2026-04-14', title: 'Thesis Proposal Review', description: 'Scheduled presentation for graduating students.', time: '10:00 AM', location: 'Conference Room' },
                { id: 4, date: '2026-04-20', title: 'Department Assembly', description: 'Faculty and student updates for the semester.', time: '3:00 PM', location: 'Auditorium' }
            ];
        },
        addEvent() {
            const { title, date, time, location, description } = this.newEvent;
            if (!title.trim() || !date || !time.trim() || !location.trim() || !description.trim()) {
                this.eventMessage = 'Please complete all event fields.';
                return;
            }

            this.events.unshift({
                id: Date.now(),
                title: title.trim(),
                date,
                time: time.trim(),
                location: location.trim(),
                description: description.trim()
            });
            this.saveEvents();

            this.newEvent = {
                title: '',
                date: '',
                time: '',
                location: '',
                description: ''
            };

            this.eventMessage = 'Event added successfully.';
            setTimeout(() => {
                this.eventMessage = '';
            }, 2000);
        },
        openEvent(event) {
            this.selectedEvent = { ...event };
            this.editMessage = '';
            this.isEditingEvent = false;
        },
        closeEvent() {
            this.selectedEvent = null;
            this.editMessage = '';
            this.isEditingEvent = false;
        },
        updateEvent() {
            if (!this.selectedEvent.title.trim() || !this.selectedEvent.date || !this.selectedEvent.time.trim() || !this.selectedEvent.location.trim() || !this.selectedEvent.description.trim()) {
                this.editMessage = 'Please complete all event fields.';
                return;
            }
            const index = this.events.findIndex((event) => event.id === this.selectedEvent.id);
            if (index === -1) return;

            this.events[index] = {
                ...this.selectedEvent,
                title: this.selectedEvent.title.trim(),
                time: this.selectedEvent.time.trim(),
                location: this.selectedEvent.location.trim(),
                description: this.selectedEvent.description.trim()
            };
            this.saveEvents();

            this.editMessage = 'Event updated successfully.';
            setTimeout(() => {
                this.closeEvent();
            }, 900);
        },
        deleteEvent() {
            if (!this.selectedEvent) return;
            this.events = this.events.filter((event) => event.id !== this.selectedEvent.id);
            this.saveEvents();
            this.editMessage = 'Event deleted.';
            setTimeout(() => {
                this.closeEvent();
            }, 700);
        }
    },
    mounted() {
        this.currentDate = this.getFormattedDate();
        this.loadEvents();
    }
};
</script>

<style scoped>
.events-layout {
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

.events-content {
    padding: 24px 32px 40px;
}

.page-header {
    margin-bottom: 26px;
    color: white;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
}

.page-title {
    font-size: 38px;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 15px;
    opacity: 0.85;
}

.add-event-btn,
.save-event-btn {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.delete-event-btn {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: #ef4444;
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.event-form-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.field span {
    color: #555;
    font-size: 14px;
    font-weight: 600;
}

.field input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    font: inherit;
}

.field-full {
    grid-column: 1 / -1;
}

.form-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 20px;
}

.event-message {
    color: #0f766e;
    font-weight: 600;
}

.events-grid {
    display: grid;
    gap: 18px;
}

.event-card {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 22px;
    background: white;
    border-radius: 22px;
    padding: 22px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
}

.event-date {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 18px;
    background: linear-gradient(135deg, #f4c78f, #a45b12);
    color: white;
    min-height: 110px;
}

.event-month {
    font-size: 14px;
    letter-spacing: 0.14em;
}

.event-day {
    font-size: 34px;
    line-height: 1.1;
}

.event-details h3 {
    font-size: 22px;
    color: #1a1a1a;
    margin-bottom: 8px;
}

.event-details p {
    color: #666;
    margin-bottom: 10px;
}

.event-meta {
    color: #8a5a20;
    font-size: 14px;
    font-weight: 600;
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

.event-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 60;
}

.event-modal {
    width: min(760px, 100%);
    background: white;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

.event-view-card {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 22px;
    background: white;
    border-radius: 22px;
    padding: 22px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.event-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
}

.event-modal-header h2 {
    color: #1a1a1a;
}

.close-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: #f3f4f6;
    font-size: 18px;
    cursor: pointer;
}

@media (max-width: 768px) {
    .events-content,
    .top-bar {
        padding-left: 20px;
        padding-right: 20px;
    }

    .event-card {
        grid-template-columns: 1fr;
    }

    .page-title {
        font-size: 30px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
