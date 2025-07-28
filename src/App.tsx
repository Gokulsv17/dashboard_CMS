import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ChangePasswordPage from './components/auth/ChangePasswordPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './components/pages/DashboardPage';
import BlogsPage from './components/pages/BlogsPage';
import VideosPage from './components/pages/VideosPage';
import AddBlogPage from './components/pages/AddBlogPage';
import AddVideoPage from './components/pages/AddVideoPage';
import EditBlogPage from './components/pages/EditBlogPage';
import EditVideoPage from './components/pages/EditVideoPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/auth/change-password" element={<ChangePasswordPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="blogs/add-project" element={<AddBlogPage />} />
            <Route path="blogs/edit/:id" element={<EditBlogPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="videos/add-project" element={<AddVideoPage />} />
            <Route path="videos/edit/:id" element={<EditVideoPage />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;