import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashBoardPage from './pages/DashBoardPage'; 
import StoreListPage from './pages/StoreListPage';
import UserListPage from './pages/UserListPage';
import UserProfilePage from './pages/UserDetailPage';
import StoreMapPage from "./pages/StoreMapPage";


// Import Campaign pages
import CampaignListPage from './pages/CampaignListPage';
import CampaignDetailPage from './pages/CampaignDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login không cần layout */}
          <Route path="/login" element={<LoginPage />} />

          {/* Các route bảo vệ dùng chung Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashBoardPage />} />
            <Route path="store-map" element={<StoreMapPage />} />

            {/* Stores */}
            <Route path="stores" element={<StoreListPage />} />

            {/* Users */}
            <Route path="users" element={<UserListPage />} />
            <Route path="users/:id" element={<UserProfilePage />} />

            {/* Campaigns */}
            <Route path="campaigns" element={<CampaignListPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
