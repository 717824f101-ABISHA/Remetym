package com.remetym.medicine.service;

import com.remetym.medicine.model.Medicine;
import com.remetym.medicine.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public synchronized String generateUniqueMedicineId() {
        List<Medicine> all = medicineRepository.findAll();
        int maxNum = 0;
        if (all != null) {
            for (Medicine m : all) {
                if (m.getMedicineId() != null && m.getMedicineId().toUpperCase().startsWith("MED-")) {
                    try {
                        int num = Integer.parseInt(m.getMedicineId().substring(4).trim());
                        if (num > maxNum) {
                            maxNum = num;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return "MED-" + String.format("%03d", maxNum + 1);
    }

    public synchronized List<Medicine> getAllMedicines() {
        List<Medicine> all = medicineRepository.findAll();
        Set<String> seenIds = new HashSet<>();
        boolean updated = false;

        for (Medicine m : all) {
            String medId = m.getMedicineId();
            if (medId == null || medId.trim().isEmpty() || seenIds.contains(medId)) {
                String newId = generateUniqueMedicineId();
                m.setMedicineId(newId);
                seenIds.add(newId);
                medicineRepository.save(m);
                updated = true;
            } else {
                seenIds.add(medId);
            }
        }

        if (updated) {
            return medicineRepository.findAll();
        }
        return all;
    }

    public Medicine getMedicineById(String medicineId) {
        return medicineRepository.findByMedicineId(medicineId)
                .orElseGet(() -> medicineRepository.findById(medicineId).orElse(null));
    }

    public synchronized Medicine findOrCreateMedicine(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        String cleanName = name.trim();
        Optional<Medicine> existingOpt = medicineRepository.findByMedicineNameIgnoreCase(cleanName);
        if (existingOpt.isPresent()) {
            return existingOpt.get();
        }

        Medicine newMed = new Medicine();
        newMed.setMedicineId(generateUniqueMedicineId());
        newMed.setMedicineName(cleanName);
        newMed.setGenericName(cleanName);
        newMed.setCategory("General");
        newMed.setDosageForm("Tablet/Injectable");
        newMed.setCreatedDate(LocalDate.now().toString());
        return medicineRepository.save(newMed);
    }

    public synchronized Medicine addMedicine(Medicine medicine) {
        if (medicine.getMedicineName() != null && !medicine.getMedicineName().trim().isEmpty()) {
            Optional<Medicine> existing = medicineRepository.findByMedicineNameIgnoreCase(medicine.getMedicineName().trim());
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        if (medicine.getMedicineId() == null || medicine.getMedicineId().isEmpty() || medicineRepository.findByMedicineId(medicine.getMedicineId()).isPresent()) {
            medicine.setMedicineId(generateUniqueMedicineId());
        }
        if (medicine.getCreatedDate() == null) {
            medicine.setCreatedDate(LocalDate.now().toString());
        }
        return medicineRepository.save(medicine);
    }

    public Medicine updateMedicine(String identifier, Medicine updated) {
        Medicine existing = medicineRepository.findById(identifier)
                .orElseGet(() -> medicineRepository.findByMedicineId(identifier)
                .orElseThrow(() -> new RuntimeException("Medicine not found.")));

        if (updated.getMedicineId() != null && !updated.getMedicineId().trim().isEmpty()) {
            existing.setMedicineId(updated.getMedicineId().trim());
        }
        if (updated.getMedicineName() != null) existing.setMedicineName(updated.getMedicineName());
        if (updated.getGenericName() != null) existing.setGenericName(updated.getGenericName());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getUnitPrice() != null) existing.setUnitPrice(updated.getUnitPrice());
        if (updated.getDosageForm() != null) existing.setDosageForm(updated.getDosageForm());
        if (updated.getStorageCondition() != null) existing.setStorageCondition(updated.getStorageCondition());
        if (updated.getStrength() != null) existing.setStrength(updated.getStrength());
        if (updated.getManufacturer() != null) existing.setManufacturer(updated.getManufacturer());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());

        return medicineRepository.save(existing);
    }

    public boolean deleteMedicine(String identifier) {
        Medicine existing = medicineRepository.findById(identifier)
                .orElseGet(() -> medicineRepository.findByMedicineId(identifier).orElse(null));
        if (existing != null) {
            medicineRepository.delete(existing);
            return true;
        }
        return false;
    }
}
