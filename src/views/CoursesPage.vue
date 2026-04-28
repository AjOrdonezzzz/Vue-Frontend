<template>
    <div class="page-layout">
        <Sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />

        <div class="main-content">
            <AppHeader
                title="Course Management"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            />

            <div class="page-content">
                <section class="hero-card">
                    <div>
                        <p class="eyebrow">Curriculum</p>
                        <h1>Manage your course catalog and prerequisites.</h1>
                        <p class="hero-copy">This page uses your `subjects` table as the course management module.</p>
                    </div>
                    <button v-if="canManage" class="primary-btn" @click="resetForm">
                        {{ isEditing ? 'Create Another Course' : 'Add Course' }}
                    </button>
                    <span v-else class="reference-pill">Reference Only</span>
                </section>

                <section class="stats-grid">
                    <article class="stat-card">
                        <span>Total Courses</span>
                        <strong>{{ filteredCourses.length }}</strong>
                    </article>
                    <article class="stat-card">
                        <span>Core</span>
                        <strong>{{ categoryCount.Core || 0 }}</strong>
                    </article>
                    <article class="stat-card">
                        <span>Elective</span>
                        <strong>{{ categoryCount.Elective || 0 }}</strong>
                    </article>
                    <article class="stat-card">
                        <span>GE</span>
                        <strong>{{ categoryCount.GE || 0 }}</strong>
                    </article>
                </section>

                <section :class="['workspace-grid', { 'full-width': !canManage }]">
                    <article v-if="canManage" class="form-panel">
                        <!-- everything inside form-panel stays exactly the same -->
                        <div class="panel-heading">
                            <div>
                                <p class="panel-label">{{ isEditing ? 'Edit course' : 'New course' }}</p>
                                <h2>{{ isEditing ? form.subject_code : 'Create a course record' }}</h2>
                            </div>
                            <button v-if="isEditing || hasFormValues" class="ghost-btn" @click="resetForm">Clear</button>
                        </div>

                        <form class="record-form" @submit.prevent="submitCourse">
                            <label class="field">
                                <span>Course Code</span>
                                <input v-model.trim="form.subject_code" type="text" maxlength="20" placeholder="IT101">
                            </label>
                            <label class="field">
                                <span>Course Name</span>
                                <input v-model.trim="form.subject_name" type="text" maxlength="100" placeholder="Introduction to Computing">
                            </label>
                            <label class="field field-wide">
                                <span>Description</span>
                                <textarea v-model.trim="form.description" rows="3" placeholder="Brief course description"></textarea>
                            </label>
                            <label class="field">
                                <span>Department</span>
                                <select v-model="form.department_id">
                                    <option value="">Select department</option>
                                    <option v-for="department in departments" :key="department.department_id" :value="department.department_id">
                                        {{ department.department_name }}
                                    </option>
                                </select>
                            </label>
                            <label class="field">
                                <span>Category</span>
                                <select v-model="form.course_category">
                                    <option v-for="option in categoryOptions" :key="option" :value="option">{{ option }}</option>
                                </select>
                            </label>
                            <label class="field">
                                <span>Semester</span>
                                <select v-model="form.semester">
                                    <option value="">Select semester</option>
                                    <option v-for="option in semesterOptions" :key="option" :value="option">{{ option }}</option>
                                </select>
                            </label>
                            <label class="field">
                                <span>Prerequisite</span>
                                <select v-model="form.prerequisite_subject_id">
                                    <option value="">None</option>
                                    <option
                                        v-for="subject in prerequisiteOptions"
                                        :key="subject.subject_id"
                                        :value="subject.subject_id"
                                    >
                                        {{ subject.subject_code }} - {{ subject.subject_name }}
                                    </option>
                                </select>
                            </label>
                            <label class="field">
                                <span>Units</span>
                                <input v-model="form.units" type="number" min="0" max="10" placeholder="3">
                            </label>
                            <label class="field">
                                <span>Lecture Hours</span>
                                <input v-model="form.lecture_hours" type="number" min="0" placeholder="3">
                            </label>
                            <label class="field">
                                <span>Lab Hours</span>
                                <input v-model="form.lab_hours" type="number" min="0" placeholder="0">
                            </label>

                            <div class="form-actions">
                                <button class="primary-btn" type="submit" :disabled="saving">
                                    {{ saving ? 'Saving...' : isEditing ? 'Update Course' : 'Save Course' }}
                                </button>
                                <span v-if="feedbackMessage" class="feedback success">{{ feedbackMessage }}</span>
                                <span v-if="errorMessage" class="feedback error">{{ errorMessage }}</span>
                            </div>
                        </form>
                    </article>

                    <article class="table-panel">
                        <div class="panel-heading">
                            <div>
                                <p class="panel-label">Catalog</p>
                                <h2>Registered courses</h2>
                            </div>
                            <span class="result-pill">{{ filteredCourses.length }} shown</span>
                        </div>

                        <div v-if="loading" class="state-card">Loading courses...</div>
                        <div v-else-if="!filteredCourses.length" class="state-card">No courses matched your search.</div>
                        <div v-else class="table-wrap">
                            <table class="record-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Units</th>
                                        <th>Category</th>
                                        <th>Prerequisite</th>
                                        <th v-if="canManage">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="course in filteredCourses" :key="course.subject_id">
                                        <td><strong>{{ course.subject_code }}</strong></td>
                                        <td>
                                            <div class="record-cell">
                                                <strong>{{ course.subject_name }}</strong>
                                                <span>{{ course.semester || 'No semester' }}</span>
                                            </div>
                                        </td>
                                        <td>{{ course.department?.department_name || 'N/A' }}</td>
                                        <td>{{ course.units }}</td>
                                        <td>{{ course.course_category || 'N/A' }}</td>
                                        <td>{{ course.prerequisite?.subject_code || 'None' }}</td>
                                        <td v-if="canManage">
                                            <div class="action-group">
                                                <button class="table-btn" @click="openEditForm(course)">Edit</button>
                                                <button class="table-btn danger" :disabled="deletingId === course.subject_id" @click="deleteCourse(course)">
                                                    {{ deletingId === course.subject_id ? 'Deleting...' : 'Delete' }}
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
    subject_code: '',
    subject_name: '',
    description: '',
    units: '',
    lecture_hours: '',
    lab_hours: '',
    department_id: '',
    prerequisite_subject_id: '',
    course_category: 'Core',
    semester: ''
});

