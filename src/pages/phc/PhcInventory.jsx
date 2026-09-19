import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { inventoryService } from '../../services/inventoryService';
import { consumptionService } from '../../services/consumptionService';
import { formatDate } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { Search, Edit3, PlusCircle, History, PackageMinus } from 'lucide-react';

export const PhcInventory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [consumptionHistory, setConsumptionHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stock Update Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQty, setNewQty] = useState('');

  // Record Consumption Modal State
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantityConsumed, setQuantityConsumed] = useState('');
  const [consumptionDate, setConsumptionDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    if (user && user.phcId) {
      try {
        const invData = await inventoryService.getInventoryByPhc(user.phcId);
        setInventory(Array.isArray(invData) ? invData : []);

        const historyData = await consumptionService.getConsumptionHistory(user.phcId);
        setConsumptionHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error('Failed to load PHC inventory:', err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredInventory = inventory.filter(
    (item) =>
      (item.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers for Stock Update Modal
  const handleOpenUpdate = (item) => {
    setSelectedItem(item);
    setNewQty(String(item.quantity));
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const val = parseInt(newQty, 10);
    if (isNaN(val) || val < 0) {
      showToast('Stock quantity cannot be negative', 'danger');
      return;
    }

    try {
      await inventoryService.updateStock(selectedItem.inventoryId, val);
      showToast(`✓ Stock for "${selectedItem.medicineName}" updated to ${val} units`, 'success');
      setSelectedItem(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'danger');
    }
  };

  // Handlers for Record Consumption Modal
  const handleOpenConsumptionModal = () => {
    setSelectedMedicineId(inventory.length > 0 ? inventory[0].medicineId : '');
    setQuantityConsumed('');
    setConsumptionDate(new Date().toISOString().split('T')[0]);
    setIsConsumptionModalOpen(true);
  };

  const handleRecordConsumption = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId) {
      showToast('Please select a medicine', 'danger');
      return;
    }

    const selectedInvItem = inventory.find((i) => i.medicineId === selectedMedicineId);
    if (!selectedInvItem) {
      showToast('Selected medicine is not found in inventory', 'danger');
      return;
    }

    const qtyNum = parseInt(quantityConsumed, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast('Quantity consumed must be a positive number', 'danger');
      return;
    }

    if (qtyNum > selectedInvItem.quantity) {
      showToast(
        `Quantity consumed (${qtyNum}) cannot exceed available stock (${selectedInvItem.quantity})`,
        'danger'
      );
      return;
    }

    if (!consumptionDate) {
      showToast('Please select a valid consumption date', 'danger');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (consumptionDate > todayStr) {
      showToast('Future consumption dates are not allowed', 'danger');
      return;
    }

    try {
      await consumptionService.recordConsumption({
        medicineId: selectedInvItem.medicineId,
        medicineName: selectedInvItem.medicineName,
        phcId: user.phcId,
        phcName: user.phcName || selectedInvItem.phcName || 'PHC',
        batchNumber: selectedInvItem.batchNumber,
        quantityConsumed: qtyNum,
        date: consumptionDate
      });

      showToast('✓ Medicine consumption recorded successfully.', 'success');
      setIsConsumptionModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to record consumption:', err);
      showToast('Unable to record consumption. Please try again.', 'danger');
    }
  };

  const activeInvItem = inventory.find((i) => i.medicineId === selectedMedicineId);

  const invColumns = [
    {
      header: 'Inv ID',
      key: 'inventoryId',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{val}</span>
    },
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      header: 'Batch Number',
      key: 'batchNumber',
      render: (val) => <code>{val}</code>
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (val) => formatDate(val)
    },
    {
      header: 'Physical Stock Qty',
      key: 'quantity',
      align: 'right',
      render: (val, item) => {
        const isLowStock = val <= item.minimumStockLevel;
        return <span style={{ fontWeight: 800, fontSize: '1rem', color: isLowStock ? 'var(--danger)' : 'var(--success)' }}>{val}</span>;
      }
    },
    {
      header: 'Min Threshold',
      key: 'minimumStockLevel',
      align: 'right',
      render: (val) => <span style={{ color: 'var(--text-dim)' }}>{val}</span>
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (_, item) => {
        const isLowStock = item.quantity <= item.minimumStockLevel;
        return (
          <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
            {isLowStock ? 'Low Stock' : 'Optimal'}
          </span>
        );
      }
    },
    {
      header: 'Action',
      key: 'action',
      align: 'center',
      render: (_, item) => (
        <button
          className="btn btn-outline"
          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
          onClick={() => handleOpenUpdate(item)}
        >
          <Edit3 size={14} /> Update Stock
        </button>
      )
    }
  ];

  const historyColumns = [
    {
      header: 'Consumption ID',
      key: 'consumptionId',
      render: (val, item, idx) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{val || `CNS-00${idx + 1}`}</span>
    },
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      header: 'Batch Number',
      key: 'batchNumber',
      render: (val) => <code>{val || 'N/A'}</code>
    },
    {
      header: 'Quantity Consumed',
      key: 'quantityConsumed',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 800, color: 'var(--warning)' }}>-{val} units</span>
    },
    {
      header: 'Dispensed Date',
      key: 'date',
      render: (val) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{val}</span>
    }
  ];

  return (
    <DashboardLayout title="Pharmacy Inventory">
      {/* Header Actions */}
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
        <div style={{ position: 'relative', width: '360px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search medicine, batch number..."
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

        {/* Record Consumption Button visible strictly to PHC Staff */}
        {user?.role === 'PHC_STAFF' && (
          <button
            className="btn btn-primary"
            onClick={handleOpenConsumptionModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PackageMinus size={18} /> Record Consumption
          </button>
        )}
      </div>

      {/* Main Stock Inventory Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.875rem', color: 'var(--text-main)' }}>
          Physical Medicine Inventory
        </h3>
        <DataTable
          columns={invColumns}
          data={filteredInventory}
          emptyMessage="No stock entries in your facility inventory."
          keyField="inventoryId"
        />
      </div>

      {/* Consumption History Table Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <History size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Medicine Consumption History
          </h3>
        </div>

        <DataTable
          columns={historyColumns}
          data={consumptionHistory}
          emptyMessage="No consumption history available."
          keyField="consumptionId"
        />
      </div>

      {/* Modal 1: Update Physical Stock Count */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`Update Stock Count — ${selectedItem?.medicineName}`}
      >
        {selectedItem && (
          <form onSubmit={handleSaveStock}>
            <div className="form-group">
              <label className="form-label">Physical Stock Count (Units)</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Stock Update
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal 2: Record Medicine Consumption */}
      <Modal
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        title="Record Medicine Consumption / Dispensing"
      >
        <form onSubmit={handleRecordConsumption}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Medicine *</label>
            {inventory.length === 0 ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>No inventory items available to dispense.</p>
            ) : (
              <select
                className="form-control"
                value={selectedMedicineId}
                onChange={(e) => setSelectedMedicineId(e.target.value)}
                required
              >
                {inventory.map((item) => (
                  <option key={item.medicineId} value={item.medicineId}>
                    {item.medicineName} ({item.batchNumber}) — Stock: {item.quantity} units
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeInvItem && (
            <div style={{ backgroundColor: 'var(--bg-card-hover)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
              <div>Batch: <strong>{activeInvItem.batchNumber}</strong></div>
              <div>Current Stock Available: <strong style={{ color: 'var(--success)' }}>{activeInvItem.quantity} units</strong></div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Quantity Consumed (Units) *</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 25"
              min="1"
              max={activeInvItem ? activeInvItem.quantity : undefined}
              value={quantityConsumed}
              onChange={(e) => setQuantityConsumed(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Dispensed Date *</label>
            <input
              type="date"
              className="form-control"
              max={new Date().toISOString().split('T')[0]}
              value={consumptionDate}
              onChange={(e) => setConsumptionDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsConsumptionModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={inventory.length === 0}
            >
              Record Consumption
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
