<template>
    <div class="students-layout">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                title="Students Directory"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="students-content">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Students</h1>
                        <p class="page-subtitle">Browse enrolled students and quick profile details.</p>
                    </div>
                    <div class="header-actions">
                        <button class="view-toggle-btn" @click="toggleViewMode">
                            {{ viewMode === 'cards' ? 'Table View' : 'Card View' }}
                        </button>
                        <button class="add-student-btn" @click="showAddForm = !showAddForm">
                            {{ showAddForm ? 'Close Form' : 'Add Student' }}
                        </button>
                    </div>
                </div>

                <!-- Add Student Form -->
                <section v-if="showAddForm" class="student-form-card">
                    <div class="form-grid">
                        <div class="field">
                            <span>First Name <span class="required">*</span></span>
                            <input v-model="newStudent.first_name" type="text" placeholder="Enter first name">
                        </div>
                        <div class="field">
                            <span>Last Name <span class="required">*</span></span>
                            <input v-model="newStudent.last_name" type="text" placeholder="Enter last name">
                        </div>
                        <div class="field">
                            <span>Middle Name</span>
                            <input v-model="newStudent.middle_name" type="text" placeholder="Enter middle name (optional)">
                        </div>
                        <div class="field">
                            <span>Student Number <span class="required">*</span></span>
                            <input v-model="newStudent.studentNumber" type="text" placeholder="e.g. 2024-00121">
                        </div>
                        <div class="field">
                            <span>Gender <span class="required">*</span></span>
                            <select v-model="newStudent.gender">
                                <option value="">Select gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div class="field">
                            <span>Birthdate <span class="required">*</span></span>
                            <input v-model="newStudent.birthdate" type="date">
                        </div>
                        <div class="field">
                            <span>Civil Status</span>
                            <select v-model="newStudent.civil_status">
                                <option value="">Select civil status</option>
                                <option>Single</option>
                                <option>Married</option>
                                <option>Widowed</option>
                            </select>
                        </div>
                        <div class="field">
                            <span>Contact Number</span>
                            <input v-model="newStudent.contact_number" type="text" placeholder="e.g. 09xxxxxxxxx">
                        </div>
                        <div class="field">
                            <span>Email</span>
                            <input v-model="newStudent.email" type="email" placeholder="Enter email address">
                        </div>
                        <div class="field">
                            <span>Status <span class="required">*</span></span>
                            <select v-model="newStudent.status">
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Probationary</option>
                            </select>
                        </div>
                        <div class="field">
                            <span>Section Name <span class="required">*</span></span>
                            <input v-model="newStudent.section_name" type="text" placeholder="e.g. BSIT 3A">
                        </div>
                        <div class="field">
                            <span>Year Level <span class="required">*</span></span>
                            <input v-model="newStudent.year_level" type="number" placeholder="e.g. 3" min="1" max="6">
                        </div>
                        <div class="field">
                            <span>School Year <span class="required">*</span></span>
                            <input v-model="newStudent.school_year" type="text" placeholder="e.g. 2024-2025">
                        </div>
                        <div class="field">
                            <span>Guardian First Name <span class="required">*</span></span>
                            <input v-model="newStudent.guardian_first_name" type="text" placeholder="Enter guardian first name">
                        </div>
                        <div class="field">
                            <span>Guardian Last Name <span class="required">*</span></span>
                            <input v-model="newStudent.guardian_last_name" type="text" placeholder="Enter guardian last name">
                        </div>
                        <div class="field">
                            <span>Guardian Email <span class="required">*</span></span>
                            <input v-model="newStudent.guardian_email" type="email" placeholder="Enter guardian email">
                        </div>
                        <div class="field">
                            <span>Guardian Contact Number</span>
                            <input v-model="newStudent.guardian_contact" type="text" placeholder="e.g. 09xxxxxxxxx">
                        </div>
                        <div class="field" style="grid-column: span 2;">
                            <span>Address</span>
                            <input v-model="newStudent.address" type="text" placeholder="Enter full address">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="save-student-btn" @click="addStudent">Save Student</button>
                        <span v-if="studentMessage" class="student-message">{{ studentMessage }}</span>
                    </div>
                </section>

                <!-- Filter by Skill Section -->
                <div class="filter-section">
                    <div class="filter-header">
                        <span class="filter-title">Filter by skill</span>
                        <div class="skill-search-wrapper">
                            <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                <circle cx="8.5" cy="8.5" r="5.5"/>
                                <path d="m13 13 4 4"/>
                            </svg>
                            <input
                                v-model="skillSearchInput"
                                type="text"
                                placeholder="Search or select a skill..."
                                class="skill-input"
                            />
                            <div v-if="skillSearchInput && filteredSkillList.length" class="skill-dropdown">
                                <button
                                    v-for="skill in filteredSkillList"
                                    :key="skill"
                                    @click="setSkillFilter(skill)"
                                    class="dropdown-item"
                                >
                                    {{ skill }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Skill Pills -->
                    <div class="skill-pills">
                        <button
                            v-for="skill in allSkills"
                            :key="skill"
                            :class="['skill-pill', { active: skillFilter === skill }]"
                            @click="setSkillFilter(skill)"
                        >
                            {{ skill }}
                        </button>
                        <button
                            v-if="skillFilter || searchQuery"
                            class="skill-pill clear-pill"
                            @click="clearFilters"
                        >
                            Clear Filters ✕
                        </button>
                    </div>
                </div>

                <!-- Active Filters Display -->
                <div v-if="skillFilter || searchQuery" class="active-filters">
                    <span class="filter-label">Active filters:</span>
                    <div class="filter-badges">
                        <span v-if="skillFilter" class="filter-badge">
                            Skill: {{ skillFilter }}
                            <button class="badge-remove" @click="skillFilter = ''">×</button>
                        </span>
                        <span v-if="searchQuery" class="filter-badge">
                            Search: {{ searchQuery }}
                            <button class="badge-remove" @click="searchQuery = ''">×</button>
                        </span>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="empty-state">Loading students...</div>

                <!-- Students Display -->
                <div v-else-if="paginatedStudents.length">
                    <!-- Table View (Only shows when viewMode === 'table') -->
                    <div v-if="viewMode === 'table' && paginatedStudents.length" class="student-table-container">
                        <table class="student-table">
                            <thead>
                                <tr>
                                    <th>Avatar</th>
                                    <th>Name</th>
                                    <th>Course</th>
                                    <th>Student Number</th>
                                    <th>Skills</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="student in paginatedStudents"
                                    :key="student.id"
                                    class="student-table-row"
                                    @click="openStudent(student)"
                                >
                                    <td class="avatar-cell">
                                        <div class="student-avatar">{{ student.initials }}</div>
                                    </td>
                                    <td class="name-cell">{{ student.name }}</td>
                                    <td>{{ student.course }}</td>
                                    <td>{{ student.studentNumber }}</td>
                                    <td>
                                        <div v-if="student.skills.length" class="skill-badges-row">
                                            <span
                                                v-for="skill in student.skills.slice(0, 3)"
                                                :key="skill"
                                                class="skill-badge"
                                            >{{ skill }}</span>
                                            <span v-if="student.skills.length > 3" class="skill-badge more">
                                                +{{ student.skills.length - 3 }}
                                            </span>
                                        </div>
                                        <span v-else class="no-skills">-</span>
                                    </td>
                                    <td>
                                        <span :class="['status-badge', student.status.toLowerCase()]">
                                            {{ student.status }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Card View (Only shows when viewMode === 'cards') -->
                    <div v-if="viewMode === 'cards' && paginatedStudents.length" class="student-grid">
                        <article
                            class="student-card"
                            v-for="student in paginatedStudents"
                            :key="student.id"
                            @click="openStudent(student)"
                        >
                            <div class="student-avatar">{{ student.initials }}</div>
                            <div class="student-info">
                                <h3>{{ student.name }}</h3>
                                <p>{{ student.course }}</p>
                                <span>{{ student.studentNumber }}</span>
                            </div>
                            <div v-if="student.skills.length" class="skill-badges">
                                <span
                                    v-for="skill in student.skills.slice(0, 3)"
                                    :key="skill"
                                    class="skill-badge"
                                >{{ skill }}</span>
                                <span v-if="student.skills.length > 3" class="skill-badge more">
                                    +{{ student.skills.length - 3 }}
                                </span>
                            </div>
                            <div :class="['student-status', student.status.toLowerCase()]">
                                {{ student.status }}
                            </div>
                        </article>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    No students matched your search.
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="pagination">
                    <button
                        class="pagination-btn"
                        :disabled="currentPage === 1"
                        @click="prevPage"
                    >
                        Previous
                    </button>
                    <span class="pagination-info">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>
                    <button
                        class="pagination-btn"
                        :disabled="currentPage === totalPages"
                        @click="nextPage"
                    >
                        Next
                    </button>
                </div>

                <!-- Student Edit Modal -->
                <div v-if="selectedStudent" class="student-modal-overlay" @click.self="closeStudent">
                    <div class="student-modal">
                        <div class="student-modal-header">
                            <h2>Edit Student</h2>
                            <button class="close-btn" @click="closeStudent">×</button>
                        </div>
                        <div class="form-grid">
                            <div class="field">
                                <span>Full name</span>
                                <input v-model="selectedStudent.name" type="text">
                            </div>
                            <div class="field">
                                <span>Course</span>
                                <input v-model="selectedStudent.course" type="text">
                            </div>
                            <div class="field">
                                <span>Student number</span>
                                <input v-model="selectedStudent.studentNumber" type="text">
                            </div>
                            <div class="field">
                                <span>Status</span>
                                <select v-model="selectedStudent.status">
                                    <option>Active</option>
                                    <option>Inactive</option>
                                    <option>Probationary</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="save-student-btn" @click="updateStudent">Update Student</button>
                            <button class="delete-student-btn" @click="deleteStudent">Delete Student</button>
                            <span v-if="editMessage" class="student-message">{{ editMessage }}</span>
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
    name: 'StudentsPage',
    components: { AppHeader, Sidebar },

    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            showAddForm: false,
            studentMessage: '',
            editMessage: '',
            selectedStudent: null,
            searchQuery: '',
            skillFilter: '',
            skillSearchInput: '',
            loading: false,
            viewMode: 'table',
            currentPage: 1,
            itemsPerPage: 10,
            remoteTotalPages: 1,
            remoteTotalStudents: 0,

            newStudent: {
                first_name: '', last_name: '', middle_name: '',
                studentNumber: '', gender: '', birthdate: '',
                civil_status: '', contact_number: '', email: '',
                address: '', status: 'Active',
                section_name: '', year_level: '', school_year: '',
                guardian_first_name: '', guardian_last_name: '',
                guardian_email: '', guardian_contact: '',
            },

            students: []
        };
    },

    computed: {
        allSkills() {
            const skillSet = new Set();
            this.students.forEach((s) => {
                if (s.skills && Array.isArray(s.skills)) {
                    s.skills.forEach((sk) => skillSet.add(sk));
                }
            });
            return [...skillSet].sort();
        },

        filteredSkillList() {
            const query = this.skillSearchInput.toLowerCase();
            return this.allSkills.filter(s => s.toLowerCase().includes(query));
        },

        paginatedStudents() {
            return this.students;
        },

        totalPages() {
            return this.remoteTotalPages;
        },
    },

    methods: {
        getFormattedDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        },

        getInitials(name) {
            return name.split(' ').filter(Boolean).slice(0, 2)
                .map((p) => p[0]?.toUpperCase() || '').join('');
        },

        mapStudent(s) {
            const fullName = [s.first_name, s.last_name]
                .filter(Boolean).join(' ');

            const skills = (s.skills ?? []).map((sk) => {
                if (typeof sk === 'string') return sk;
                return sk.skill?.skill_name ?? sk.skill_name ?? '';
            }).filter(Boolean);

            return {
                id: s.student_id || s.id,
                name: fullName,
                course: s.section?.section_name || 'N/A',
                studentNumber: s.student_number,
                status: s.status,
                initials: this.getInitials(fullName),
                skills,
                _raw: s,
            };
        },

        setSkillFilter(skill) {
            this.skillFilter = skill;
            this.skillSearchInput = '';
            this.currentPage = 1;
            this.fetchStudents();
        },

        clearFilters() {
            this.skillFilter = '';
            this.searchQuery = '';
            this.skillSearchInput = '';
            this.currentPage = 1;
            this.fetchStudents();
        },

        toggleViewMode() {
            this.viewMode = this.viewMode === 'cards' ? 'table' : 'cards';
        },

        async nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                await this.fetchStudents();
            }
        },

        async prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                await this.fetchStudents();
            }
        },

        async fetchStudents() {
            this.loading = true;
            try {
                const params = new URLSearchParams();
                params.append('page', this.currentPage);
                params.append('limit', this.itemsPerPage);

                if (this.searchQuery) {
                    params.append('q', this.searchQuery);
                }

                if (this.skillFilter) {
                    params.append('skill', this.skillFilter);
                }

                const { data } = await api.get(`/students?${params.toString()}`);

                const pageData = data.data || data;
                this.students = (Array.isArray(pageData) ? pageData : []).map(s => this.mapStudent(s));

                this.remoteTotalPages = data.last_page || Math.ceil(pageData.length / this.itemsPerPage) || 1;
                this.remoteTotalStudents = data.total || pageData.length || 0;

            } catch (err) {
                console.error('Failed to load students:', err);
                this.students = [];
            } finally {
                this.loading = false;
            }
        },

        resetForm() {
            this.newStudent = {
                first_name: '', last_name: '', middle_name: '',
                studentNumber: '', gender: '', birthdate: '',
                civil_status: '', contact_number: '', email: '',
                address: '', status: 'Active',
                section_name: '', year_level: '', school_year: '',
                guardian_first_name: '', guardian_last_name: '',
                guardian_email: '', guardian_contact: '',
            };
        },

        async addStudent() {
            // Implement add logic
        },

        openStudent(student) {
            this.selectedStudent = { ...student };
            this.editMessage = '';
        },

        closeStudent() {
            this.selectedStudent = null;
            this.editMessage = '';
        },

        async updateStudent() {
            // Implement update logic
        },

        async deleteStudent() {
            // Implement delete logic
        }
    },

    watch: {
        searchQuery() {
            this.currentPage = 1;
            this.fetchStudents();
        },
        skillFilter() {  // ✅ ADD THIS - Was missing!
            this.currentPage = 1;
            this.fetchStudents();
        }
    },

    mounted() {
        this.currentDate = this.getFormattedDate();
        this.fetchStudents();
    }
};
</script>