export default {
    name: 'CoursesPage',
    components: { AppHeader, Sidebar },
    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            loading: false,
            saving: false,
            deletingId: null,
            editingId: null,
            feedbackMessage: '',
            errorMessage: '',
            courses: [],
            departments: [],
            form: defaultForm(),
            categoryOptions: ['Core', 'Elective', 'GE'],
            semesterOptions: ['1st', '2nd', 'Summer']
        };
    },
    computed: {
        isEditing() {
            return this.editingId !== null;
        },
        canManage() {
            return isAdminUser();
        },
        hasFormValues() {
            return Object.values(this.form).some((value) => value !== '' && value !== 'Core');
        },
        prerequisiteOptions() {
            return this.courses.filter((course) => course.subject_id !== this.editingId);
        },
        filteredCourses() {
            const query = this.searchQuery.trim().toLowerCase();

            if (!query) return this.courses;

            return this.courses.filter((course) => [
                course.subject_code,
                course.subject_name,
                course.department?.department_name,
                course.course_category,
                course.semester,
                course.prerequisite?.subject_code
            ].some((value) => String(value || '').toLowerCase().includes(query)));
        },
        categoryCount() {
            return this.filteredCourses.reduce((counts, course) => {
                const key = course.course_category || 'Uncategorized';
                counts[key] = (counts[key] || 0) + 1;
                return counts;
            }, {});
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
        normalizePayload() {
            return {
                subject_code: this.form.subject_code,
                subject_name: this.form.subject_name,
                description: this.form.description || null,
                units: Number(this.form.units),
                lecture_hours: Number(this.form.lecture_hours),
                lab_hours: Number(this.form.lab_hours),
                department_id: Number(this.form.department_id),
                prerequisite_subject_id: this.form.prerequisite_subject_id ? Number(this.form.prerequisite_subject_id) : null,
                course_category: this.form.course_category,
                semester: this.form.semester || null
            };
        },
        resetForm(clearMessages = true) {
            this.form = defaultForm();
            this.editingId = null;
            if (clearMessages) {
                this.feedbackMessage = '';
                this.errorMessage = '';
            }
        },
        openEditForm(course) {
            this.editingId = course.subject_id;
            this.feedbackMessage = '';
            this.errorMessage = '';
            this.form = {
                subject_code: course.subject_code || '',
                subject_name: course.subject_name || '',
                description: course.description || '',
                units: course.units ?? '',
                lecture_hours: course.lecture_hours ?? '',
                lab_hours: course.lab_hours ?? '',
                department_id: course.department_id ?? '',
                prerequisite_subject_id: course.prerequisite_subject_id ?? '',
                course_category: course.course_category || 'Core',
                semester: course.semester || ''
            };
        },
        async fetchCourses() {
            this.loading = true;
            try {
                const [{ data: courses }, { data: departments }] = await Promise.all([
                    api.get('/subjects'),
                    api.get('/departments')
                ]);

                this.courses = Array.isArray(courses) ? courses : [];
                this.departments = Array.isArray(departments) ? departments : [];
            } catch (error) {
                this.errorMessage = error?.response?.data?.message || 'Unable to load course records.';
            } finally {
                this.loading = false;
            }
        },
        async submitCourse() {
            this.saving = true;
            this.feedbackMessage = '';
            this.errorMessage = '';

            try {
                const payload = this.normalizePayload();
                const wasEditing = this.isEditing;

                if (wasEditing) {
                    await api.put(`/subjects/${this.editingId}`, payload);
                } else {
                    await api.post('/subjects', payload);
                }

                await this.fetchCourses();
                this.resetForm(false);
                this.feedbackMessage = wasEditing ? 'Course updated successfully.' : 'Course created successfully.';
            } catch (error) {
                const validationErrors = error?.response?.data?.errors;
                this.errorMessage = validationErrors
                    ? Object.values(validationErrors).flat().join(' ')
                    : (error?.response?.data?.message || 'Unable to save course.');
            } finally {
                this.saving = false;
            }
        },
        async deleteCourse(course) {
            if (!window.confirm(`Delete ${course.subject_code} - ${course.subject_name}?`)) {
                return;
            }

            this.deletingId = course.subject_id;
            this.feedbackMessage = '';
            this.errorMessage = '';

            try {
                await api.delete(`/subjects/${course.subject_id}`);
                if (this.editingId === course.subject_id) {
                    this.resetForm(false);
                }
                await this.fetchCourses();
                this.feedbackMessage = 'Course deleted successfully.';
            } catch (error) {
                this.errorMessage = error?.response?.data?.message || 'Unable to delete course.';
            } finally {
                this.deletingId = null;
            }
        }
    },
    mounted() {
        this.currentDate = this.getFormattedDate();
        this.fetchCourses();
    }
};
</script>

