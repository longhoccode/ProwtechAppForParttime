import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import AssignStoreModal from '../components/modal/AssignStoreModal';
import LoadingMessage from '../components/LoadingMessage';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import { provinces, districtMap } from '../constants/locationData';

const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : 'N/A');

function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [assignedStores, setAssignedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
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

  // Filtered stores
  const filteredStores = useMemo(() => {
    return assignedStores.filter((store) => {
      const matchProvince = filters.province ? store.district === filters.province : true;
      const matchDistrict = filters.district ? store.district_raw === filters.district : true;
      const matchSearch =
        (store.board_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.store_code || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (store.address || '').toLowerCase().includes(filters.search.toLowerCase());
      return matchProvince && matchDistrict && matchSearch;
    });
  }, [assignedStores, filters]);

  if (loading) return <LoadingMessage text="Đang tải chiến dịch..." />;
  if (error) return <ErrorMessage text={error} />;
  if (!campaign) return <EmptyState message="Chiến dịch không tồn tại." />;

  return (
    <div className="container detail-page">
      <div className="page-header">
        <h2 className="page-title">Cửa hàng ({assignedStores.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          Quản lý cửa hàng
        </button>
      </div>

      {/* FilterBar */}
      <FilterBar
        filters={[
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
            { label: 'Address' },
            { label: 'District' },
          ]}
          data={filteredStores}
          renderRow={(store) => (
            <tr key={store.id}>
              <td>{store.store_code}</td>
              <td id="address">{store.address}</td>
              <td>{districtMap[store.district]?.find((d) => d.value === store.district_raw)?.label || store.district_raw}</td>
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
        initiallyAssignedIds={assignedStores.map((s) => s.id)}
      />
    </div>
  );
}

export default CampaignDetailPage;