<style scoped>
.required { color: #ef4444; }

.students-layout {
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

.students-content {
    padding: 24px 32px 40px;
}

.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
    color: white;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.page-title {
    font-size: 38px;
    margin-bottom: 8px;
    font-weight: 700;
}

.page-subtitle {
    font-size: 14px;
    opacity: 0.85;
}

.view-toggle-btn,
.add-student-btn {
    padding: 10px 18px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.view-toggle-btn:hover,
.add-student-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.add-student-btn {
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    border: none;
}

.student-form-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field span {
    color: #555;
    font-size: 13px;
    font-weight: 600;
}

.field input,
.field select {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font: inherit;
    font-size: 14px;
}

.form-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 18px;
}

.save-student-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.delete-student-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 999px;
    background: #ef4444;
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.student-message {
    color: #0f766e;
    font-weight: 600;
    font-size: 13px;
}

/* ✅ Filter Section */
.filter-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(4px);
}

.filter-header {
    display: flex;
    align-items: center;
    gap: 16px;
}

.filter-title {
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.skill-search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
}

.skill-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font: inherit;
    font-size: 13px;
    transition: all 0.2s ease;
}

.skill-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.skill-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
}

.skill-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-height: 250px;
    overflow-y: auto;
    z-index: 50;
}

.dropdown-item {
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: none;
    color: #333;
    text-align: left;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #f3f4f6;
    color: #7a3902;
}