<style scoped>
.page-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
    font-family: 'Poppins', sans-serif;
}

.main-content { flex: 1; display: flex; flex-direction: column; }
.page-content { padding: 24px 32px 40px; display: flex; flex-direction: column; gap: 20px; }
.hero-card, .stat-card, .form-panel, .table-panel { border-radius: 24px; }

/* Hero Card */
.hero-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 28px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    color: white;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
}

.eyebrow, .panel-label {
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: .12em;
    font-size: 12px;
    font-weight: 700;
    opacity: .72;
}

.hero-card h1, .panel-heading h2 { margin: 0; }
.hero-card h1 { max-width: 560px; font-size: 34px; line-height: 1.1; }
.hero-copy { margin: 12px 0 0; max-width: 560px; color: rgba(255, 255, 255, 0.82); }

/* Stats Grid */
.stats-grid, .workspace-grid { display: grid; gap: 18px; }
.stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.workspace-grid { grid-template-columns: minmax(340px, 420px) minmax(0, 1fr); align-items: start; }
.workspace-grid {
    grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
    align-items: start;
}

.workspace-grid.full-width {
    grid-template-columns: 1fr;
}

/* Cards */
.stat-card, .form-panel, .table-panel {
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
    letter-spacing: .08em;
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
.record-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-wide { grid-column: 1 / -1; }
.field span { color: #555; font-size: 13px; font-weight: 700; }

.field input, .field select, .field textarea {
    border: 1px solid #ddd;
    border-radius: 14px;
    background: #fff;
    color: #1a1a1a;
    font: inherit;
    padding: 12px 14px;
    transition: border-color .2s ease, box-shadow .2s ease;
    resize: vertical;
}

.field input:focus, .field select:focus, .field textarea:focus {
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
    transition: transform .2s ease, opacity .2s ease, background .2s ease;
}

.primary-btn {
    padding: 12px 18px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.primary-btn:hover { transform: translateY(-2px); background: linear-gradient(135deg, #b8a090 0%, #9a8a7a 100%); }

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
    opacity: .6;
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
    letter-spacing: .08em;
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
.record-table { width: 100%; border-collapse: collapse; }

.record-table th, .record-table td {
    padding: 16px 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
}

.record-table th {
    background: #f5f5f5;
    color: #555;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
}

.record-table td { color: #333; font-size: 14px; }
.record-table tbody tr:hover { background: #f9f9f9; }

.record-cell { display: flex; flex-direction: column; gap: 4px; }
.record-cell strong { font-size: 15px; color: #1a1a1a; }
.record-cell span   { color: #8a5a20; font-size: 12px; }

.action-group { display: flex; gap: 8px; }

.table-btn.danger {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
}

.table-btn.danger:hover {
    background: rgba(239, 68, 68, 0.2);
}

/* Responsive */
@media (max-width: 1100px) {
    .stats-grid, .workspace-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .page-content { padding: 16px 20px 32px; }
    .hero-card { flex-direction: column; align-items: flex-start; }
    .hero-card h1 { font-size: 28px; }
    .record-form { grid-template-columns: 1fr; }
    .form-actions, .action-group { flex-direction: column; align-items: stretch; }
    .primary-btn, .ghost-btn, .table-btn { width: 100%; text-align: center; }
}
</style>