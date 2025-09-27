// File: StoreDetailModal.js
import React from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { provinces, districtMap } from '../constants/locationData';

function StoreDetailModal({ isOpen, onClose, store }) {
  if (!isOpen || !store) return null;

  const getProvinceLabel = (value) => provinces.find(p => p.value === value)?.label || value;
  const getDistrictLabel = (province, districtRaw) =>
    districtMap[province]?.find(d => d.value === districtRaw)?.label || districtRaw;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-body">
        <h2 className="modal-title">Store Details</h2>

        <div className="modal-row">
          <div className="modal-label">Board Name</div>
          <div className="modal-value">{store.board_name || 'N/A'}</div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Store Code</div>
          <div className="modal-value">{store.store_code || 'N/A'}</div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Address</div>
          <div className="modal-value">{store.address || store.address_vi || 'N/A'}</div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Province</div>
          <div className="modal-value">{getProvinceLabel(store.district)}</div>
        </div>

        <div className="modal-row">
          <div className="modal-label">District</div>
          <div className="modal-value">{getDistrictLabel(store.district, store.district_raw)}</div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Status</div>
          <div className="modal-value">
            <span className={`status status-${store.is_active ? 'active' : 'inactive'}`}>
              {store.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="modal-row">
          <div className="modal-label">Location</div>
          <div className="modal-value">
            {store.latitude && store.longitude && (
              <a
                href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn btn-outline btn-sm">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  View on Google Maps
                </button>
              </a>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-danger btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}

export default StoreDetailModal;
