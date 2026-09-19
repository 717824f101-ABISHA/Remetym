import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requestService } from '../../services/requestService';
import { medicineService } from '../../services/medicineService';
import { inventoryService } from '../../services/inventoryService';
import { phcService } from '../../services/phcService';
import { AlertCircle, ShieldCheck, PlusCircle } from 'lucide-react';

export const PhcTransferRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sameDistrictPhcs, setSameDistrictPhcs] = useState([]);
  const [phcsLoading, setPhcsLoading] = useState(true);
  const [medicineCatalog, setMedicineCatalog] = useState([]);

  const [formData, setFormData] = useState({
    destPhcId: user?.phcId || user?.id || '',
    destPhcName: user?.phcName || user?.name || '',
    destDistrictId: user?.districtId || '',
    destDistrictName: user?.districtName || user?.district || '',
    sourcePhcId: '',
    sourcePhcName: '',
    sourceDistrictId: user?.districtId || '',
    sourceDistrictName: user?.districtName || user?.district || '',
    medicineId: '',
    medicineName: '',
    batchId: '',
    batchNumber: '',
    quantity: '',
    reason: ''
  });

  const [availableStockItems, setAvailableStockItems] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [availableQty, setAvailableQty] = useState(0);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Load active Oracle PHCs filtered strictly by logged-in user's district
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (!user) return;
      try {
        setPhcsLoading(true);
        console.log('[PhcTransferRequest] Fetching active Oracle PHCs for district:', user.districtId || user.districtName);
        const phcData = await phcService.getPhcs(true).catch(() => []);
        const rawPhcs = Array.isArray(phcData) ? phcData : [];
        const uniquePhcs = Array.from(
          new Map(rawPhcs.filter((p) => p.phcId || p.id).map((p) => [p.phcId || p.id, p])).values()
        );

        const userDistId = (user.districtId || '').trim().toLowerCase();
        const userDistName = (user.districtName || user.district || '').trim().toLowerCase();
        const currPhcId = (user.phcId || user.id || '').trim().toLowerCase();

        // Strict District Filter: Keep ONLY PHCs in the same district, excluding logged-in PHC (Destination)
        const sameDistrictCandidates = uniquePhcs.filter((p) => {
          const pPhcId = (p.phcId || p.id || '').trim().toLowerCase();
          if (pPhcId === currPhcId) return false; // Exclude logged-in facility

          const pDistId = (p.districtId || '').trim().toLowerCase();
          const pDistName = (p.districtName || p.district || '').trim().toLowerCase();

          const matchId = userDistId && pDistId && pDistId === userDistId;
          const matchName = userDistName && pDistName && pDistName === userDistName;

          return matchId || matchName;
        });

        console.log('[PhcTransferRequest] Same-district Source PHCs loaded:', sameDistrictCandidates.length, sameDistrictCandidates);

        const medsData = await medicineService.getMedicines().catch(() => []);
        const rawMeds = Array.isArray(medsData) ? medsData : (medsData?.data || medsData?.content || []);

        if (!isMounted) return;
        setSameDistrictPhcs(sameDistrictCandidates);
        setMedicineCatalog(rawMeds);

        // Auto-select first available Source PHC in same district if available
        if (sameDistrictCandidates.length > 0) {
          const firstPhc = sameDistrictCandidates[0];
          setFormData((prev) => ({
            ...prev,
            destPhcId: user.phcId || user.id || prev.destPhcId,
            destPhcName: user.phcName || user.name || prev.destPhcName,
            destDistrictId: user.districtId || prev.destDistrictId,
            destDistrictName: user.districtName || user.district || prev.destDistrictName,
            sourcePhcId: firstPhc.phcId || firstPhc.id,
            sourcePhcName: firstPhc.phcName || firstPhc.name || '',
            sourceDistrictId: firstPhc.districtId || user.districtId || '',
            sourceDistrictName: firstPhc.districtName || user.districtName || ''
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            destPhcId: user.phcId || user.id || prev.destPhcId,
            destPhcName: user.phcName || user.name || prev.destPhcName,
            destDistrictId: user.districtId || prev.destDistrictId,
            destDistrictName: user.districtName || user.district || prev.destDistrictName,
            sourcePhcId: '',
            sourcePhcName: ''
          }));
        }
      } catch (err) {
        console.error('[PhcTransferRequest ERROR] Initialization failed:', err);
        if (isMounted) setError('Failed to load active district PHCs from Oracle database.');
      } finally {
        if (isMounted) setPhcsLoading(false);
      }
    };

    initData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Fetch MongoDB inventory stock for selected Source PHC whenever sourcePhcId changes
  useEffect(() => {
    let isMounted = true;
    const fetchPhcStock = async () => {
      if (!formData.sourcePhcId) {
        setAvailableStockItems([]);
        setAvailableQty(0);
        return;
      }

      try {
        setStockLoading(true);
        setError('');
        console.log('[PhcTransferRequest] Querying MongoDB inventory for selected Source PHC:', formData.sourcePhcId);

        const allInv = await inventoryService.getInventory(true).catch(() => []);
        const rawInv = Array.isArray(allInv) ? allInv : (allInv?.data || allInv?.content || []);

        const targetPhcId = (formData.sourcePhcId || '').trim().toLowerCase();
        const targetPhcName = (formData.sourcePhcName || '').trim().toLowerCase();

        // Match inventory by phcId (primary) or phcName, with quantity > 0
        const phcItems = rawInv.filter((inv) => {
          const invPId = (inv.phcId || '').trim().toLowerCase();
          const invPName = (inv.phcName || '').trim().toLowerCase();
          const isPhcMatch = (targetPhcId && invPId === targetPhcId) || (targetPhcName && invPName === targetPhcName);
          return isPhcMatch && (Number(inv.quantity) > 0);
        });

        // Enrich medicineName using medicine catalog fallback
        const enrichedItems = phcItems.map((inv) => {
          const matchedMed = medicineCatalog.find(
            (m) => (m.medicineId || m.id || '').trim().toLowerCase() === (inv.medicineId || '').trim().toLowerCase()
          );
          const medName = (inv.medicineName && inv.medicineName !== inv.medicineId)
            ? inv.medicineName
            : (matchedMed?.medicineName || matchedMed?.genericName || inv.medicineId || 'Medicine');

          return {
            ...inv,
            medicineName: medName
          };
        });

        console.log('[PhcTransferRequest] Available stock items at selected Source PHC:', enrichedItems.length, enrichedItems);

        if (!isMounted) return;
        setAvailableStockItems(enrichedItems);

        if (enrichedItems.length > 0) {
          const firstItem = enrichedItems[0];
          setFormData((prev) => ({
            ...prev,
            medicineId: firstItem.medicineId,
            medicineName: firstItem.medicineName,
            batchId: firstItem.batchId || '',
            batchNumber: firstItem.batchNumber || ''
          }));
          setAvailableQty(firstItem.quantity || 0);
        } else {
          setFormData((prev) => ({
            ...prev,
            medicineId: '',
            medicineName: '',
            batchId: '',
            batchNumber: ''
          }));
          setAvailableQty(0);
        }
      } catch (err) {
        console.error('[PhcTransferRequest ERROR] Failed to fetch stock:', err);
        if (isMounted) {
          setAvailableStockItems([]);
          setAvailableQty(0);
        }
      } finally {
        if (isMounted) setStockLoading(false);
      }
    };

    fetchPhcStock();
    return () => {
      isMounted = false;
    };
  }, [formData.sourcePhcId, medicineCatalog]);

  const handleSourcePhcChange = (e) => {
    const selectedId = e.target.value;
    const selectedPhc = sameDistrictPhcs.find((p) => (p.phcId || p.id) === selectedId);
    setFormData((prev) => ({
      ...prev,
      sourcePhcId: selectedId,
      sourcePhcName: selectedPhc ? (selectedPhc.phcName || selectedPhc.name) : '',
      sourceDistrictId: selectedPhc ? (selectedPhc.districtId || user?.districtId || '') : '',
      sourceDistrictName: selectedPhc ? (selectedPhc.districtName || user?.districtName || '') : '',
      medicineId: '',
      medicineName: '',
      batchId: '',
      batchNumber: ''
    }));
  };

  const handleMedicineChange = (e) => {
    const selectedMedId = e.target.value;
    const selectedItem = availableStockItems.find((inv) => (inv.medicineId || inv.id) === selectedMedId);
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        medicineId: selectedItem.medicineId,
        medicineName: selectedItem.medicineName,
        batchId: selectedItem.batchId || '',
        batchNumber: selectedItem.batchNumber || ''
      }));
      setAvailableQty(selectedItem.quantity || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requestedQty = Number(formData.quantity);

    if (!formData.destPhcId) {
      setError('Destination receiving PHC facility is invalid.');
      return;
    }

    if (!formData.sourcePhcId) {
      setError('Please select a valid Source Supplying PHC within your district.');
      return;
    }

    if (!formData.medicineId) {
      setError('Please select a medicine formulation with available stock at the source PHC.');
      return;
    }

    if (isNaN(requestedQty) || requestedQty <= 0) {
      setError('Please enter a valid transfer quantity greater than 0.');
      return;
    }

    if (requestedQty > availableQty) {
      setError(`Requested quantity (${requestedQty}) cannot exceed available stock at source PHC (${availableQty} units).`);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        destPhcId: user.phcId || user.id || formData.destPhcId,
        destPhcName: user.phcName || user.name || formData.destPhcName,
        destDistrictId: user.districtId || formData.destDistrictId,
        destDistrictName: user.districtName || user.district || formData.destDistrictName,
        sourcePhcId: formData.sourcePhcId,
        sourcePhcName: formData.sourcePhcName,
        sourceDistrictId: formData.sourceDistrictId || user.districtId,
        sourceDistrictName: formData.sourceDistrictName || user.districtName,
        districtId: user.districtId || formData.destDistrictId,
        districtName: user.districtName || user.district || formData.destDistrictName,
        medicineId: formData.medicineId,
        medicineName: formData.medicineName,
        batchId: formData.batchId,
        batchNumber: formData.batchNumber,
        quantity: requestedQty,
        reason: formData.reason
      };

      await requestService.createRequest(payload, user);
      setSubmitting(false);
      showToast('✓ District transfer request submitted successfully', 'success');
      navigate('/phc/my-requests');
    } catch (err) {
      setError(err.message || 'Failed to create transfer request.');
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Transfer Request">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--primary)',
            backgroundColor: 'var(--primary-light)'
          }}
        >
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <ShieldCheck size={24} color="var(--primary)" style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                District Transfer Restriction Rules
              </h4>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Destination facility is fixed to your logged-in PHC (<strong>{user?.phcName || '-'}</strong>). Source supplying facilities are restricted strictly to PHCs within your assigned district (<strong>{user?.districtName || user?.district || '-'}</strong>). Cross-district transfers are strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Destination PHC (Receiving PHC - Fixed & Read-only) */}
            <div className="form-group">
              <label className="form-label">Destination Receiving PHC (Your Facility — Auto-filled)</label>
              <input
                type="text"
                className="form-control"
                value={`${user?.phcName || '-'} (${user?.districtName || user?.district || '-'})`}
                disabled
                style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--primary)', fontWeight: 600 }}
              />
            </div>

            {/* Source PHC (Supplying PHC - Same District Dropdown) */}
            <div className="form-group">
              <label className="form-label">Source Supplying PHC (Select from Same District)</label>
              <select
                className="form-control"
                value={formData.sourcePhcId}
                onChange={handleSourcePhcChange}
                required
              >
                {phcsLoading ? (
                  <option value="" disabled>Loading district PHCs from Oracle DB...</option>
                ) : sameDistrictPhcs.length === 0 ? (
                  <option value="" disabled>No other active PHCs in your district ({user?.districtName || user?.district || 'District'})</option>
                ) : (
                  sameDistrictPhcs.map((p) => {
                    const pId = p.phcId || p.id;
                    const pName = p.phcName || p.name || 'Unnamed PHC';
                    return (
                      <option key={pId} value={pId}>
                        {pName} ({p.districtName || user?.districtName || user?.district || ''})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Available Medicine Selection at Selected Source PHC */}
            <div className="form-group">
              <label className="form-label">Available Medicine Formulation at Selected Source PHC</label>
              <select
                className="form-control"
                value={formData.medicineId}
                onChange={handleMedicineChange}
                required
                disabled={stockLoading || availableStockItems.length === 0}
              >
                {stockLoading ? (
                  <option value="" disabled>Loading available stock at selected Source PHC...</option>
                ) : availableStockItems.length === 0 ? (
                  <option value="" disabled>No stock available at selected Source PHC ({formData.sourcePhcName || 'Source PHC'}).</option>
                ) : (
                  availableStockItems.map((inv) => {
                    const mId = inv.medicineId;
                    return (
                      <option key={mId + '_' + (inv.batchNumber || '')} value={mId}>
                        {inv.medicineName} {inv.batchNumber ? `(Batch: ${inv.batchNumber})` : ''} — {inv.quantity} units available
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Available Stock Indicator */}
            <div
              style={{
                backgroundColor: 'var(--bg-dark)',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color)'
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Available Stock at Selected Source PHC ({formData.sourcePhcName || 'Source PHC'}):</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: availableQty > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {stockLoading ? 'Checking...' : `${availableQty} units`}
              </span>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Transfer Quantity Requested</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 50"
                min="1"
                max={availableQty > 0 ? availableQty : undefined}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">Justification / Emergency Reason</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Stock depletion due to patient influx."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/phc/my-requests')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || stockLoading || availableQty <= 0 || !formData.sourcePhcId}
              >
                <PlusCircle size={18} /> Submit District Transfer Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
