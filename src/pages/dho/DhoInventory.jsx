import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { inventoryService } from '../../services/inventoryService';
import { formatDate } from '../../utils/dateUtils';
import { exportDhoReportPDF } from '../../utils/exportUtils';
import { DataTable } from '../../components/common/DataTable';
import { Search, Download } from 'lucide-react';

export const DhoInventory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.districtId) return;
    let isMounted = true;

    const fetchInventory = async (districtId, districtName) => {
      console.log('Authenticated DHO (Inventory):', user);
      console.log('District ID:', districtId);
      console.log('District Name:', districtName);

      setLoading(true);
      try {
        const res = await inventoryService.getInventoryByDistrict(districtId, districtName);
        if (isMounted) {
          setInventory(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.error('Failed to load DHO inventory:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInventory(user.districtId, user.districtName);
    return () => {
      isMounted = false;
    };
  }, [user?.districtId, user?.districtName]);

  const filteredInventory = inventory.filter((item) => {
    const medName = item.medicineName || item.medicineId || '';
    const phc = item.phcName || '';
    const batch = item.batchNumber || '';
    const term = searchTerm.toLowerCase();
    return (
      medName.toLowerCase().includes(term) ||
      phc.toLowerCase().includes(term) ||
      batch.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (item) => {
    const qty = Number(item.quantity) || 0;
    const min = Number(item.minimumStockLevel) || 50;
    const exp = item.expiryDate ? item.expiryDate.trim() : '';

    const isExpiringSoon = exp && (exp.startsWith('2026-08') || exp.startsWith('2026-09'));

    if (qty === 0) {
      return { text: 'CRITICAL', class: 'badge-danger' };
    }
    if (isExpiringSoon) {
      return { text: 'EXPIRING', class: 'badge-danger' };
    }
    if (qty <= min) {
      return { text: 'LOW', class: 'badge-warning' };
    }
    return { text: 'NORMAL', class: 'badge-success' };
  };

  const inventoryColumns = [
    {
      header: 'Inventory ID',
      key: 'inventoryId',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
          {val || '-'}
        </span>
      )
    },
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (val, item) => (
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          {val || item.medicineId || '-'}
        </span>
      )
    },
    {
      header: 'PHC Facility',
      key: 'phcName',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{val || '-'}</span>
    },
    {
      header: 'Batch Number',
      key: 'batchNumber',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {val || '-'}
        </span>
      )
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (val) => formatDate(val)
    },
    {
      header: 'Current Stock',
      key: 'quantity',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 700 }}>{val ?? 0}</span>
    },
    {
      header: 'Min Level',
      key: 'minimumStockLevel',
      align: 'right',
      render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val || 50}</span>
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (_, item) => {
        const badge = getStatusBadge(item);
        return (
          <span className={`badge ${badge.class}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
            {badge.text}
          </span>
        );
      }
    }
  ];

  const handleDownloadPDF = () => {
    const districtLabel = user?.districtName || user?.districtId || 'District';
    const headers = ['Inv ID', 'PHC Facility', 'Medicine Name', 'Batch No.', 'Expiry Date', 'Stock Qty', 'Min Level', 'Status'];
    const rows = filteredInventory.map((item) => {
      const status = getStatusBadge(item);
      return {
        'Inv ID': item.inventoryId || '-',
        'PHC Facility': item.phcName || '-',
        'Medicine Name': item.medicineName || item.medicineId || '-',
        'Batch No.': item.batchNumber || '-',
        'Expiry Date': formatDate(item.expiryDate),
        'Stock Qty': item.quantity || 0,
        'Min Level': item.minimumStockLevel || 50,
        'Status': status.text
      };
    });
    exportDhoReportPDF('DHO_District_Inventory_Report', `District Physical Inventory Register`, `Scope: District ${districtLabel} PHCs`, headers, rows);
    showToast('✓ DHO District Inventory report exported successfully', 'success');
  };

  return (
    <DashboardLayout title="District Inventory">
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
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search medicine, PHC, batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <button onClick={handleDownloadPDF} className="btn btn-outline" disabled={filteredInventory.length === 0}>
          <Download size={16} /> Export Register (PDF)
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
          Loading district physical inventory...
        </div>
      ) : (
        <DataTable
          columns={inventoryColumns}
          data={filteredInventory}
          keyField="inventoryId"
          emptyMessage="No physical inventory records found for your district."
        />
      )}
    </DashboardLayout>
  );
};
