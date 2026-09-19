import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../context/ToastContext';
import { Download, AlertTriangle, PackageSearch } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { exportToPDF } from '../../utils/exportUtils';

export const AdminReports = () => {
  const { showToast } = useToast();
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      try {
        const invRes = await inventoryService.getInventory();
        if (!isMounted) return;
        const inventory = Array.isArray(invRes) ? invRes : [];
        const items = inventory.map((item) => {
          const currentStock = item.quantity || 0;
          const minLevel = item.minimumStockLevel || 50;
          const deficit = Math.max(0, minLevel - currentStock);

          let status = 'SUFFICIENT';
          if (currentStock <= 0) {
            status = 'CRITICAL';
          } else if (currentStock <= minLevel) {
            status = 'LOW STOCK';
          }

          return {
            ...item,
            currentStock,
            minLevel,
            deficit,
            status,
            lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0]
          };
        });

        setLowStockItems(items.filter((i) => i.status !== 'SUFFICIENT'));
      } catch (err) {
        console.error('Failed to load report data:', err);
      }
    };

    fetchReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = () => {
    const headers = ['Medicine Name', 'Medicine ID', 'PHC Facility', 'Current Stock', 'Min Stock Level', 'Stock Status', 'Required Quantity', 'Last Updated'];
    const rows = lowStockItems.map((item) => ({
      'Medicine Name': item.medicineName,
      'Medicine ID': item.medicineId || 'MED-00',
      'PHC Facility': item.phcName || '-',
      'Current Stock': item.currentStock,
      'Min Stock Level': item.minLevel,
      'Stock Status': item.status,
      'Required Quantity': `+${item.deficit} units`,
      'Last Updated': item.lastUpdated
    }));
    exportToPDF('Admin_Low_Stock_Report', 'National Healthcare Low Stock Audit Report', headers, rows);
    showToast('✓ Low Stock Report downloaded successfully', 'success');
  };

  const columns = [
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      header: 'Medicine ID',
      key: 'medicineId',
      render: (val, _, idx) => <code>{val || `MED-00${idx + 1}`}</code>
    },
    {
      header: 'PHC / Facility',
      key: 'phcName',
      render: (val) => <span style={{ fontWeight: 600 }}>{val || '-'}</span>
    },
    {
      header: 'Current Stock',
      key: 'currentStock',
      align: 'right',
      render: (val, item) => (
        <span style={{ color: item.status === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)', fontWeight: 800 }}>
          {val}
        </span>
      )
    },
    {
      header: 'Min Stock Level',
      key: 'minLevel',
      align: 'right'
    },
    {
      header: 'Stock Status',
      key: 'status',
      align: 'center',
      render: (val) => (
        <span
          className={`badge ${
            val === 'CRITICAL'
              ? 'badge-danger'
              : val === 'LOW STOCK'
              ? 'badge-warning'
              : 'badge-success'
          }`}
        >
          {val}
        </span>
      )
    },
    {
      header: 'Required Quantity',
      key: 'deficit',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>+{val} units</span>
    },
    {
      header: 'Last Updated',
      key: 'lastUpdated',
      render: (val) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{val}</span>
    }
  ];

  return (
    <DashboardLayout title="Reports">
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
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={22} color="var(--warning)" />
            <span>Low Stock Report</span>
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', margin: '0.25rem 0 0' }}>
            System-wide inventory items operating below minimum safety stock levels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={lowStockItems}
        emptyMessage="No low stock items operating below minimum safety stock levels."
        keyField="inventoryId"
      />
    </DashboardLayout>
  );
};
