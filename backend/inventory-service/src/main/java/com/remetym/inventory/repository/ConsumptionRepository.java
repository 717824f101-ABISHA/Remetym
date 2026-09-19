package com.remetym.inventory.repository;

import com.remetym.inventory.model.ConsumptionRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsumptionRepository extends MongoRepository<ConsumptionRecord, String> {
    List<ConsumptionRecord> findByPhcId(String phcId);
    List<ConsumptionRecord> findByPhcIdAndMedicineId(String phcId, String medicineId);
}
