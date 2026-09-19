package com.remetym.medicine.repository;

import com.remetym.medicine.model.Batch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends MongoRepository<Batch, String> {
    Optional<Batch> findByBatchId(String batchId);
    Optional<Batch> findByBatchNumber(String batchNumber);
    List<Batch> findByMedicineId(String medicineId);
}