/* ✅ Skill Pills */
.skill-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-pill {
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.skill-pill:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.7);
}

.skill-pill.active {
    background: white;
    color: #7a3902;
    border-color: white;
}

.clear-pill {
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
    color: white;
}

.clear-pill:hover {
    background: rgba(239, 68, 68, 0.85);
}

/* Active Filters */
.active-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
}

.filter-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 600;
}

.filter-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.filter-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    font-weight: 600;
}

.badge-remove {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 14px;
}

/* Table View (Default) */
.student-table-container {
    background: white;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    margin-bottom: 24px;
}

.student-table {
    width: 100%;
    border-collapse: collapse;
}

.student-table thead {
    background: #f8f9fa;
}

.student-table th {
    padding: 16px;
    text-align: left;
    color: #555;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid #e9ecef;
}

.student-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e9ecef;
    font-size: 13px;
    color: #333;
}

.student-table-row {
    cursor: pointer;
    transition: background 0.2s;
}

.student-table-row:hover {
    background: #f8f9fa;
}

.avatar-cell {
    width: 60px;
}

.student-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #c4956b, #9d5a16);
    color: white;
    font-size: 16px;
    font-weight: 700;
}

.name-cell {
    font-weight: 600;
    color: #1a1a1a;
}

/* Skill Badges */
.skill-badges-row,
.skill-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.skill-badge {
    padding: 4px 8px;
    border-radius: 6px;
    background: #fde2d4;
    color: #7a3902;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid #fcc6a0;
}

