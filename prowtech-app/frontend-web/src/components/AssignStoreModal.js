import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../services/api';

function AssignStoreModal({ isOpen, onClose, onSave, campaignId, initiallyAssignedIds }) {
  const [allStores, setAllStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchAllStores = async () => {
        setLoading(true);
        setError('');
        setSearchTerm('');
        try {
          const res = await api.get('/stores');
          setAllStores(res.data.data || []);
          setSelectedStoreIds(new Set(initiallyAssignedIds));
        } catch (err) {
          setError('Failed to load stores.');
        } finally {
          setLoading(false);
        }
      };
      fetchAllStores();
    }
  }, [isOpen, initiallyAssignedIds]);

  const handleToggleStore = (storeId) => {
    setSelectedStoreIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) newSet.delete(storeId);
      else newSet.add(storeId);
      return newSet;
    });
  };
  
  const handleSave = async () => {
    const originalIds = new Set(initiallyAssignedIds);
    const newIds = selectedStoreIds;
    const idsToAdd = [...newIds].filter(id => !originalIds.has(id));
    const idsToRemove = [...originalIds].filter(id => !newIds.has(id));

    setLoading(true);
    setError('');
    try {
      const addPromises = idsToAdd.map(store_id => 
        api.post(`/campaigns/${campaignId}/stores`, { store_id })
      );
      const removePromises = idsToRemove.map(storeId => 
        api.delete(`/campaigns/${campaignId}/stores/${storeId}`)
      );
      await Promise.all([...addPromises, ...removePromises]);
      onSave();
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Cải thiện logic lọc để tìm kiếm hiệu quả hơn
  const filteredStores = allStores.filter(store => {
    const storeIdentifier = `${store.board_name || ''} ${store.store_code || ''} ${store.address || ''}`.toLowerCase();
    return storeIdentifier.includes(searchTerm.toLowerCase());
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="card-header">
        <h3>Assign Stores to Campaign</h3>
      </div>
      <div className="modal-body">
        {error && <p className="error-message">{error}</p>}

        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by chain, code, or address..."
            className="form-control" // Cập nhật class
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="store-list">
          {loading && !allStores.length ? <p className="empty-state-message">Loading stores...</p> : (
            filteredStores.map(store => (
              <label key={store.id} className="store-item">
                <input
                  type="checkbox"
                  checked={selectedStoreIds.has(store.id)}
                  onChange={() => handleToggleStore(store.id)}
                />
                {/* 3. Hiển thị thông tin hữu ích hơn */}
                <strong>{store.store_code}</strong> - {store.district}
              </label>
            ))
          )}
          {!loading && filteredStores.length === 0 && (
            <p className="empty-state-message">No stores found.</p>
          )}
        </div>
      </div>
      {/* 4. Sử dụng .modal-actions cho các nút */}
      <div className="modal-actions" style={{ padding: '16px', borderTop: '1px solid var(--border-color)'}}>
        <button onClick={onClose} className="btn btn-danger" disabled={loading}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

export default AssignStoreModal;