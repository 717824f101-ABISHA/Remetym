package com.remetym.inventory.controller;

import com.remetym.inventory.dto.StockTransferRequest;
import com.remetym.inventory.model.ConsumptionRecord;
import com.remetym.inventory.model.InventoryItem;
import com.remetym.inventory.repository.ConsumptionRepository;
import com.remetym.inventory.repository.InventoryRepository;
import com.remetym.inventory.service.ConsumptionService;
import com.remetym.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ConsumptionService consumptionService;

    @Autowired
    private ConsumptionRepository consumptionRepository;

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getInventory(
            @RequestParam(value = "phcId", required = false) String phcId,
            @RequestParam(value = "districtId", required = false) String districtId) {
        return ResponseEntity.ok(inventoryService.getInventory(phcId, districtId));
    }

    @GetMapping("/district/{districtId}")
    public ResponseEntity<List<InventoryItem>> getInventoryByDistrict(@PathVariable("districtId") String districtId) {
        return ResponseEntity.ok(inventoryService.getInventoryByDistrict(districtId));
    }

    @GetMapping("/summary/district/{districtId}")
    public ResponseEntity<Map<String, Object>> getDistrictSummary(@PathVariable("districtId") String districtId) {
        return ResponseEntity.ok(inventoryService.getDistrictSummary(districtId));
    }

    @GetMapping("/alerts/district/{districtId}")
    public ResponseEntity<List<Map<String, Object>>> getDistrictAlerts(@PathVariable("districtId") String districtId) {
        return ResponseEntity.ok(inventoryService.getDistrictAlerts(districtId));
    }

    @GetMapping("/procurement/district/{districtId}")
    public ResponseEntity<List<Map<String, Object>>> getDistrictProcurement(@PathVariable("districtId") String districtId) {
        return ResponseEntity.ok(inventoryService.getDistrictProcurement(districtId));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getAiAlerts() {
        return ResponseEntity.ok(inventoryService.getAIInsights());
    }

    @GetMapping("/historical")
    public ResponseEntity<List<ConsumptionRecord>> getHistoricalConsumption(
            @RequestParam(value = "phcId", required = false) String phcId,
            @RequestParam(value = "medicineId", required = false) String medicineId) {
        if (phcId != null && !phcId.trim().isEmpty()) {
            return ResponseEntity.ok(consumptionService.getConsumptionHistory(phcId, medicineId));
        }
        return ResponseEntity.ok(consumptionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<InventoryItem> addStock(@RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.addStock(item));
    }

    @PutMapping("/item/{id}")
    public ResponseEntity<?> updateStock(@PathVariable("id") String id, @RequestBody Map<String, Integer> payload) {
        try {
            int newQty = payload.containsKey("quantity") ? payload.get("quantity") : 0;
            return ResponseEntity.ok(inventoryService.updateStock(id, newQty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/item/{id}")
    public ResponseEntity<?> deleteStock(@PathVariable("id") String id) {
        try {
            inventoryService.deleteStock(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/flush-all")
    public ResponseEntity<?> flushAllInventory() {
        try {
            inventoryRepository.deleteAll();
            return ResponseEntity.ok(Map.of("success", true, "message", "All inventory items deleted."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> executeStockTransfer(@RequestBody StockTransferRequest request) {
        try {
            boolean success = inventoryService.executeStockTransfer(request);
            return ResponseEntity.ok(Map.of("success", success, "message", "Stock transfer completed successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/consumption")
    public ResponseEntity<ConsumptionRecord> recordConsumption(@RequestBody ConsumptionRecord record) {
        return ResponseEntity.ok(consumptionService.recordConsumption(record));
    }

    @GetMapping("/consumption/{phcId}")
    public ResponseEntity<List<ConsumptionRecord>> getConsumptionHistory(
            @PathVariable("phcId") String phcId,
            @RequestParam(value = "medicineId", required = false) String medicineId) {
        return ResponseEntity.ok(consumptionService.getConsumptionHistory(phcId, medicineId));
    }

    @GetMapping("/consumption/{phcId}/{medicineId}")
    public ResponseEntity<List<ConsumptionRecord>> getConsumptionHistoryByMedicine(
            @PathVariable("phcId") String phcId,
            @PathVariable("medicineId") String medicineId) {
        return ResponseEntity.ok(consumptionService.getConsumptionHistory(phcId, medicineId));
    }
}
