import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { medicineService } from '../../services/medicineService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    medicineId: '',
    medicineName: '',
    genericName: '',
    category: 'Antibiotic',
    manufacturer: '',
    unitPrice: '',
    dosageForm: 'Tablet',
    storageCondition: ''
  });

  const loadMedicines = async () => {
    try {
      const data = await medicineService.getMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const categories = ['ALL', ...new Set(medicines.map((m) => m.category))];

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      (m.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setFormData({
      medicineId: '',
      medicineName: '',
      genericName: '',
      category: 'Antibiotic',
      manufacturer: '',
      unitPrice: '',
      dosageForm: 'Tablet',
      storageCondition: 'Store below 25°C in dry place'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setFormData({ ...med });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicineService.addMedicine(formData);
      setIsAddModalOpen(false);
      await loadMedicines();
      showToast(`✓ Medicine "${formData.medicineName}" added successfully`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add medicine', 'danger');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicineService.updateMedicine(formData.id || formData.medicineId, formData);
      setIsEditModalOpen(false);
      await loadMedicines();
      showToast(`✓ Medicine "${formData.medicineName}" updated successfully`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update medicine', 'danger');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await medicineService.deleteMedicine(id);
      await loadMedicines();
      showToast(`Medicine "${name}" removed from catalog`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete medicine', 'danger');
    }
  };

  const columns = [
    {
      header: 'Code',
      key: 'medicineId',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{val}</span>
    },
    {
      header: 'Brand Name',
      key: 'medicineName',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      header: 'Generic Name',
      key: 'genericName',
      render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span>
    },
    {
      header: 'Category',
      key: 'category',
      render: (val) => <span className="badge badge-info">{val}</span>
    },
    {
      header: 'Form',
      key: 'dosageForm',
      render: (val) => val || 'Tablet'
    },
    {
      header: 'Manufacturer',
      key: 'manufacturer'
    },
    {
      header: 'Unit Price (₹)',
      key: 'unitPrice',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 700 }}>₹{Number(val || 0).toFixed(2)}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, med) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
            onClick={() => handleOpenEdit(med)}
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            className="btn btn-danger"
            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
            onClick={() => handleDelete(med.id || med.medicineId, med.medicineName)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout title="Medicine Master Catalog">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search medicine name, generic formula, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '200px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Medicine
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredMedicines}
        emptyMessage="No medicines found matching criteria."
        keyField="medicineId"
      />

      {/* Modal for Add Medicine */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Master Medicine">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Brand / Commercial Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Essential Tablet 500mg"
              value={formData.medicineName}
              onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Generic Chemical Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Acetaminophen"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Antibiotic, Analgesic"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dosage Form</label>
              <select
                className="form-control"
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Powder Sachet">Powder Sachet</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Sun Lifesciences"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="5.50"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Storage Condition</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Store below 25°C in dry place"
              value={formData.storageCondition}
              onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Medicine
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Edit Medicine */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Master Medicine">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Brand / Commercial Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.medicineName}
              onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Generic Chemical Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Medicine
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
