package com.remetym.inventory.service;

import com.remetym.inventory.model.ConsumptionRecord;
import com.remetym.inventory.model.InventoryItem;
import com.remetym.inventory.repository.ConsumptionRepository;
import com.remetym.inventory.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ConsumptionService {

    @Autowired
    private ConsumptionRepository consumptionRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    public ConsumptionRecord recordConsumption(ConsumptionRecord record) {
        if (record.getConsumptionId() == null || record.getConsumptionId().isEmpty()) {
            record.setConsumptionId("CNS-" + (System.currentTimeMillis() % 1000000));
        }
        if (record.getDate() == null) {
            record.setDate(LocalDate.now().toString());
        }
        record.setCreatedAt(Instant.now().toString());

        // Deduct from local inventory
        Optional<InventoryItem> invOpt = inventoryRepository.findByPhcIdAndMedicineId(record.getPhcId(), record.getMedicineId());
        if (invOpt.isPresent()) {
            InventoryItem item = invOpt.get();
            int newQty = Math.max(0, item.getQuantity() - record.getQuantityConsumed());
            item.setQuantity(newQty);
            item.setStockStatus(newQty <= item.getMinimumStockLevel() ? "Low Stock" : "Optimal");
            inventoryRepository.save(item);

            if (record.getMedicineName() == null) {
                record.setMedicineName(item.getMedicineName());
            }
            if (record.getPhcName() == null) {
                record.setPhcName(item.getPhcName());
            }
            if (record.getBatchNumber() == null) {
                record.setBatchNumber(item.getBatchNumber());
            }
        }

        return consumptionRepository.save(record);
    }

    public List<ConsumptionRecord> getConsumptionHistory(String phcId, String medicineId) {
        if (medicineId != null && !medicineId.isEmpty()) {
            return consumptionRepository.findByPhcIdAndMedicineId(phcId, medicineId);
        }
        return consumptionRepository.findByPhcId(phcId);
    }
}
