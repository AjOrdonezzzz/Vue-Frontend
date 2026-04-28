import { createRouter, createWebHashHistory } from 'vue-router'
import { getStoredUser, isAdminUser, isAuthenticated } from '../utils/auth'

// 1. Import all pages
import TestPage from '../views/TestPage.vue'
import LoginPage from '../views/LoginPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import StudentsPage from '../views/StudentsPage.vue'
import CoursesPage from '../views/CoursesPage.vue'
import FacultyPage from '../views/FacultyPage.vue'
import RoomsPage from '../views/RoomsPage.vue'
import SectionsPage from '../views/SectionsPage.vue'
import ViolationsPage from '../views/ViolationsPage.vue'
import EventsPage from '../views/EventsPage.vue'
import ReportsPage from '../views/ReportsPage.vue'
import SettingsPage from '../views/SettingsPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import UsersPage from '../views/UsersPage.vue'

// 2. Define the routes array
const routes = [
  { path: '/test-connection', name: 'test', component: TestPage },
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/dashboard', name: 'Dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/students', name: 'Students', component: StudentsPage, meta: { requiresAuth: true } },
  { path: '/courses', name: 'Courses', component: CoursesPage, meta: { requiresAuth: true } },
  {
    path: '/faculty',
    name: 'Faculty',
    component: FacultyPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  { path: '/rooms', name: 'Rooms', component: RoomsPage, meta: { requiresAuth: true } },
  { path: '/sections', name: 'Sections', component: SectionsPage, meta: { requiresAuth: true } },
  {
    path: '/violations',
    name: 'Violations',
    component: ViolationsPage,
    meta: { requiresAuth: true },
  },
  { path: '/events', name: 'Events', component: EventsPage, meta: { requiresAuth: true } },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  { path: '/settings', name: 'Settings', component: SettingsPage, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: ProfilePage, meta: { requiresAuth: true } },
  {
    path: '/users',
    name: 'Users',
    component: UsersPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // Catch-all route to redirect invalid URLs to Login
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// 3. Navigation Guard
router.beforeEach((to, from) => {
  const authenticated = isAuthenticated()
  const storedUser = getStoredUser()
  const isAdmin = isAdminUser(storedUser)

  if (to.meta.requiresAuth && !authenticated) {
    return { name: 'Login' }
  }
  if (to.name === 'Login' && authenticated) {
    return { name: 'Dashboard' }
  }
  if (to.meta.requiresAdmin && !isAdmin) {
    return { name: 'Dashboard' }
  }

  return true
})

export default router
