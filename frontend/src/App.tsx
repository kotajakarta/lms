import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/auth/LoginPage.js';
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { StudentLayout } from './layouts/StudentLayout.js';
import { SyllabusDashboardPage } from './pages/siswa/SyllabusDashboardPage.js';
import { CalendarPage } from './pages/siswa/CalendarPage.js';
import { DiscussionPage } from './pages/siswa/DiscussionPage.js';
import { AnalyticsPage } from './pages/siswa/AnalyticsPage.js';
import { LibraryPage } from './pages/siswa/LibraryPage.js';
import { AdminLayout } from './layouts/AdminLayout.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { AdminMasterDataPage } from './pages/admin/AdminMasterDataPage.js';
import { AdminCoursesWorkspacePage } from './pages/admin/AdminCoursesWorkspacePage.js';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Siswa Routes (Protected + StudentLayout) */}
          <Route element={<ProtectedRoute allowedRoles={['siswa']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/siswa" element={<Navigate to="/siswa/analitik" replace />} />
              <Route path="/siswa/dashboard" element={<SyllabusDashboardPage />} />
              <Route path="/siswa/calendar" element={<CalendarPage />} />
              <Route path="/siswa/diskusi" element={<DiscussionPage />} />
              <Route path="/siswa/analitik" element={<AnalyticsPage />} />
              <Route path="/siswa/library" element={<LibraryPage />} />
            </Route>
          </Route>

          {/* Admin & Superadmin Routes (Protected + AdminLayout) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instruktur']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/courses" element={<AdminCoursesWorkspacePage />} />
              <Route path="/admin/materials" element={<AdminMaterialsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/master-data" element={<AdminMasterDataPage />} />
            </Route>
          </Route>

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
