import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashBoardPage from './pages/DashBoardPage'; 
import StoreListPage from './pages/StoreListPage';
import UserListPage from './pages/UserListPage';
import UserDetailPage from './pages/UserDetailPage';
import StoreMapPage from "./pages/StoreMapPage";
import StaffListPage from "./pages/StaffListPage";
import StaffDetailPage from "./pages/StaffDetailPage";

// Import Campaign pages
import CampaignListPage from './pages/CampaignListPage';
import CampaignDetailPage from './pages/CampaignDetailPage';

// Forbidden page
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login & Forbidden không cần layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Các route cần login dùng chung Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Cả admin và parttime */}
            <Route
              index
              element={
                <ProtectedRoute roles={['admin', 'parttime']}>
                  <DashBoardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="store-map"
              element={
                <ProtectedRoute roles={['admin', 'parttime']}>
                  <StoreMapPage />
                </ProtectedRoute>
              }
            />

            {/* Chỉ admin */}
            <Route
              path="stores"
              element={
                <ProtectedRoute roles={['admin']}>
                  <StoreListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="staffs"
              element={
                <ProtectedRoute roles={['admin']}>
                  <StaffListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="staffs/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <StaffDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="campaigns"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CampaignListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="campaigns/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CampaignDetailPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
