<template>
    <div class="violations-layout">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                title="Violations Monitoring"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="violations-content">
                <div class="page-header">
                    <h1 class="page-title">Violations</h1>
                    <p class="page-subtitle">Review active student cases and recent incident reports.</p>
                    <button class="add-violation-btn" @click="showAddForm = !showAddForm">
                        {{ showAddForm ? 'Close Form' : 'Add Violation' }}
                    </button>
                </div>

                <div class="summary-grid">
                    <div class="summary-card" v-for="summary in summaryItems" :key="summary.title">
                        <span class="summary-label">{{ summary.title }}</span>
                        <strong class="summary-value">{{ summary.value }}</strong>
                    </div>
                </div>

                <div v-if="!summaryItems.length && !loading" class="empty-state">
                    No summary cards matched your search.
                </div>

                <div v-if="loading" class="empty-state">
                    Loading violations...
                </div>

                <section v-if="showAddForm" class="violation-form-card">
                    <div class="form-grid">
                        <div class="field">
                            <span>Student <span class="required">*</span></span>
                            <select v-model="newViolation.student_id">
                                <option value="">Select a student</option>
                                <option v-for="student in students" :key="student.student_id" :value="student.student_id">
                                    {{ student.first_name }} {{ student.middle_name ? student.middle_name + ' ' : '' }}{{ student.last_name }} ({{ student.student_number }})
                                </option>
                            </select>
                        </div>

                        <div class="field">
                            <span>Violation Type <span class="required">*</span></span>
                            <select v-model="newViolation.violation_type_id">
                                <option value="">Select violation type</option>
                                <option v-for="type in violationTypes" :key="type.violation_type_id" :value="type.violation_type_id">
                                    {{ type.violation_name }} ({{ type.severity_level }})
                                </option>
                            </select>
                        </div>

                        <div class="field">
                            <span>Violation Date <span class="required">*</span></span>
                            <input v-model="newViolation.violation_date" type="date">
                        </div>

                        <div class="field">
                            <span>Status <span class="required">*</span></span>
                            <select v-model="newViolation.status">
                                <option>Pending</option>
                                <option>Active</option>
                                <option>Resolved</option>
                            </select>
                        </div>

                        <div class="field field-full">
                            <span>Description</span>
                            <textarea v-model="newViolation.description" rows="3" placeholder="Describe the violation incident"></textarea>
                        </div>

                        <div class="field field-full">
                            <span>Action Taken</span>
                            <input v-model="newViolation.action_taken" type="text" placeholder="What action was taken (if any)">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="save-violation-btn" @click="addViolation">Save Violation</button>
                        <span v-if="addMessage" class="violation-message">{{ addMessage }}</span>
                    </div>
                </section>

                <div class="table-card">
                    <h2>Violation Reports</h2>

                    <table class="violations-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Student Number</th>
                                <th>Violation Type</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="record in filteredRecords" :key="record.id" class="record-row">
                                <td>{{ record.name }}</td>
                                <td>{{ record.studentNumber }}</td>
                                <td>{{ record.violation }}</td>
                                <td>{{ record.description || '—' }}</td>
                                <td>{{ record.date }}</td>
                                <td>
                                    <div class="status-cell">
                                        <span class="status-badge">{{ record.status }}</span>
                                    </div>
                                </td>
                                <td>
                                    <button class="view-btn" @click="openRecord(record)">View Details</button>
                                </td>
                            </tr>
                            <tr v-if="!filteredRecords.length">
                                <td colspan="7" class="empty-table-state">No violation reports found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="selectedRecord" class="record-modal-overlay" @click.self="closeRecord">
                    <div class="record-modal">
                        <div class="record-modal-header">
                            <h2>Edit Report</h2>
                            <button class="close-btn" @click="closeRecord">X</button>
                        </div>

                        <div class="form-grid">
                            <label class="field">
                                <span>Name</span>
                                <input v-model="selectedRecord.name" type="text" readonly>
                            </label>

                            <label class="field">
                                <span>Student Number</span>
                                <input v-model="selectedRecord.studentNumber" type="text" readonly>
                            </label>

                            <label class="field field-full">
                                <span>Violation</span>
                                <input v-model="selectedRecord.violation" type="text" readonly>
                            </label>

                            <label class="field">
                                <span>Date</span>
                                <input v-model="selectedRecord.date" type="text" readonly>
                            </label>

                            <label class="field">
                                <span>Status</span>
                                <select v-model="selectedRecord.status">
                                    <option>Active</option>
                                    <option>Pending</option>
                                    <option>Resolved</option>
                                </select>
                            </label>

                            <label class="field field-full">
                                <span>Description</span>
                                <textarea v-model="selectedRecord.description" rows="3" placeholder="Additional details about the violation"></textarea>
                            </label>

                            <label class="field field-full">
                                <span>Action Taken</span>
                                <input v-model="selectedRecord.action_taken" type="text" placeholder="What action was taken (if any)">
                            </label>
                        </div>

                        <div class="form-actions">
                            <button class="save-record-btn" @click="updateRecord">Update Report</button>
                            <button class="delete-record-btn" @click="deleteRecord">Delete Report</button>
                            <span v-if="editMessage" class="record-message">{{ editMessage }}</span>
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
import api from '../services/api.js';

