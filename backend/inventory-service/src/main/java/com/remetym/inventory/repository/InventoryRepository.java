package com.remetym.inventory.repository;

import com.remetym.inventory.model.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<InventoryItem, String> {
    List<InventoryItem> findByPhcId(String phcId);
    List<InventoryItem> findByDistrictId(String districtId);
    List<InventoryItem> findByPhcIdIn(List<String> phcIds);
    List<InventoryItem> findByPhcIdInOrPhcNameInIgnoreCase(List<String> phcIds, List<String> phcNames);
    List<InventoryItem> findByDistrictIdIgnoreCaseOrDistrictNameIgnoreCase(String districtId, String districtName);
    Optional<InventoryItem> findByInventoryId(String inventoryId);
    Optional<InventoryItem> findByPhcIdAndMedicineId(String phcId, String medicineId);
}
