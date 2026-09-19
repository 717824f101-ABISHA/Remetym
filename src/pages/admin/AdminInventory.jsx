import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { inventoryService } from '../../services/inventoryService';
import { medicineService } from '../../services/medicineService';
import { phcService } from '../../services/phcService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { formatDate, getExpiryStatus } from '../../utils/dateUtils';
import { Search, Plus, Edit3 } from 'lucide-react';

export const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [phcs, setPhcs] = useState([]);
  const [phcsLoading, setPhcsLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhc, setSelectedPhc] = useState('ALL');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItemToAdjust, setSelectedItemToAdjust] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');

  const [stockFormData, setStockFormData] = useState({
    phcId: '',
    medicineId: '',
    batchId: '',
    quantity: 100,
    minimumStockLevel: 50
  });

  const loadData = async () => {
    try {
      setPhcsLoading(true);
      console.log('[AdminInventory] Fetching PHCs from Oracle backend...');
      const phcData = await phcService.getPhcs(true).catch((err) => {
        console.error('[AdminInventory ERROR] Failed to fetch PHCs from Oracle API:', err);
        return [];
      });
      const rawPhcs = Array.isArray(phcData) ? phcData : [];
      const uniquePhcs = Array.from(
        new Map(rawPhcs.filter((p) => p.phcId || p.id).map((p) => [p.phcId || p.id, p])).values()
      );
      console.log('[AdminInventory] PHCs loaded for allocation:', uniquePhcs.length, uniquePhcs);
      setPhcs(uniquePhcs);

      const invData = await inventoryService.getInventory().catch(() => []);
      const medsData = await medicineService.getMedicines().catch(() => []);
      const batchData = await medicineService.getBatches().catch(() => []);

      setInventory(Array.isArray(invData) ? invData : []);
      setMedicines(Array.isArray(medsData) ? medsData : []);
      setBatches(Array.isArray(batchData) ? batchData : []);
    } catch (err) {
      console.error('Failed to load AdminInventory data:', err);
    } finally {
      setPhcsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      (item.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phcName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPhc = selectedPhc === 'ALL' || item.phcId === selectedPhc;

    return matchesSearch && matchesPhc;
  });

  const handleOpenAddStock = async () => {
    let currentPhcs = phcs;
    if (!Array.isArray(currentPhcs) || currentPhcs.length === 0) {
      try {
        setPhcsLoading(true);
        const fetched = await phcService.getPhcs(true);
        const raw = Array.isArray(fetched) ? fetched : [];
        currentPhcs = Array.from(new Map(raw.filter((p) => p.phcId || p.id).map((p) => [p.phcId || p.id, p])).values());
        setPhcs(currentPhcs);
      } catch (e) {
        console.error('[AdminInventory ERROR] Modal opening PHC fetch failed:', e);
      } finally {
        setPhcsLoading(false);
      }
    }

    const firstPhcId = currentPhcs[0]?.phcId || currentPhcs[0]?.id || '';
    const firstMedId = medicines[0]?.medicineId || medicines[0]?.id || '';
    const firstBatchId = batches[0]?.batchId || batches[0]?.id || '';

    setStockFormData((prev) => ({
      ...prev,
      phcId: prev.phcId || firstPhcId,
      medicineId: prev.medicineId || firstMedId,
      batchId: prev.batchId || firstBatchId,
      quantity: prev.quantity || 200,
      minimumStockLevel: prev.minimumStockLevel || 50
    }));
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const selPhc = phcs.find((p) => (p.phcId || p.id) === stockFormData.phcId);
      const selMed = medicines.find((m) => (m.medicineId || m.id) === stockFormData.medicineId);
      const selBatch = batches.find((b) => (b.batchId || b.id) === stockFormData.batchId);

      if (!selMed) {
        showToast('Please select a valid medicine.', 'danger');
        return;
      }
      if (!selBatch) {
        showToast('Please select a valid batch.', 'danger');
        return;
      }

      // Section 6: Batch-Medicine Validation
      const batchMedId = (selBatch.medicineId || '').trim().toLowerCase();
      const selectedMedId = (selMed.medicineId || selMed.id || '').trim().toLowerCase();
      const batchMedName = (selBatch.medicineName || '').trim().toLowerCase();
      const selectedMedName = (selMed.medicineName || '').trim().toLowerCase();

      const isMatch = (batchMedId && selectedMedId && batchMedId === selectedMedId) ||
                      (batchMedName && selectedMedName && batchMedName === selectedMedName);

      if (!isMatch) {
        showToast(`Validation Error: Selected batch "${selBatch.batchNumber}" does not belong to medicine "${selMed.medicineName}".`, 'danger');
        return;
      }

      const payload = {
        phcId: stockFormData.phcId,
        phcName: selPhc?.phcName || selPhc?.name || '',
        districtId: selPhc?.districtId || '',
        districtName: selPhc?.districtName || '',
        medicineId: selMed.medicineId || selMed.id,
        medicineName: selMed.medicineName || selMed.name || '',
        batchId: selBatch.batchId || selBatch.id,
        batchNumber: selBatch.batchNumber || selBatch.batchNo || '',
        expiryDate: selBatch.expiryDate || '',
        quantity: Number(stockFormData.quantity),
        minimumStockLevel: Number(stockFormData.minimumStockLevel)
      };

      await inventoryService.addStock(payload);
      setIsStockModalOpen(false);
      await loadData();
      showToast('✓ Stock allocated successfully with verified batch expiry', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to allocate stock', 'danger');
    }
  };

  const handleOpenAdjustModal = (item) => {
    setSelectedItemToAdjust(item);
    setAdjustQty(String(item.quantity));
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedItemToAdjust) return;

    const parsed = parseInt(adjustQty, 10);
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid non-negative integer stock quantity.', 'danger');
      return;
    }

    try {
      await inventoryService.updateStock(selectedItemToAdjust.inventoryId, parsed);
      showToast(`✓ Stock for "${selectedItemToAdjust.medicineName}" updated to ${parsed} units`, 'success');
      setSelectedItemToAdjust(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update stock quantity', 'danger');
    }
  };

  const columns = [
    {
      header: 'Inv ID',
      key: 'inventoryId',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{val}</span>
    },
    {
      header: 'PHC Facility',
      key: 'phcName',
      render: (_, item) => {
        const pKey = (item.phcId || '').trim().toLowerCase();
        const matchedPhc = phcs.find((p) => (p.phcId || p.id || '').trim().toLowerCase() === pKey);
        const displayPhcName = (item.phcName && item.phcName !== item.phcId)
          ? item.phcName
          : (matchedPhc?.phcName || matchedPhc?.name || item.phcId || 'Unknown PHC');
        return <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{displayPhcName}</span>;
      }
    },
    {
      header: 'District',
      key: 'districtName',
      render: (_, item) => {
        const pKey = (item.phcId || '').trim().toLowerCase();
        const matchedPhc = phcs.find((p) => (p.phcId || p.id || '').trim().toLowerCase() === pKey);
        return (item.districtName && item.districtName !== 'Health District')
          ? item.districtName
          : (matchedPhc?.districtName || matchedPhc?.district || 'Health District');
      }
    },
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (_, item) => {
        const matchedMed = medicines.find((m) => (m.medicineId || m.id) === item.medicineId);
        const displayMedName = (item.medicineName && item.medicineName !== item.medicineId)
          ? item.medicineName
          : (matchedMed?.medicineName || matchedMed?.genericName || item.medicineName || item.medicineId || 'Medicine');
        return <span style={{ fontWeight: 600 }}>{displayMedName}</span>;
      }
    },
    {
      header: 'Batch No.',
      key: 'batchNumber',
      render: (_, item) => {
        const matchedBatch = batches.find((b) => (b.batchId || b.id) === item.batchId);
        const displayBatchNo = item.batchNumber || matchedBatch?.batchNumber || 'N/A';
        return <code style={{ background: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)' }}>{displayBatchNo}</code>;
      }
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (_, item) => {
        const matchedBatch = batches.find((b) => (b.batchId || b.id) === item.batchId);
        const displayExpiryDate = item.expiryDate || matchedBatch?.expiryDate || 'N/A';
        const expStatus = getExpiryStatus(displayExpiryDate);
        return (
          <span
            style={{
              color: expStatus.code === 'SAFE' ? 'var(--text-muted)' : expStatus.code === 'EXPIRED' ? 'var(--danger)' : 'var(--warning)',
              fontWeight: expStatus.code !== 'SAFE' ? 600 : 400
            }}
          >
            {formatDate(displayExpiryDate)}
          </span>
        );
      }
    },
    {
      header: 'Stock Qty',
      key: 'quantity',
      align: 'right',
      render: (val, item) => {
        const isLowStock = val <= item.minimumStockLevel;
        return <span style={{ fontWeight: 800, fontSize: '1rem', color: isLowStock ? 'var(--danger)' : 'var(--success)' }}>{val}</span>;
      }
    },
    {
      header: 'Min Level',
      key: 'minimumStockLevel',
      align: 'right',
      render: (val) => <span style={{ color: 'var(--text-dim)' }}>{val}</span>
    },
    {
      header: 'Health Status',
      key: 'stockStatus',
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
          onClick={() => handleOpenAdjustModal(item)}
        >
          <Edit3 size={14} /> Adjust Qty
        </button>
      )
    }
  ];

  return (
    <DashboardLayout title="Inventory">
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
              placeholder="Search PHC name, medicine, batch number..."
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
            style={{ width: '240px' }}
            value={selectedPhc}
            onChange={(e) => setSelectedPhc(e.target.value)}
          >
            <option value="ALL">All PHCs / Facilities</option>
            {phcs.map((p) => {
              const pId = p.phcId || p.id;
              const pName = p.phcName || p.name || 'Unnamed PHC';
              return (
                <option key={pId} value={pId}>
                  {pName}
                </option>
              );
            })}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddStock}>
          <Plus size={18} /> Allocate Stock to PHC
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredInventory}
        emptyMessage="No inventory records match filters."
        keyField="inventoryId"
      />

      {/* Stock Allocation Modal */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title="Allocate Stock to PHC">
        <form onSubmit={handleStockSubmit}>
          <div className="form-group">
            <label className="form-label">Target PHC Facility</label>
            <select
              className="form-control"
              value={stockFormData.phcId || ""}
              onChange={(e) => setStockFormData((prev) => ({ ...prev, phcId: e.target.value }))}
              required
            >
              <option value="">-- Select Target PHC Facility --</option>
              {phcsLoading ? (
                <option value="" disabled>Loading active PHCs from Oracle DB...</option>
              ) : phcs.length === 0 ? (
                <option value="" disabled>No active PHCs registered in Oracle DB</option>
              ) : (
                phcs.map((p) => {
                  const pId = p.phcId || p.id;
                  const pName = p.phcName || p.name || 'Unnamed PHC';
                  return (
                    <option key={pId} value={pId}>
                      {pName} {p.districtName ? `(${p.districtName})` : ''}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Medicine</label>
            <select
              className="form-control"
              value={stockFormData.medicineId}
              onChange={(e) => {
                const selectedMedId = e.target.value;
                const matchedMed = medicines.find((m) => (m.medicineId || m.id) === selectedMedId);
                const availBatches = batches.filter(
                  (b) => (b.medicineId || b.id) === selectedMedId ||
                    (b.medicineName || '').trim().toLowerCase() === (matchedMed?.medicineName || '').trim().toLowerCase()
                );
                const firstBatchId = availBatches[0]?.batchId || availBatches[0]?.id || '';
                setStockFormData((prev) => ({
                  ...prev,
                  medicineId: selectedMedId,
                  batchId: firstBatchId
                }));
              }}
              required
            >
              {medicines.map((m) => (
                <option key={m.medicineId || m.id} value={m.medicineId || m.id}>
                  {m.medicineName} ({m.genericName || 'Master'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Batch</label>
            <select
              className="form-control"
              value={stockFormData.batchId}
              onChange={(e) => setStockFormData((prev) => ({ ...prev, batchId: e.target.value }))}
              required
            >
              {(() => {
                const matchedMed = medicines.find((m) => (m.medicineId || m.id) === stockFormData.medicineId);
                const availBatches = batches.filter(
                  (b) => !stockFormData.medicineId ||
                    (b.medicineId || b.id) === stockFormData.medicineId ||
                    (b.medicineName || '').trim().toLowerCase() === (matchedMed?.medicineName || '').trim().toLowerCase()
                );
                return (availBatches.length > 0 ? availBatches : batches).map((b) => (
                  <option key={b.batchId || b.id} value={b.batchId || b.id}>
                    {b.batchNumber} (Exp: {b.expiryDate})
                  </option>
                ));
              })()}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Initial Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={stockFormData.quantity}
                onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Stock Threshold</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={stockFormData.minimumStockLevel}
                onChange={(e) => setStockFormData({ ...stockFormData, minimumStockLevel: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStockModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Allocate Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Quantity Modal */}
      <Modal
        isOpen={!!selectedItemToAdjust}
        onClose={() => setSelectedItemToAdjust(null)}
        title={`Adjust Stock — ${selectedItemToAdjust?.medicineName}`}
      >
        {selectedItemToAdjust && (
          <form onSubmit={handleSaveAdjust}>
            <div className="form-group">
              <label className="form-label">Facility</label>
              <input
                type="text"
                className="form-control"
                value={selectedItemToAdjust.phcName}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Stock Count (Units)</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedItemToAdjust(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Stock Adjustment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
