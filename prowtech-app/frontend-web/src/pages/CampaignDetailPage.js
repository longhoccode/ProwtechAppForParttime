// File: CampaignDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import AssignStoreModal from '../components/AssignStoreModal';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

// Helper format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

function CampaignDetailPage() {
  const [campaign, setCampaign] = useState(null);
  const [assignedStores, setAssignedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [campaignRes, storesRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/campaigns/${id}/stores`),
      ]);
      setCampaign(campaignRes.data.data);
      setAssignedStores(storesRes.data.data || []);
    } catch (err) {
      setError('Failed to fetch campaign details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveStores = () => {
    setIsModalOpen(false);
    fetchData();
  };

  if (loading) return <LoadingMessage message="Loading campaign..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!campaign) return <EmptyState message="Campaign not found." />;

  return (
    <div className="container">
      <Link to="/campaigns" className="btn-link back-link">
        &larr; Back to Campaign List
      </Link>

      <div className="profile-page">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          {/* Campaign Info */}
          <div className="card">
            <div className="card-body text-center">
              <div className="profile-avatar">📢</div>
              <h3 className="profile-title">{campaign.name}</h3>
              <div className="profile-status">
                <span
                  className={`status-badge ${
                    campaign.is_active ? 'status-active' : 'status-inactive'
                  }`}
                >
                  {campaign.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Details</h4>
            </div>
            <div className="card-body">
              <div className="detail-list">
                <div className="detail-row">
                  <div className="detail-label">Description</div>
                  <div className="detail-value">{campaign.description || 'N/A'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Start Date</div>
                  <div className="detail-value">{formatDate(campaign.start_date)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">End Date</div>
                  <div className="detail-value">{formatDate(campaign.end_date)}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          <div className="card">
            <div className="card-header flex-between">
              <h4 className="card-title">
                Stores in Campaign ({assignedStores.length})
              </h4>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                Manage Stores
              </button>
            </div>
            <div className="card-body" id="store-list">
              {assignedStores.length > 0 ? (
                <ul className="card-list">
                  {assignedStores.map((store) => (
                    <li key={store.id} className="card-item">
                      <strong>{store.store_code}</strong> - {store.address}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState message="No stores have been assigned yet." />
              )}
            </div>
          </div>
        </main>
      </div>

      <AssignStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStores}
        campaignId={id}
        initiallyAssignedIds={assignedStores.map((s) => s.id)}
      />
    </div>
  );
}

export default CampaignDetailPage;
