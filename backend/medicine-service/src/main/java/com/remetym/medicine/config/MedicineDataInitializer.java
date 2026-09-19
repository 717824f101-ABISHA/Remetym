package com.remetym.medicine.config;

import com.remetym.medicine.model.Batch;
import com.remetym.medicine.model.Medicine;
import com.remetym.medicine.repository.BatchRepository;
import com.remetym.medicine.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MedicineDataInitializer implements CommandLineRunner {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Override
    public void run(String... args) throws Exception {
        if (medicineRepository.count() == 0) {
            Medicine m1 = new Medicine();
            m1.setMedicineId("MED-001");
            m1.setMedicineName("Analgesic Tablet 500mg");
            m1.setGenericName("Acetaminophen");
            m1.setCategory("Analgesic / Antipyretic");
            m1.setUnitPrice("1.50");
            m1.setDosageForm("Tablet");
            m1.setStorageCondition("Store below 25°C");
            m1.setStrength("500mg");
            m1.setCreatedDate("2026-01-10");
            m1.setManufacturer("Standard Lifesciences");
            m1.setDescription("Essential fever & pain relief medicine.");
            medicineRepository.save(m1);

            Medicine m2 = new Medicine();
            m2.setMedicineId("MED-002");
            m2.setMedicineName("Antibiotic Capsule 250mg");
            m2.setGenericName("Broad Spectrum Antibiotic");
            m2.setCategory("Antibiotic");
            m2.setUnitPrice("4.20");
            m2.setDosageForm("Capsule");
            m2.setStorageCondition("Store in a cool dry place");
            m2.setStrength("250mg");
            m2.setCreatedDate("2026-01-12");
            m2.setManufacturer("Global Pharma");
            m2.setDescription("Broad-spectrum antibiotic formulation.");
            medicineRepository.save(m2);

            Medicine m3 = new Medicine();
            m3.setMedicineId("MED-003");
            m3.setMedicineName("Rehydration Salts 21.8g");
            m3.setGenericName("Oral Rehydration Salts");
            m3.setCategory("Electrolyte");
            m3.setUnitPrice("8.00");
            m3.setDosageForm("Sachet");
            m3.setStorageCondition("Store in dry area");
            m3.setStrength("21.8g");
            m3.setCreatedDate("2026-01-15");
            m3.setManufacturer("Essential Care");
            m3.setDescription("Standard formula for dehydration treatment.");
            medicineRepository.save(m3);

            System.out.println("[MEDICINE-SERVICE] Pre-seeded master medicine catalog.");
        }

        if (batchRepository.count() == 0) {
            Batch b1 = new Batch();
            b1.setBatchId("BAT-1001");
            b1.setMedicineId("MED-001");
            b1.setMedicineName("Analgesic Tablet 500mg");
            b1.setBatchNumber("BAT-2026-A1");
            b1.setManufacturingDate("2025-11-01");
            b1.setManufactureDate("2025-11-01");
            b1.setExpiryDate("2027-12-31");
            b1.setInitialQuantity(5000);
            b1.setQualityStatus("Passed");
            batchRepository.save(b1);

            Batch b2 = new Batch();
            b2.setBatchId("BAT-1002");
            b2.setMedicineId("MED-002");
            b2.setMedicineName("Antibiotic Capsule 250mg");
            b2.setBatchNumber("BAT-2026-B4");
            b2.setManufacturingDate("2025-12-10");
            b2.setManufactureDate("2025-12-10");
            b2.setExpiryDate("2027-08-31");
            b2.setInitialQuantity(3000);
            b2.setQualityStatus("Passed");
            batchRepository.save(b2);

            System.out.println("[MEDICINE-SERVICE] Pre-seeded initial medicine batch records.");
        }
    }
}
