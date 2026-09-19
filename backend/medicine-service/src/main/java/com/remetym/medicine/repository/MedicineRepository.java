package com.remetym.medicine.repository;

import com.remetym.medicine.model.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicineRepository extends MongoRepository<Medicine, String> {
    Optional<Medicine> findByMedicineId(String medicineId);
    Optional<Medicine> findByMedicineNameIgnoreCase(String medicineName);
}