export default {
    name: 'ViolationsPage',
    components: {
        AppHeader,
        Sidebar
    },
    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            selectedRecord: null,
            editMessage: '',
            loading: false,
            showAddForm: false,
            addMessage: '',
            records: [],
            violationTypes: [],
            students: [],
            newViolation: {
                student_id: '',
                violation_type_id: '',
                violation_date: '',
                description: '',
                action_taken: '',
                status: 'Pending'
            }
        };
    },
    computed: {
        filteredRecords() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.records;

            return this.records.filter((record) => {
                return [record.name, record.studentNumber, record.violation, record.description, record.date, record.status]
                    .some((value) => String(value).toLowerCase().includes(query));
            });
        },

        studentsWithViolations() {
            const studentMap = new Map();

            // Group violations by student
            this.records.forEach(violation => {
                const student = violation._raw.student || {};
                const studentId = student.student_id || violation._raw.student_id;

                if (!studentId) {
                    console.warn('Violation missing student ID:', violation);
                    return;
                }

                if (!studentMap.has(studentId)) {
                    studentMap.set(studentId, {
                        student_id: studentId,
                        name: violation.name,
                        student_number: violation.studentNumber,
                        violations: [],
                        latest_violation_date: violation._raw.violation_date
                    });
                }

                const studentEntry = studentMap.get(studentId);
                studentEntry.violations.push(violation._raw);

                // Update latest violation date
                if (violation._raw.violation_date &&
                    new Date(violation._raw.violation_date) > new Date(studentEntry.latest_violation_date)) {
                    studentEntry.latest_violation_date = violation._raw.violation_date;
                }
            });

            // Convert to array and sort by latest violation date
            return Array.from(studentMap.values()).sort((a, b) =>
                new Date(b.latest_violation_date) - new Date(a.latest_violation_date)
            );
        },

        summaryItems() {
            const baseRecords = this.searchQuery.trim() ? this.filteredRecords : this.records;
            const openCases = baseRecords.filter((record) => record.status === 'Active').length;
            const pendingReview = baseRecords.filter((record) => record.status === 'Pending').length;
            const resolved = baseRecords.filter((record) => record.status === 'Resolved').length;

            return [
                { title: 'Open Cases', value: openCases },
                { title: 'Resolved This Week', value: resolved },
                { title: 'Pending Review', value: pendingReview }
            ];
        }
    },
    methods: {
        getFormattedDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        },

        getStudentViolationStatus(violations) {
            // Return the most severe status: Active > Pending > Resolved
            const statusPriority = { 'Active': 3, 'Pending': 2, 'Resolved': 1 };
            const statuses = violations.map(v => v.status);
            const highestPriority = Math.max(...statuses.map(s => statusPriority[s] || 0));
            return Object.keys(statusPriority).find(key => statusPriority[key] === highestPriority) || 'Unknown';
        },

        viewStudentViolations(student) {
            // For now, just show an alert with violation details
            // In a real app, you might open a detailed modal
            const violationDetails = student.violations.map((v) => {
                const violationType = v.violationType || v.violation_type || this.violationTypes.find((type) => type.violation_type_id === v.violation_type_id) || {};
                return `${violationType.violation_name || 'Unknown Violation'} (${this.formatDate(v.violation_date)}) - ${v.status}`;
            }).join('\n');

            alert(`Violations for ${student.name}:\n\n${violationDetails}`);
        },

        mapViolation(violation) {
            // Handle cases where relationships might not be loaded.
            const student = violation.student || {};
            const relationViolationType = violation.violationType || violation.violation_type || {};
            const lookupViolationType = this.violationTypes.find((type) => type.violation_type_id === violation.violation_type_id);
            const violationType = relationViolationType.violation_name ? relationViolationType : lookupViolationType || {};

            const fullName = [student.first_name, student.middle_name ?? '', student.last_name]
                .filter(Boolean).join(' ') || 'Unknown Student';

            return {
                id: violation.violation_id,
                name: fullName,
                studentNumber: student.student_number || 'N/A',
                violation: violationType.violation_name || 'Unknown Violation',
                date: violation.violation_date ? new Date(violation.violation_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'N/A',
                status: violation.status || 'Unknown',
                description: violation.description,
                action_taken: violation.action_taken,
                _raw: violation,
            };
        },

        async fetchViolations() {
            this.loading = true;
            try {
                console.log('Fetching violations...');
                const { data } = await api.get('/student-violations');
                console.log('Violations data received:', data);
                this.records = data.map((item) => this.mapViolation(item));
                console.log('Mapped records:', this.records);
            } catch (err) {
                console.error('Failed to load violations:', err);
                console.error('Error response:', err.response);
            } finally {
                this.loading = false;
            }
        },

        async fetchViolationTypes() {
            try {
                const { data } = await api.get('/violation-types');
                this.violationTypes = data;
            } catch (err) {
                console.error('Failed to load violation types:', err);
            }
        },

        async fetchStudents() {
            try {
                const { data } = await api.get('/students');
                this.students = data;
            } catch (err) {
                console.error('Failed to load students:', err);
                if (err.response?.status === 404) {
                    console.warn('Students API not found. Make sure Laravel server is running.');
                }
            }
        },

        async testApiConnection() {
            try {
                await api.get('/students?limit=1');
                console.log('API connection successful');
            } catch (err) {
                console.warn('API connection failed. Make sure Laravel server is running on http://localhost:8000');
                console.warn('Start it with: php artisan serve');
            }
        },

        openRecord(record) {
            this.selectedRecord = { ...record };
            this.editMessage = '';
        },

        closeRecord() {
            this.selectedRecord = null;
            this.editMessage = '';
        },

        async updateRecord() {
            if (!this.selectedRecord.name.trim() || !this.selectedRecord.studentNumber.trim() || !this.selectedRecord.violation.trim()) {
                this.editMessage = 'Please complete all report fields.';
                return;
            }

            try {
                const { data } = await api.put(`/student-violations/${this.selectedRecord.id}`, {
                    description: this.selectedRecord.description || null,
                    action_taken: this.selectedRecord.action_taken || null,
                    status: this.selectedRecord.status,
                });

                const index = this.records.findIndex((record) => record.id === this.selectedRecord.id);
                if (index !== -1) {
                    this.records[index] = this.mapViolation(data);
                }

                this.editMessage = 'Report updated successfully.';
                setTimeout(() => {
                    this.closeRecord();
                }, 900);
            } catch (err) {
                console.error('Failed to update violation:', err);
                const errors = err.response?.data?.errors;
                if (errors) {
                    this.editMessage = Object.values(errors).flat().join(' | ');
                } else {
                    this.editMessage = err.response?.data?.message ?? 'Failed to update violation.';
                }
            }
        },

        async deleteRecord() {
            if (!this.selectedRecord) return;

            try {
                await api.delete(`/student-violations/${this.selectedRecord.id}`);
                this.records = this.records.filter((record) => record.id !== this.selectedRecord.id);
                this.editMessage = 'Report deleted successfully.';
                setTimeout(() => {
                    this.closeRecord();
                }, 700);
            } catch (err) {
                console.error('Failed to delete violation:', err);
                this.editMessage = err.response?.data?.message ?? 'Failed to delete violation.';
            }
        },

        resetForm() {
            this.newViolation = {
                student_id: '',
                violation_type_id: '',
                violation_date: '',
                description: '',
                action_taken: '',
                status: 'Pending'
            };
        },

        async addViolation() {
            const {
                student_id,
                violation_type_id,
                violation_date,
                description,
                action_taken,
                status
            } = this.newViolation;

            const missing = [];
            if (!student_id) missing.push('Student');
            if (!violation_type_id) missing.push('Violation Type');
            if (!violation_date) missing.push('Violation Date');
            if (!status) missing.push('Status');

            if (missing.length) {
                this.addMessage = `Missing: ${missing.join(', ')}`;
                return;
            }

            // Validate date
            const selectedDate = new Date(violation_date);
            if (isNaN(selectedDate.getTime())) {
                this.addMessage = 'Invalid date format';
                return;
            }

            try {
                const payload = {
                    student_id: parseInt(student_id),
                    violation_type_id: parseInt(violation_type_id),
                    violation_date,
                    description: description.trim() || null,
                    action_taken: action_taken.trim() || null,
                    status
                };

                console.log('Sending violation data:', payload);

                const { data } = await api.post('/student-violations', payload);

                this.records.unshift(this.mapViolation(data));
                this.resetForm();
                this.addMessage = 'Violation added successfully.';
                setTimeout(() => {
                    this.addMessage = '';
                    this.showAddForm = false;
                }, 2000);

            } catch (err) {
                console.error('Failed to add violation:', err);
                console.error('Error response:', err.response);
                console.error('Error status:', err.response?.status);
                console.error('Error data:', err.response?.data);

                if (err.response?.status === 404) {
                    this.addMessage = 'API endpoint not found. Make sure the Laravel server is running on http://localhost:8000';
                } else if (err.response?.status === 422) {
                    const errors = err.response.data.errors;
                    this.addMessage = Object.values(errors).flat().join(' | ');
                } else if (err.response?.status >= 500) {
                    this.addMessage = 'Server error. Check Laravel logs for details.';
                } else {
                    this.addMessage = err.response?.data?.message || err.message || 'Failed to add violation. Check console for details.';
                }
            }
        }
    },
    async mounted() {
        this.currentDate = this.getFormattedDate();
        this.testApiConnection();
        await this.fetchViolationTypes();
        await this.fetchViolations();
        this.fetchStudents();
    }
};
</script>