.skill-badge.more {
    background: #f3f4f6;
    color: #6b7280;
    border-color: #e5e7eb;
}

.no-skills {
    color: #9ca3af;
}

/* Status Badge */
.status-badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge.active {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.inactive {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.probationary {
    background: #dbeafe;
    color: #0c4a6e;
}

/* Card Grid (Alternative View) */
.student-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.student-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
     border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.student-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 32px rgba(0, 0, 0, 0.16);
}

.student-info h3 {
    font-size: 16px;
    color: #1a1a1a;
    margin: 12px 0 4px;
    font-weight: 700;
}

.student-info p {
    color: #6b7280;
    font-size: 13px;
    margin-bottom: 4px;
}

.student-info span {
    color: #8a5a20;
    font-size: 12px;
    font-weight: 600;
}

.student-status {
    display: inline-block;
    margin-top: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}

.student-status.active {
    background: #fef3c7;
    color: #92400e;
}

.student-status.inactive {
    background: #fee2e2;
    color: #991b1b;
}

.student-status.probationary {
    background: #dbeafe;
    color: #0c4a6e;
}

/* Empty State */
.empty-state {
    padding: 32px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.9);
    color: #7a4a12;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 24px;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.pagination-btn {
    padding: 8px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    color: #7a3902;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #7a3902;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    color: #6b7280;
    font-weight: 600;
    font-size: 13px;
}

/* Modal */
.student-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 60;
}

.student-modal {
    width: min(600px, 100%);
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
}

.student-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.student-modal-header h2 {
    color: #1a1a1a;
    font-size: 20px;
}

.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: #f3f4f6;
    font-size: 20px;
    cursor: pointer;
    transition: background 0.2s;
}

.close-btn:hover {
    background: #e5e7eb;
}

@media (max-width: 768px) {
    .students-content {
        padding: 16px 20px 32px;
    }

    .page-header {
        flex-direction: column;
    }

    .header-actions {
        flex-direction: column;
        width: 100%;
    }

    .view-toggle-btn,
    .add-student-btn {
        width: 100%;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .page-title {
        font-size: 28px;
    }

    .filter-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .skill-search-wrapper {
        width: 100%;
        max-width: 100%;
    }

    .student-table-container {
        overflow-x: auto;
    }

    .student-table {
        font-size: 12px;
    }

    .student-table th,
    .student-table td {
        padding: 10px 8px;
    }
}
</style>
