import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { medicineService } from '../../services/medicineService';
import { Search } from 'lucide-react';

export const PhcMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchMedicines = async () => {
      try {
        const res = await medicineService.getMedicines();
        if (isMounted) {
          setMedicines(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.error('Failed to load PHC medicines:', err);
      }
    };
    fetchMedicines();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMedicines = medicines.filter(
    (m) =>
      (m.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Medicines">
      <div style={{ marginBottom: '1.5rem', width: '380px', position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search medicine, generic formula, category..."
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

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Brand Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Form</th>
                <th>Manufacturer</th>
                <th>Storage Specs</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((med) => (
                <tr key={med.medicineId}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{med.medicineId}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{med.medicineName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{med.genericName}</td>
                  <td>
                    <span className="badge badge-info">{med.category}</span>
                  </td>
                  <td>{med.dosageForm || 'Tablet'}</td>
                  <td>{med.manufacturer}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{med.storageCondition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