<style scoped>
.violations-layout {
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

.violations-content {
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

.add-violation-btn {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.page-title {
    font-size: 38px;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 15px;
    opacity: 0.85;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 18px;
    margin-bottom: 24px;
}

.empty-state {
    margin: -4px 0 24px;
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    color: #7a4a12;
    font-weight: 600;
    text-align: center;
}

.summary-card {
    background: white;
    border-radius: 18px;
    padding: 22px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.summary-label {
    display: block;
    color: #6b7280;
    margin-bottom: 12px;
}

.summary-value {
    font-size: 34px;
    color: #1a1a1a;
}

.violation-form-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.table-card {
    background: white;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.table-card h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #1a1a1a;
}

.violations-table {
    width: 100%;
    border-collapse: collapse;
}

.violations-table th {
    padding: 14px 12px;
    text-align: left;
    color: #555;
    border-bottom: 2px solid #eee;
    background: #f7f7f7;
}

.violations-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #eee;
    color: #333;
}

.record-row {
    cursor: pointer;
}

.status-badge {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
    background: #fde68a;
    color: #92400e;
    font-size: 12px;
    font-weight: 600;
}
.violation-types {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.violation-type-badge {
    padding: 4px 8px;
    border-radius: 12px;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.violation-type-more {
    background: #f3f4f6;
    color: #6b7280;
    border-color: #e5e7eb;
}
.status-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
    min-width: 170px;
}

.view-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 999px;
    background: rgba(138, 90, 32, 0.12);
    color: #8a5a20;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.view-btn:hover {
    background: rgba(138, 90, 32, 0.2);
}

.record-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 60;
}

.record-modal {
    width: min(760px, 100%);
    background: white;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

.record-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
}

.record-modal-header h2 {
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

.field input,
.field select,
.field textarea {
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

.save-record-btn {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.save-violation-btn {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.delete-record-btn {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: #ef4444;
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.record-message {
    color: #0f766e;
    font-weight: 600;
}

.violation-message {
    color: #0f766e;
    font-weight: 600;
}

.empty-table-state {
    text-align: center;
    color: #7a4a12;
    font-weight: 600;
}

@media (max-width: 768px) {
    .violations-content,
    .top-bar {
        padding-left: 20px;
        padding-right: 20px;
    }

    .page-title {
        font-size: 30px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .add-violation-btn {
        width: 100%;
    }
}
</style>
