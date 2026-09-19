import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { medicineService } from '../../services/medicineService';
import { phcService } from '../../services/phcService';
import { useToast } from '../../context/ToastContext';
import { formatDate, getExpiryStatus } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { Plus, Search } from 'lucide-react';

export const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [phcs, setPhcs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    medicineName: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    qualityStatus: 'Passed',
    sourcePhcName: 'Central Depot',
    destinationPhcName: 'All PHCs',
    phcEmail: ''
  });

  const loadData = async () => {
    try {
      const [batchRes, medsRes, phcRes] = await Promise.all([
        medicineService.getBatches(),
        medicineService.getMedicines(),
        phcService.getPhcs()
      ]);
      const batchList = Array.isArray(batchRes) ? batchRes : [];
      const medsList = Array.isArray(medsRes) ? medsRes : [];
      const phcList = Array.isArray(phcRes) ? phcRes : [];
      setBatches(batchList);
      setMedicines(medsList);
      setPhcs(phcList);
    } catch (err) {
      console.error('Failed to load batch data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBatches = batches.filter(
    (b) =>
      (b.batchNumber && b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.medicineName && b.medicineName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const matched = medicines.find(
        (m) => (m.medicineName || '').trim().toLowerCase() === (formData.medicineName || '').trim().toLowerCase()
      );
      const payload = {
        ...formData,
        medicineId: matched ? (matched.medicineId || matched.id) : (formData.medicineId || `MED-${Date.now()}`)
      };
      await medicineService.addBatch(payload);
      setIsAddModalOpen(false);
      setFormData({
        medicineName: '',
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        qualityStatus: 'Passed',
        sourcePhcName: 'Central Depot',
        destinationPhcName: 'All PHCs',
        phcEmail: ''
      });
      await loadData();
      showToast(`✓ Batch "${formData.batchNumber}" registered successfully`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to register batch', 'danger');
    }
  };

  const columns = [
    {
      header: 'Batch ID',
      key: 'batchId',
      render: (_, b) => <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{b.batchId || b.id}</span>
    },
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      header: 'Batch Number',
      key: 'batchNumber',
      render: (val) => <span className="badge badge-neutral">{val}</span>
    },
    {
      header: 'Mfg Date',
      key: 'manufacturingDate',
      render: (_, b) => formatDate(b.manufacturingDate || b.manufactureDate)
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (val) => {
        const status = getExpiryStatus(val);
        return <span className={`badge ${status.className}`}>{formatDate(val)}</span>;
      }
    }
  ];

  return (
    <DashboardLayout title="Batches">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search batches by number or medicine name..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Register Batch
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredBatches}
        emptyMessage="No batch records found."
        keyField="batchId"
      />

      {/* Register Batch Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Pharmaceutical Batch">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Medicine Name</label>
            <input
              type="text"
              className="form-control"
              list="medicines-suggestions"
              placeholder="Select existing or type new medicine name..."
              value={formData.medicineName}
              onChange={(e) => {
                const val = e.target.value;
                const matched = medicines.find(
                  (m) => (m.medicineName || '').trim().toLowerCase() === val.trim().toLowerCase()
                );
                setFormData((prev) => ({
                  ...prev,
                  medicineName: val,
                  medicineId: matched ? (matched.medicineId || matched.id) : prev.medicineId
                }));
              }}
              required
            />
            <datalist id="medicines-suggestions">
              {medicines.map((m) => (
                <option key={m.medicineId || m.id} value={m.medicineName}>
                  {m.genericName ? `${m.medicineName} (${m.genericName})` : m.medicineName}
                </option>
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Batch Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. BAT-2409"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Manufacturing Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.manufacturingDate}
                onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registered PHC Email (For Automated Dispatch Notice)</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. abishasenthil06@gmail.com"
              value={formData.phcEmail}
              onChange={(e) => setFormData({ ...formData, phcEmail: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quality Status</label>
            <select
              className="form-control"
              value={formData.qualityStatus}
              onChange={(e) => setFormData({ ...formData, qualityStatus: e.target.value })}
            >
              <option value="Passed">Passed (Approved for Circulation)</option>
              <option value="Pending Inspection">Pending Inspection</option>
              <option value="Quarantine">Quarantine</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Batch
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
