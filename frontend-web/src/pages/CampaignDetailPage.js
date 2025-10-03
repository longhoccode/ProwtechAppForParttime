// File: CampaignDetailPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import AssignStoreModal from '../components/modal/AssignStoreModal';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import { provinces, districtMap } from '../constants/locationData';

function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [assignedStores, setAssignedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    board: 'all',
    province: '',
    district: '',
    search: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignRes, storesRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/campaigns/${id}/stores`),
      ]);
      setCampaign(campaignRes.data.data);
      setAssignedStores(storesRes.data.data || []);
      setError('');
    } catch {
      setError('Không thể tải thông tin chiến dịch.');
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

  // District options based on selected province
  const districtOptions = filters.province ? districtMap[filters.province] || [] : [];

  // Board options
  const boardOptions = useMemo(
    () => [...new Set(assignedStores.map((s) => s.board_name))].sort(),
    [assignedStores]
  );

  // Filtered stores
  const filteredStores = useMemo(() => {
    return assignedStores.filter((store) => {
      const boardMatch = filters.board === 'all' || store.board_name === filters.board;
      const matchProvince = filters.province ? store.district === filters.province : true;
      const matchDistrict = filters.district ? store.district_raw === filters.district : true;
      const matchSearch =
        (store.board_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.store_code || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.address || '').toLowerCase().includes(filters.search.toLowerCase());
      return boardMatch && matchProvince && matchDistrict && matchSearch;
    });
  }, [assignedStores, filters]);

  // State cho loading riêng từng nút (tùy chọn)
  const [updatingIds, setUpdatingIds] = useState([]);

  const toggleDone = async (campaignStoreId, currentDone) => {
    setUpdatingIds((prev) => [...prev, campaignStoreId]);
    try {
      const res = await api.patch(`/campaigns/${id}/stores/${campaignStoreId}`);
      const updated = res.data.data;

      // ✅ Cập nhật local state luôn, không gọi fetchData()
      setAssignedStores((prev) =>
        prev.map((s) =>
          s.campaign_store_id === campaignStoreId ? { ...s, is_done: updated.is_done } : s
        )
      );
    } catch (err) {
      console.error("Failed to update is_done:", err);
    } finally {
      setUpdatingIds((prev) => prev.filter((sid) => sid !== campaignStoreId));
    }
  };


  if (loading) return <LoadingMessage text="Đang tải chiến dịch..." />;
  if (error) return <ErrorMessage text={error} />;
  if (!campaign) return <EmptyState message="Chiến dịch không tồn tại." />;

  return (
    <div className="container detail-page">
      <Link to="/campaigns" className="btn btn-outline btn-sm link" style={{ maxWidth: 'fit-content' }}>
        &larr; Quay lại danh sách
      </Link>

      <div className="page-header">
        <h2 className="page-title">
          {campaign.name} Cửa hàng ({assignedStores.length})
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          Quản lý cửa hàng
        </button>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={[
          {
            name: 'board',
            type: 'select',
            label: 'Chain',
            options: [{ value: 'all', label: 'Tất cả' }, ...boardOptions.map(b => ({ value: b, label: b }))],
          },
          {
            name: 'province',
            type: 'select',
            label: 'Province',
            options: [{ value: '', label: 'Tỉnh/TP' }, ...provinces],
          },
          {
            name: 'district',
            type: 'select',
            label: 'District',
            options: [{ value: '', label: 'Quận/Huyện' }, ...districtOptions],
          },
          {
            name: 'search',
            type: 'text',
            label: 'Search',
            placeholder: 'Name, code, or address...',
          },
        ]}
        values={filters}
        onChange={(name, value) =>
          setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'province' ? { district: '' } : {}),
          }))
        }
      />

      {/* DataTable */}
      {filteredStores.length > 0 ? (
        <DataTable
          columns={[
            { label: 'Store Code' },
            { label: 'Board' },
            { label: 'Address' },
            { label: 'District' },
            { label: 'Drive Link' },
            { label: 'Done', className: 'table-actions' },
          ]}
          data={filteredStores}
          renderRow={(store) => (
            <tr key={store.id}>
              <td>{store.store_code}</td>
              <td>{store.board_name}</td>
              <td id="address">{store.address}</td>
              <td>
                {districtMap[store.district]?.find((d) => d.value === store.district_raw)?.label ||
                  store.district_raw}
              </td>
              <td>
                {store.drive_folder_id ? (
                  <a
                    href={store.drive_folder_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Mở Link
                  </a>
                ) : (
                  <span className="text-gray-400">Chưa có</span>
                )}
              </td>
              <td className='table-actions'>
                <button
                  className={`btn btn-sm ${store.is_done ? 'btn-success' : 'btn-outline'}`}
                  onClick={() => toggleDone(store.campaign_store_id, store.is_done)}
                  disabled={updatingIds.includes(store.campaign_store_id)}
                >
                  {updatingIds.includes(store.campaign_store_id) ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : store.is_done ? 'Done' : 'Chưa Done'}
                </button>
              </td>
            </tr>
          )}
        />
      ) : (
        <EmptyState message="Không có cửa hàng nào phù hợp với bộ lọc." />
      )}

      {/* Assign Store Modal */}
      <AssignStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStores}
        campaignId={id}
        initiallyAssignedIds={assignedStores.map((s) => s.store_id)} // ✅ store_id
      />
    </div>
  );
}

export default CampaignDetailPage;
