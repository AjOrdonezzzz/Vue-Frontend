<template>
    <div class="reports-layout">
        <sidebar :is-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen"></sidebar>

        <div class="main-content">
            <app-header
                title="Reports Center"
                :subtitle="currentDate"
                :search-query="searchQuery"
                @update:search-query="searchQuery = $event"
            ></app-header>

            <div class="reports-content">
                <div class="page-header">
                    <h1 class="page-title">Reports</h1>
                    <p class="page-subtitle">View generated summaries for attendance, violations, and student status.</p>
                </div>

                <!-- Report Type Cards -->
                <div class="report-grid">
                    <article
                        class="report-card"
                        v-for="report in filteredReports"
                        :key="report.id"
                        :class="{ active: activeReport === report.id }"
                        @click="selectReport(report)"
                    >
                        <div class="report-icon">{{ report.icon }}</div>
                        <h3>{{ report.title }}</h3>
                        <p>{{ report.description }}</p>
                        <span class="report-meta">Updated {{ report.updated }}</span>
                    </article>
                </div>

                <div v-if="!filteredReports.length" class="empty-state">
                    No reports matched your search.
                </div>

                <!-- Search & Filter Panel -->
                <div v-if="activeReport" class="search-panel">
                    <div class="search-panel-header">
                        <div>
                            <h2>{{ activeReportTitle }}</h2>
                            <p>Search and filter to build your report, then export as PDF.</p>
                        </div>
                        <div class="search-panel-actions">
                            <button class="export-btn" :disabled="!filteredResults.length || exporting" @click="exportPDF">
                                {{ exporting ? 'Preparing...' : '⬇ Export PDF' }}
                            </button>
                            <button class="clear-btn" @click="clearReport">✕ Close</button>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="filter-grid">
                        <div class="filter-field">
                            <span>Name / Student No.</span>
                            <input v-model="filters.keyword" type="text" placeholder="Search by name or student number...">
                        </div>
                        <div class="filter-field">
                            <span>Status</span>
                            <select v-model="filters.status">
                                <option value="">All Statuses</option>
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Probationary</option>
                            </select>
                        </div>
                        <div class="filter-field">
                            <span>Section</span>
                            <input v-model="filters.section" type="text" placeholder="e.g. BSIT-3A">
                        </div>
                        <div class="filter-field">
                            <span>School Year</span>
                            <input v-model="filters.school_year" type="text" placeholder="e.g. 2024-2025">
                        </div>
                        <div v-if="activeReport === 2" class="filter-field">
                            <span>Violation Status</span>
                            <select v-model="filters.violation_status">
                                <option value="">All</option>
                                <option>Active</option>
                                <option>Resolved</option>
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>

                    <!-- Results Count -->
                    <div class="results-meta">
                        <span v-if="resultsLoading">Loading records...</span>
                        <span v-else>
                            Showing <strong>{{ filteredResults.length }}</strong> of
                            <strong>{{ rawResults.length }}</strong> records
                        </span>
                    </div>

                    <!-- Results Table -->
                    <div v-if="resultsLoading" class="state-card">Loading data...</div>
                    <div v-else-if="!filteredResults.length" class="state-card">No records matched your filters.</div>
                    <div v-else class="table-wrap">
                        <!-- Student Enrollment Table -->
                        <table v-if="activeReport === 3 || activeReport === 1" class="result-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student No.</th>
                                    <th>Full Name</th>
                                    <th>Section</th>
                                    <th>School Year</th>
                                    <th>Status</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(student, index) in filteredResults" :key="student.student_id">
                                    <td>{{ index + 1 }}</td>
                                    <td><strong>{{ student.student_number }}</strong></td>
                                    <td>{{ student.last_name }}, {{ student.first_name }} {{ student.middle_name ? student.middle_name[0] + '.' : '' }}</td>
                                    <td>{{ student.section?.section_name ?? 'N/A' }}</td>
                                    <td>{{ student.section?.school_year ?? 'N/A' }}</td>
                                    <td><span :class="['status-pill', student.status?.toLowerCase()]">{{ student.status }}</span></td>
                                    <td>{{ student.contact_number ?? 'N/A' }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Violation Analytics Table -->
                        <table v-else-if="activeReport === 2" class="result-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student No.</th>
                                    <th>Full Name</th>
                                    <th>Violation</th>
                                    <th>Severity</th>
                                    <th>Date</th>
                                    <th>Action Taken</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(v, index) in filteredResults" :key="v.violation_id">
                                    <td>{{ index + 1 }}</td>
                                    <td><strong>{{ v.student?.student_number ?? 'N/A' }}</strong></td>
                                    <td>{{ v.student?.last_name }}, {{ v.student?.first_name }}</td>
                                    <td>{{ v.violationType?.violation_name ?? 'N/A' }}</td>
                                    <td>{{ v.violationType?.severity_level ?? 'N/A' }}</td>
                                    <td>{{ formatDate(v.violation_date) }}</td>
                                    <td>{{ v.action_taken ?? 'N/A' }}</td>
                                    <td><span :class="['status-pill', v.status?.toLowerCase()]">{{ v.status }}</span></td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Pending Cases Table -->
                        <table v-else-if="activeReport === 4" class="result-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student No.</th>
                                    <th>Full Name</th>
                                    <th>Violation</th>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(v, index) in filteredResults" :key="v.violation_id">
                                    <td>{{ index + 1 }}</td>
                                    <td><strong>{{ v.student?.student_number ?? 'N/A' }}</strong></td>
                                    <td>{{ v.student?.last_name }}, {{ v.student?.first_name }}</td>
                                    <td>{{ v.violationType?.violation_name ?? 'N/A' }}</td>
                                    <td>{{ formatDate(v.violation_date) }}</td>
                                    <td>{{ v.description ?? 'N/A' }}</td>
                                    <td><span :class="['status-pill', v.status?.toLowerCase()]">{{ v.status }}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- PDF Print Frame (hidden) -->
        <div id="pdf-print-area" style="display:none;">
            <div class="pdf-report">
                <div class="pdf-header">
                    <div class="pdf-school-info">
                        <h1>Student Profiling System</h1>
                        <p>Official Report Document</p>
                    </div>
                    <div class="pdf-meta">
                        <p><strong>Report Type:</strong> {{ activeReportTitle }}</p>
                        <p><strong>Generated By:</strong> {{ currentUser }}</p>
                        <p><strong>Date Generated:</strong> {{ currentDate }}</p>
                        <p><strong>Total Records:</strong> {{ filteredResults.length }}</p>
                        <p v-if="filters.section"><strong>Section Filter:</strong> {{ filters.section }}</p>
                        <p v-if="filters.status"><strong>Status Filter:</strong> {{ filters.status }}</p>
                        <p v-if="filters.school_year"><strong>School Year:</strong> {{ filters.school_year }}</p>
                    </div>
                </div>
                <hr class="pdf-divider">
                <h2 class="pdf-title">{{ activeReportTitle }}</h2>

                <!-- Student Tables for PDF -->
                <table v-if="activeReport === 3 || activeReport === 1" class="pdf-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student No.</th>
                            <th>Full Name</th>
                            <th>Section</th>
                            <th>School Year</th>
                            <th>Status</th>
                            <th>Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(student, index) in filteredResults" :key="student.student_id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ student.student_number }}</td>
                            <td>{{ student.last_name }}, {{ student.first_name }} {{ student.middle_name ? student.middle_name[0] + '.' : '' }}</td>
                            <td>{{ student.section?.section_name ?? 'N/A' }}</td>
                            <td>{{ student.section?.school_year ?? 'N/A' }}</td>
                            <td>{{ student.status }}</td>
                            <td>{{ student.contact_number ?? 'N/A' }}</td>
                        </tr>
                    </tbody>
                </table>

                <table v-else-if="activeReport === 2" class="pdf-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student No.</th>
                            <th>Full Name</th>
                            <th>Violation</th>
                            <th>Severity</th>
                            <th>Date</th>
                            <th>Action Taken</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(v, index) in filteredResults" :key="v.violation_id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ v.student?.student_number ?? 'N/A' }}</td>
                            <td>{{ v.student?.last_name }}, {{ v.student?.first_name }}</td>
                            <td>{{ v.violationType?.violation_name ?? 'N/A' }}</td>
                            <td>{{ v.violationType?.severity_level ?? 'N/A' }}</td>
                            <td>{{ formatDate(v.violation_date) }}</td>
                            <td>{{ v.action_taken ?? 'N/A' }}</td>
                            <td>{{ v.status }}</td>
                        </tr>
                    </tbody>
                </table>

                <table v-else-if="activeReport === 4" class="pdf-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student No.</th>
                            <th>Full Name</th>
                            <th>Violation</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(v, index) in filteredResults" :key="v.violation_id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ v.student?.student_number ?? 'N/A' }}</td>
                            <td>{{ v.student?.last_name }}, {{ v.student?.first_name }}</td>
                            <td>{{ v.violationType?.violation_name ?? 'N/A' }}</td>
                            <td>{{ formatDate(v.violation_date) }}</td>
                            <td>{{ v.description ?? 'N/A' }}</td>
                            <td>{{ v.status }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="pdf-footer">
                    <p>This is a system-generated report. — Student Profiling System</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import api from '../services/api.js';
import { isAdminUser, getUser } from '../utils/auth';

export default {
    name: 'ReportsPage',
    components: { AppHeader, Sidebar },

    data() {
        return {
            sidebarOpen: true,
            currentDate: '',
            searchQuery: '',
            activeReport: null,
            rawResults: [],
            resultsLoading: false,
            exporting: false,
            currentUser: '',

            filters: {
                keyword:          '',
                status:           '',
                section:          '',
                school_year:      '',
                violation_status: '',
            },

            reports: [
                { id: 1, icon: '📄', title: 'Attendance Summary',       description: 'Overview of monthly attendance trends and absences.',         updated: '2 hours ago' },
                { id: 2, icon: '📊', title: 'Violation Analytics',       description: 'Breakdown of reported cases by category and status.',         updated: 'Today'       },
                { id: 3, icon: '🧾', title: 'Student Enrollment List',   description: 'Latest roster of enrolled students for the semester.',        updated: 'Yesterday'   },
                { id: 4, icon: '📌', title: 'Pending Case Report',       description: 'List of unresolved and under-review student cases.',          updated: '3 days ago'  },
            ],
        };
    },

    computed: {
        filteredReports() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.reports;
            return this.reports.filter((r) =>
                [r.title, r.description, r.updated]
                    .some((v) => String(v).toLowerCase().includes(query))
            );
        },

        activeReportTitle() {
            return this.reports.find((r) => r.id === this.activeReport)?.title ?? '';
        },

        filteredResults() {
            let list = this.rawResults;
            const kw = this.filters.keyword.trim().toLowerCase();

            // Student-based reports
            if (this.activeReport === 1 || this.activeReport === 3) {
                if (kw) {
                    list = list.filter((s) =>
                        [s.student_number, s.first_name, s.last_name, s.middle_name]
                            .some((v) => String(v ?? '').toLowerCase().includes(kw))
                    );
                }
                if (this.filters.status) {
                    list = list.filter((s) => s.status === this.filters.status);
                }
                if (this.filters.section.trim()) {
                    const sec = this.filters.section.trim().toLowerCase();
                    list = list.filter((s) =>
                        String(s.section?.section_name ?? '').toLowerCase().includes(sec)
                    );
                }
                if (this.filters.school_year.trim()) {
                    const sy = this.filters.school_year.trim().toLowerCase();
                    list = list.filter((s) =>
                        String(s.section?.school_year ?? '').toLowerCase().includes(sy)
                    );
                }
            }

            // Violation-based reports
            if (this.activeReport === 2 || this.activeReport === 4) {
                if (kw) {
                    list = list.filter((v) =>
                        [v.student?.student_number, v.student?.first_name, v.student?.last_name]
                            .some((val) => String(val ?? '').toLowerCase().includes(kw))
                    );
                }
                if (this.filters.violation_status) {
                    list = list.filter((v) => v.status === this.filters.violation_status);
                }
                if (this.filters.section.trim()) {
                    const sec = this.filters.section.trim().toLowerCase();
                    list = list.filter((v) =>
                        String(v.student?.section?.section_name ?? '').toLowerCase().includes(sec)
                    );
                }
            }

            return list;
        },
    },

    methods: {
        getFormattedDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date().toLocaleDateString('en-US', options);
        },

        formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
            });
        },

        async selectReport(report) {
            this.activeReport = report.id;
            this.rawResults   = [];
            this.filters      = { keyword: '', status: '', section: '', school_year: '', violation_status: '' };
            await this.fetchReportData();
        },

        clearReport() {
            this.activeReport = null;
            this.rawResults   = [];
            this.filters      = { keyword: '', status: '', section: '', school_year: '', violation_status: '' };
        },

        async fetchReportData() {
            this.resultsLoading = true;
            try {
                // Reports 1 & 3 — pull from students
                if (this.activeReport === 1 || this.activeReport === 3) {
                    const { data } = await api.get('/students');
                    this.rawResults = data;
                }

                // Report 2 — all violations
                if (this.activeReport === 2) {
                    const { data } = await api.get('/student-violations');
                    this.rawResults = data;
                }

                // Report 4 — pending/unresolved violations only
                if (this.activeReport === 4) {
                    const { data } = await api.get('/student-violations');
                    this.rawResults = data.filter((v) =>
                        ['Pending', 'Active'].includes(v.status)
                    );
                    // Pre-set violation status filter
                    this.filters.violation_status = 'Pending';
                }
            } catch (err) {
                console.error('Failed to load report data:', err);
            } finally {
                this.resultsLoading = false;
            }
        },

        async exportPDF() {
            this.exporting = true;

            try {
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');

                const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                const pageWidth = doc.internal.pageSize.getWidth();
                const now = new Date().toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });

                // ── Header ──────────────────────────────────────────────
                doc.setFillColor(122, 57, 2);
                doc.rect(0, 0, pageWidth, 28, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text('Student Profiling System', 14, 11);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.text('Official Report Document', 14, 18);

                // Right side meta
                doc.setFontSize(8);
                doc.text(`Report: ${this.activeReportTitle}`, pageWidth - 14, 9,  { align: 'right' });
                doc.text(`Generated by: ${this.currentUser}`,  pageWidth - 14, 14, { align: 'right' });
                doc.text(`Date: ${now}`,                        pageWidth - 14, 19, { align: 'right' });
                doc.text(`Total Records: ${this.filteredResults.length}`, pageWidth - 14, 24, { align: 'right' });

                // ── Active Filters Summary ───────────────────────────────
                let yPos = 36;
                doc.setTextColor(80, 40, 5);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.text(this.activeReportTitle, 14, yPos);
                yPos += 6;

                const activeFilters = [];
                if (this.filters.keyword)          activeFilters.push(`Keyword: "${this.filters.keyword}"`);
                if (this.filters.status)           activeFilters.push(`Status: ${this.filters.status}`);
                if (this.filters.section)          activeFilters.push(`Section: ${this.filters.section}`);
                if (this.filters.school_year)      activeFilters.push(`School Year: ${this.filters.school_year}`);
                if (this.filters.violation_status) activeFilters.push(`Violation Status: ${this.filters.violation_status}`);

                if (activeFilters.length) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(120, 80, 20);
                    doc.text(`Filters applied: ${activeFilters.join('  |  ')}`, 14, yPos);
                    yPos += 5;
                }

                // ── Build Table Columns & Rows ───────────────────────────
                let columns = [];
                let rows    = [];

                // Student Enrollment / Attendance
                if (this.activeReport === 1 || this.activeReport === 3) {
                    columns = [
                        { header: '#',             dataKey: 'no'       },
                        { header: 'Student No.',   dataKey: 'sno'      },
                        { header: 'Full Name',     dataKey: 'name'     },
                        { header: 'Section',       dataKey: 'section'  },
                        { header: 'School Year',   dataKey: 'sy'       },
                        { header: 'Status',        dataKey: 'status'   },
                        { header: 'Contact',       dataKey: 'contact'  },
                    ];
                    rows = this.filteredResults.map((s, i) => ({
                        no:      i + 1,
                        sno:     s.student_number,
                        name:    `${s.last_name}, ${s.first_name}${s.middle_name ? ' ' + s.middle_name[0] + '.' : ''}`,
                        section: s.section?.section_name  ?? 'N/A',
                        sy:      s.section?.school_year   ?? 'N/A',
                        status:  s.status                 ?? 'N/A',
                        contact: s.contact_number         ?? 'N/A',
                    }));
                }

                // Violation Analytics
                if (this.activeReport === 2) {
                    columns = [
                        { header: '#',           dataKey: 'no'       },
                        { header: 'Student No.', dataKey: 'sno'      },
                        { header: 'Full Name',   dataKey: 'name'     },
                        { header: 'Violation',   dataKey: 'violation'},
                        { header: 'Severity',    dataKey: 'severity' },
                        { header: 'Date',        dataKey: 'date'     },
                        { header: 'Action',      dataKey: 'action'   },
                        { header: 'Status',      dataKey: 'status'   },
                    ];
                    rows = this.filteredResults.map((v, i) => ({
                        no:        i + 1,
                        sno:       v.student?.student_number         ?? 'N/A',
                        name:      `${v.student?.last_name ?? ''}, ${v.student?.first_name ?? ''}`,
                        violation: v.violationType?.violation_name   ?? 'N/A',
                        severity:  v.violationType?.severity_level   ?? 'N/A',
                        date:      this.formatDate(v.violation_date),
                        action:    v.action_taken                    ?? 'N/A',
                        status:    v.status                          ?? 'N/A',
                    }));
                }

                // Pending Cases
                if (this.activeReport === 4) {
                    columns = [
                        { header: '#',           dataKey: 'no'       },
                        { header: 'Student No.', dataKey: 'sno'      },
                        { header: 'Full Name',   dataKey: 'name'     },
                        { header: 'Violation',   dataKey: 'violation'},
                        { header: 'Date',        dataKey: 'date'     },
                        { header: 'Description', dataKey: 'desc'     },
                        { header: 'Status',      dataKey: 'status'   },
                    ];
                    rows = this.filteredResults.map((v, i) => ({
                        no:        i + 1,
                        sno:       v.student?.student_number       ?? 'N/A',
                        name:      `${v.student?.last_name ?? ''}, ${v.student?.first_name ?? ''}`,
                        violation: v.violationType?.violation_name ?? 'N/A',
                        date:      this.formatDate(v.violation_date),
                        desc:      v.description                   ?? 'N/A',
                        status:    v.status                        ?? 'N/A',
                    }));
                }

                // ── Draw Table ───────────────────────────────────────────
                autoTable(doc, {
                    startY:   yPos + 2,
                    columns,
                    body:     rows,
                    theme:    'grid',
                    styles: {
                        fontSize:  8,
                        cellPadding: 3,
                        textColor: [30, 20, 10],
                    },
                    headStyles: {
                        fillColor:  [122, 57, 2],
                        textColor:  [255, 255, 255],
                        fontStyle:  'bold',
                        fontSize:   8,
                    },
                    alternateRowStyles: {
                        fillColor: [255, 248, 235],
                    },
                    columnStyles: {
                        no: { cellWidth: 8, halign: 'center' },
                    },
                });

                // ── Footer on every page ─────────────────────────────────
                const totalPages = doc.internal.getNumberOfPages();
                for (let p = 1; p <= totalPages; p++) {
                    doc.setPage(p);
                    doc.setDrawColor(200, 160, 80);
                    doc.setLineWidth(0.3);
                    doc.line(14, doc.internal.pageSize.getHeight() - 14, pageWidth - 14, doc.internal.pageSize.getHeight() - 14);

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7);
                    doc.setTextColor(150, 100, 40);
                    doc.text(
                        'This is a system-generated report. — Student Profiling System',
                        14,
                        doc.internal.pageSize.getHeight() - 9
                    );
                    doc.text(
                        `Page ${p} of ${totalPages}`,
                        pageWidth - 14,
                        doc.internal.pageSize.getHeight() - 9,
                        { align: 'right' }
                    );
                }

                // ── Save the PDF file ────────────────────────────────────
                const filename = `${this.activeReportTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
                doc.save(filename);

            } catch (err) {
                console.error('PDF export failed:', err);
                alert('Failed to generate PDF. Please try again.');
            } finally {
                this.exporting = false;
            }
        },
    },

    mounted() {
        if (!isAdminUser()) {
            this.$router.replace('/dashboard');
            return;
        }
        this.currentDate = this.getFormattedDate();
        const user = getUser();
        this.currentUser = user?.name ?? user?.username ?? 'Administrator';
    },
};
</script>

<style scoped>
.reports-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #b27722 0%, #7a3902 45%, #211000 100%);
    font-family: 'Poppins', sans-serif;
}

.main-content { flex: 1; display: flex; flex-direction: column; }

.reports-content { padding: 24px 32px 40px; }

.page-header { margin-bottom: 26px; color: white; }
.page-title  { font-size: 38px; margin-bottom: 8px; }
.page-subtitle { font-size: 15px; opacity: 0.85; }

/* Report Cards */
.report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.report-card {
    background: white;
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.report-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.16); }
.report-card.active { border-color: #b27722; box-shadow: 0 0 0 4px rgba(178,119,34,0.15); }

.report-icon { font-size: 30px; margin-bottom: 16px; }
.report-card h3 { font-size: 20px; color: #1a1a1a; margin-bottom: 10px; }
.report-card p  { color: #666; margin-bottom: 12px; font-size: 14px; }
.report-meta    { color: #8a5a20; font-size: 13px; font-weight: 600; }

.empty-state {
    margin-top: 18px;
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255,255,255,0.9);
    color: #7a4a12;
    font-weight: 600;
    text-align: center;
}

/* Search Panel */
.search-panel {
    background: white;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 10px 28px rgba(0,0,0,0.12);
    margin-top: 8px;
}

.search-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
}

.search-panel-header h2 { font-size: 22px; color: #1a1a1a; margin-bottom: 6px; }
.search-panel-header p  { color: #666; font-size: 14px; }

.search-panel-actions { display: flex; gap: 10px; flex-shrink: 0; }

.export-btn {
    padding: 11px 20px;
    background: linear-gradient(135deg, #a89080 0%, #8a7a6a 100%);
    color: white;
    border: none;
    border-radius: 999px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.export-btn:hover:not(:disabled) { transform: translateY(-2px); }
.export-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.clear-btn {
    padding: 11px 18px;
    background: rgba(122,57,2,0.08);
    color: #7a3902;
    border: none;
    border-radius: 999px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease;
}

.clear-btn:hover { background: rgba(122,57,2,0.15); }

/* Filter Grid */
.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
}

.filter-field { display: flex; flex-direction: column; gap: 6px; }
.filter-field span { font-size: 12px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.06em; }

.filter-field input, .filter-field select {
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    font: inherit;
    font-size: 14px;
    color: #1a1a1a;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-field input:focus, .filter-field select:focus {
    outline: none;
    border-color: #b27722;
    box-shadow: 0 0 0 4px rgba(178,119,34,0.12);
}

/* Results Meta */
.results-meta {
    font-size: 13px;
    color: #888;
    margin-bottom: 14px;
    font-weight: 500;
}

.results-meta strong { color: #7a3902; }

/* State card */
.state-card {
    padding: 36px 24px;
    border-radius: 16px;
    background: rgba(255,243,220,0.5);
    text-align: center;
    color: #7a4a12;
    font-weight: 600;
}

/* Results Table */
.table-wrap { overflow-x: auto; }

.result-table { width: 100%; border-collapse: collapse; }
.result-table thead { background: #f5f5f5; }
.result-table th {
    padding: 14px 12px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 2px solid #eee;
}

.result-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
    color: #333;
}

.result-table tbody tr:hover { background: #fafafa; }

/* Status Pills */
.status-pill {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
}

.status-pill.active      { background: #d1fae5; color: #065f46; }
.status-pill.inactive    { background: #f3f4f6; color: #374151; }
.status-pill.probationary { background: #fef3c7; color: #92400e; }
.status-pill.resolved    { background: #dbeafe; color: #1e40af; }
.status-pill.pending     { background: #fef9c3; color: #854d0e; }

@media (max-width: 768px) {
    .reports-content { padding-left: 20px; padding-right: 20px; }
    .page-title { font-size: 30px; }
    .search-panel-header { flex-direction: column; }
    .search-panel-actions { width: 100%; }
    .export-btn, .clear-btn { flex: 1; text-align: center; }
}
</style>

<!-- Print Styles — only active during window.print() -->
<style>
@media print {
    body > * { display: none !important; }
    #pdf-print-area { display: block !important; }

    .pdf-report {
        font-family: 'Times New Roman', serif;
        color: #000;
        padding: 40px;
        max-width: 100%;
    }

    .pdf-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

    .pdf-school-info h1 {
        font-size: 22px;
        margin: 0 0 4px;
        font-weight: 700;
    }

    .pdf-school-info p {
        font-size: 13px;
        color: #444;
        margin: 0;
    }

    .pdf-meta p {
        font-size: 12px;
        margin: 3px 0;
        color: #333;
    }

    .pdf-divider {
        border: none;
        border-top: 2px solid #000;
        margin: 14px 0;
    }

    .pdf-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 16px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .pdf-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
    }

    .pdf-table th {
        background: #f0f0f0;
        border: 1px solid #999;
        padding: 8px 10px;
        font-weight: 700;
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .pdf-table td {
        border: 1px solid #ccc;
        padding: 7px 10px;
        vertical-align: top;
    }

    .pdf-table tbody tr:nth-child(even) { background: #fafafa; }

    .pdf-footer {
        margin-top: 30px;
        font-size: 11px;
        color: #666;
        text-align: center;
        border-top: 1px solid #ccc;
        padding-top: 10px;
    }
}
</style>