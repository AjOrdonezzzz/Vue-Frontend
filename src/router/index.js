import { createRouter, createWebHashHistory } from 'vue-router'
import { getStoredUser, isAdminUser, isAuthenticated } from '../utils/auth'

// 1. Imports remain the same
import TestPage from '../views/TestPage.vue'
import LoginPage from '../views/LoginPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
// ... (keep your other imports)

const routes = [
  { path: '/test-connection', name: 'test', component: TestPage },
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/dashboard', name: 'Dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/students', name: 'Students', component: StudentsPage, meta: { requiresAuth: true } },
  // ... (keep your existing routes)
  {
    path: '/users',
    name: 'Users',
    component: UsersPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // NEW: Catch-all route to redirect invalid URLs
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // This is now perfectly set for GitHub Pages
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// ... navigation guards remain the same
export default router
