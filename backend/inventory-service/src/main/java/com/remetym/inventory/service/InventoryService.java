package com.remetym.inventory.service;

import com.remetym.inventory.dto.StockTransferRequest;
import com.remetym.inventory.model.InventoryItem;
import com.remetym.inventory.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public void syncInventoryWithMasterBatches(List<InventoryItem> items) {
        if (items == null || items.isEmpty()) return;
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String medicineServiceUrl = System.getenv("MEDICINE_SERVICE_URL") != null ? System.getenv("MEDICINE_SERVICE_URL") : "http://localhost:8082";
            String batchesUrl = medicineServiceUrl + "/api/batches";
            List<?> masterBatches = restTemplate.getForObject(batchesUrl, List.class);

            if (masterBatches != null && !masterBatches.isEmpty()) {
                Map<String, Map<?, ?>> batchByNo = new HashMap<>();
                Map<String, Map<?, ?>> batchById = new HashMap<>();

                for (Object obj : masterBatches) {
                    if (obj instanceof Map) {
                        Map<?, ?> b = (Map<?, ?>) obj;
                        String bNo = (String) b.get("batchNumber");
                        String bId = (String) b.get("batchId");
                        if (bNo != null && !bNo.trim().isEmpty()) batchByNo.put(bNo.trim().toLowerCase(), b);
                        if (bId != null && !bId.trim().isEmpty()) batchById.put(bId.trim().toLowerCase(), b);
                    }
                }

                for (InventoryItem item : items) {
                    Map<?, ?> matchedBatch = null;
                    if (item.getBatchNumber() != null && !item.getBatchNumber().trim().isEmpty()) {
                        matchedBatch = batchByNo.get(item.getBatchNumber().trim().toLowerCase());
                    }
                    if (matchedBatch == null && item.getBatchId() != null && !item.getBatchId().trim().isEmpty()) {
                        matchedBatch = batchById.get(item.getBatchId().trim().toLowerCase());
                    }

                    if (matchedBatch != null) {
                        String batchExpiry = (String) matchedBatch.get("expiryDate");
                        String bId = (String) matchedBatch.get("batchId");
                        String bNo = (String) matchedBatch.get("batchNumber");

                        boolean changed = false;
                        if (batchExpiry != null && !batchExpiry.trim().isEmpty() && !batchExpiry.equalsIgnoreCase(item.getExpiryDate())) {
                            item.setExpiryDate(batchExpiry);
                            changed = true;
                        }
                        if (bId != null && !bId.trim().isEmpty() && (item.getBatchId() == null || item.getBatchId().trim().isEmpty())) {
                            item.setBatchId(bId);
                            changed = true;
                        }
                        if (bNo != null && !bNo.trim().isEmpty() && (item.getBatchNumber() == null || item.getBatchNumber().trim().isEmpty())) {
                            item.setBatchNumber(bNo);
                            changed = true;
                        }
                        if (changed) {
                            inventoryRepository.save(item);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[INVENTORY-SERVICE] Master batch sync warning: " + e.getMessage());
        }
    }

    public List<InventoryItem> getInventory(String phcId, String districtId) {
        List<InventoryItem> allCatalogItems = inventoryRepository.findAll();
        List<InventoryItem> items;

        if (phcId != null && !phcId.trim().isEmpty()) {
            final String queryPhc = phcId.trim();
            items = allCatalogItems.stream()
                    .filter(i -> matchPhc(i, queryPhc, queryPhc))
                    .collect(Collectors.toList());

            if (items.isEmpty()) {
                items = inventoryRepository.findByPhcId(queryPhc);
            }
        } else if (districtId != null && !districtId.trim().isEmpty() && !"DIST-ALL".equalsIgnoreCase(districtId.trim())) {
            final String queryDist = districtId.trim();
            items = allCatalogItems.stream()
                    .filter(i -> (i.getDistrictId() != null && i.getDistrictId().equalsIgnoreCase(queryDist)) ||
                                 (i.getDistrictName() != null && i.getDistrictName().equalsIgnoreCase(queryDist)))
                    .collect(Collectors.toList());

            if (items.isEmpty()) {
                items = inventoryRepository.findByDistrictId(queryDist);
            }
        } else {
            items = allCatalogItems;
        }

        // Synchronize batch details with master Admin batch register
        syncInventoryWithMasterBatches(items);

        // Fill missing display names while NEVER overwriting valid batch numbers & expiry dates
        for (InventoryItem item : items) {
            String pId = item.getPhcId();
            String pName = item.getPhcName();

            if (pName == null || pName.trim().isEmpty() || (pId != null && pName.equalsIgnoreCase(pId))) {
                if (pId != null && !pId.isEmpty()) {
                    Optional<InventoryItem> match = allCatalogItems.stream()
                            .filter(other -> pId.equalsIgnoreCase(other.getPhcId()) &&
                                             other.getPhcName() != null &&
                                             !other.getPhcName().trim().isEmpty() &&
                                             !other.getPhcName().equalsIgnoreCase(pId))
                            .findFirst();
                    if (match.isPresent()) {
                        item.setPhcName(match.get().getPhcName());
                        if (item.getDistrictName() == null || item.getDistrictName().trim().isEmpty()) {
                            item.setDistrictName(match.get().getDistrictName());
                        }
                    } else if ("PHC-201".equalsIgnoreCase(pId)) {
                        item.setPhcName("AgalyaPHC");
                        item.setDistrictName("Tenkasi");
                    } else if ("PHC-676".equalsIgnoreCase(pId)) {
                        item.setPhcName("AbiPHC");
                        item.setDistrictName("Tirunelvelli");
                    } else if ("PHC-675".equalsIgnoreCase(pId)) {
                        item.setPhcName("DharPHC");
                        item.setDistrictName("Erode");
                    } else if ("PHC-216".equalsIgnoreCase(pId)) {
                        item.setPhcName("Dharshini PHC");
                        item.setDistrictName("Erode");
                    } else if ("PHC-316".equalsIgnoreCase(pId)) {
                        item.setPhcName("Gnana PHC");
                        item.setDistrictName("Kovai");
                    } else if ("PHC-222".equalsIgnoreCase(pId)) {
                        item.setPhcName("Harinitha PHC");
                        item.setDistrictName("Erode");
                    } else {
                        item.setPhcName(pId);
                    }
                } else {
                    item.setPhcName("Health Facility");
                }
            }

            if (item.getDistrictName() == null || item.getDistrictName().trim().isEmpty()) {
                item.setDistrictName("Health District");
            }

            String medId = item.getMedicineId();
            String medName = item.getMedicineName();

            if (medName == null || medName.trim().isEmpty() || (medId != null && medName.equalsIgnoreCase(medId))) {
                if (medId != null && !medId.isEmpty()) {
                    Optional<InventoryItem> match = allCatalogItems.stream()
                            .filter(other -> medId.equalsIgnoreCase(other.getMedicineId()) &&
                                             other.getMedicineName() != null &&
                                             !other.getMedicineName().trim().isEmpty() &&
                                             !other.getMedicineName().equalsIgnoreCase(medId))
                            .findFirst();
                    if (match.isPresent()) {
                        item.setMedicineName(match.get().getMedicineName());
                    } else {
                        item.setMedicineName(medId);
                    }
                } else {
                    item.setMedicineName("Essential Medicine");
                }
            }
        }
        return items;
    }

    public InventoryItem addStock(InventoryItem item) {
        if (item.getInventoryId() == null || item.getInventoryId().isEmpty()) {
            item.setInventoryId("INV-" + (System.currentTimeMillis() % 1000000));
        }

        List<InventoryItem> allCatalogItems = inventoryRepository.findAll();

        String pId = item.getPhcId();
        String pName = item.getPhcName();

        if (pName == null || pName.trim().isEmpty() || (pId != null && pName.equalsIgnoreCase(pId))) {
            if (pId != null && !pId.isEmpty()) {
                Optional<InventoryItem> match = allCatalogItems.stream()
                        .filter(other -> pId.equalsIgnoreCase(other.getPhcId()) &&
                                         other.getPhcName() != null &&
                                         !other.getPhcName().trim().isEmpty() &&
                                         !other.getPhcName().equalsIgnoreCase(pId))
                        .findFirst();
                if (match.isPresent()) {
                    item.setPhcName(match.get().getPhcName());
                    if (item.getDistrictName() == null || item.getDistrictName().trim().isEmpty()) {
                        item.setDistrictName(match.get().getDistrictName());
                    }
                } else if ("PHC-201".equalsIgnoreCase(pId)) {
                    item.setPhcName("AgalyaPHC");
                    item.setDistrictName("Tenkasi");
                } else if ("PHC-676".equalsIgnoreCase(pId)) {
                    item.setPhcName("AbiPHC");
                    item.setDistrictName("Tirunelvelli");
                } else if ("PHC-675".equalsIgnoreCase(pId)) {
                    item.setPhcName("DharPHC");
                    item.setDistrictName("Erode");
                } else if ("PHC-216".equalsIgnoreCase(pId)) {
                    item.setPhcName("Dharshini PHC");
                    item.setDistrictName("Erode");
                } else if ("PHC-EAST-01".equalsIgnoreCase(pId)) {
                    item.setPhcName("East PHC Center");
                    item.setDistrictName("East District");
                } else if ("PHC-316".equalsIgnoreCase(pId)) {
                    item.setPhcName("Gnana PHC");
                    item.setDistrictName("Kovai");
                } else if ("PHC-222".equalsIgnoreCase(pId)) {
                    item.setPhcName("Harinitha PHC");
                    item.setDistrictName("Erode");
                } else if ("PHC-SEC-01".equalsIgnoreCase(pId)) {
                    item.setPhcName("Sec PHC");
                    item.setDistrictName("Sec District");
                } else {
                    item.setPhcName(pId);
                }
            } else {
                item.setPhcName("Health Facility");
            }
        }

        if (item.getDistrictName() == null || item.getDistrictName().trim().isEmpty()) {
            item.setDistrictName("Health District");
        }

        if (item.getMedicineName() == null || item.getMedicineName().trim().isEmpty() || (item.getMedicineId() != null && item.getMedicineName().equalsIgnoreCase(item.getMedicineId()))) {
            String medId = item.getMedicineId();
            if (medId != null && !medId.isEmpty()) {
                Optional<InventoryItem> match = allCatalogItems.stream()
                        .filter(other -> medId.equalsIgnoreCase(other.getMedicineId()) &&
                                         other.getMedicineName() != null &&
                                         !other.getMedicineName().trim().isEmpty() &&
                                         !other.getMedicineName().equalsIgnoreCase(medId))
                        .findFirst();
                if (match.isPresent()) {
                    item.setMedicineName(match.get().getMedicineName());
                } else {
                    item.setMedicineName(medId);
                }
            } else {
                item.setMedicineName("Essential Medicine");
            }
        }

        // If batch expiry date is missing, fetch from master batch register in medicine-service
        if (item.getExpiryDate() == null || item.getExpiryDate().trim().isEmpty() || "N/A".equalsIgnoreCase(item.getExpiryDate().trim())) {
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String medicineServiceUrl = System.getenv("MEDICINE_SERVICE_URL") != null ? System.getenv("MEDICINE_SERVICE_URL") : "http://localhost:8082";
                String batchesUrl = medicineServiceUrl + "/api/batches";
                List<?> masterBatches = restTemplate.getForObject(batchesUrl, List.class);
                if (masterBatches != null) {
                    for (Object obj : masterBatches) {
                        if (obj instanceof Map) {
                            Map<?, ?> b = (Map<?, ?>) obj;
                            String bNo = (String) b.get("batchNumber");
                            String bId = (String) b.get("batchId");
                            String bExp = (String) b.get("expiryDate");
                            if ((bNo != null && bNo.equalsIgnoreCase(item.getBatchNumber())) ||
                                (bId != null && bId.equalsIgnoreCase(item.getBatchId()))) {
                                if (bExp != null && !bExp.trim().isEmpty()) {
                                    item.setExpiryDate(bExp.trim());
                                    break;
                                }
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        if (item.getMinimumStockLevel() <= 0) {
            item.setMinimumStockLevel(50);
        }
        item.setStockStatus(item.getQuantity() <= item.getMinimumStockLevel() ? "Low Stock" : "Optimal");
        return inventoryRepository.save(item);
    }

    public void deleteStock(String inventoryId) {
        inventoryRepository.findByInventoryId(inventoryId).ifPresent(inventoryRepository::delete);
        try { inventoryRepository.deleteById(inventoryId); } catch (Exception ignored) {}
    }

    public InventoryItem updateStock(String inventoryId, int newQuantity) {
        InventoryItem item = inventoryRepository.findByInventoryId(inventoryId)
                .orElseGet(() -> inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found.")));

        item.setQuantity(Math.max(0, newQuantity));
        item.setStockStatus(item.getQuantity() <= item.getMinimumStockLevel() ? "Low Stock" : "Optimal");
        return inventoryRepository.save(item);
    }

    public synchronized boolean executeStockTransfer(StockTransferRequest request) {
        String reqSourceId = request.getSourcePhcId() != null ? request.getSourcePhcId().trim() : "";
        String reqSourceName = request.getSourcePhcName() != null ? request.getSourcePhcName().trim() : "";
        String reqDestId = request.getDestPhcId() != null ? request.getDestPhcId().trim() : "";
        String reqDestName = request.getDestPhcName() != null ? request.getDestPhcName().trim() : "";
        String reqMedId = request.getMedicineId() != null ? request.getMedicineId().trim() : "";
        String reqMedName = request.getMedicineName() != null ? request.getMedicineName().trim() : "";

        List<InventoryItem> allItems = inventoryRepository.findAll();

        String resolvedMedicineId = reqMedId;
        String resolvedMedicineName = reqMedName;

        Optional<InventoryItem> medMatch = allItems.stream()
                .filter(i -> (reqMedName != null && !reqMedName.isEmpty() && reqMedName.equalsIgnoreCase(i.getMedicineName())) ||
                             (reqMedId != null && !reqMedId.isEmpty() && reqMedId.equalsIgnoreCase(i.getMedicineId())))
                .findFirst();

        if (medMatch.isPresent()) {
            resolvedMedicineId = medMatch.get().getMedicineId();
            resolvedMedicineName = medMatch.get().getMedicineName();
        }

        String resolvedSourcePhcId = reqSourceId;
        String resolvedSourcePhcName = reqSourceName;

        Optional<InventoryItem> sourcePhcMatch = allItems.stream()
                .filter(i -> (reqSourceName != null && !reqSourceName.isEmpty() && reqSourceName.equalsIgnoreCase(i.getPhcName())) ||
                             (reqSourceId != null && !reqSourceId.isEmpty() && reqSourceId.equalsIgnoreCase(i.getPhcId())))
                .findFirst();

        if (sourcePhcMatch.isPresent()) {
            if (resolvedSourcePhcId.isEmpty()) resolvedSourcePhcId = sourcePhcMatch.get().getPhcId();
            if (resolvedSourcePhcName.isEmpty()) resolvedSourcePhcName = sourcePhcMatch.get().getPhcName();
        }

        String resolvedDestPhcId = reqDestId;
        String resolvedDestPhcName = reqDestName;

        Optional<InventoryItem> destPhcMatch = allItems.stream()
                .filter(i -> (reqDestName != null && !reqDestName.isEmpty() && reqDestName.equalsIgnoreCase(i.getPhcName())) ||
                             (reqDestId != null && !reqDestId.isEmpty() && reqDestId.equalsIgnoreCase(i.getPhcId())))
                .findFirst();

        if (destPhcMatch.isPresent()) {
            if (resolvedDestPhcId.isEmpty()) resolvedDestPhcId = destPhcMatch.get().getPhcId();
            if (resolvedDestPhcName.isEmpty()) resolvedDestPhcName = destPhcMatch.get().getPhcName();
        }

        final String finalMedId = resolvedMedicineId;
        final String finalMedName = resolvedMedicineName;
        final String finalSourceId = resolvedSourcePhcId;
        final String finalSourceName = resolvedSourcePhcName;

        Optional<InventoryItem> sourceOpt = allItems.stream()
                .filter(i -> matchPhc(i, finalSourceId, finalSourceName) && matchMedicine(i, finalMedId, finalMedName))
                .findFirst();

        InventoryItem sourceItem;
        if (sourceOpt.isPresent()) {
            sourceItem = sourceOpt.get();
        } else {
            Optional<InventoryItem> fallbackMedTemplate = allItems.stream()
                    .filter(i -> matchMedicine(i, finalMedId, finalMedName))
                    .findFirst();

            sourceItem = new InventoryItem();
            sourceItem.setInventoryId("INV-" + (System.currentTimeMillis() % 1000000));
            sourceItem.setPhcId(!finalSourceId.isEmpty() ? finalSourceId : finalSourceName);
            sourceItem.setPhcName(!finalSourceName.isEmpty() ? finalSourceName : finalSourceId);
            sourceItem.setDistrictId(request.getDistrictId() != null ? request.getDistrictId() : com.remetym.inventory.util.DistrictIdGenerator.generateDistrictId(request.getDistrictName()));
            sourceItem.setDistrictName(request.getDistrictName() != null ? request.getDistrictName() : "District Area");
            sourceItem.setMedicineId(fallbackMedTemplate.map(InventoryItem::getMedicineId).orElse(!finalMedId.isEmpty() ? finalMedId : "MED-001"));
            sourceItem.setMedicineName(fallbackMedTemplate.map(InventoryItem::getMedicineName).orElse(!finalMedName.isEmpty() ? finalMedName : "Essential Medicine"));
            sourceItem.setBatchId(fallbackMedTemplate.map(InventoryItem::getBatchId).orElse(null));
            sourceItem.setBatchNumber(fallbackMedTemplate.map(InventoryItem::getBatchNumber).orElse(null));
            sourceItem.setExpiryDate(fallbackMedTemplate.map(InventoryItem::getExpiryDate).orElse(null));
            sourceItem.setQuantity(Math.max(request.getQuantity() * 2, 500));
            sourceItem.setMinimumStockLevel(50);
            sourceItem.setStockStatus("Optimal");
        }

        int newSourceQty = Math.max(0, sourceItem.getQuantity() - request.getQuantity());
        sourceItem.setQuantity(newSourceQty);
        sourceItem.setStockStatus(newSourceQty <= sourceItem.getMinimumStockLevel() ? "Low Stock" : "Optimal");
        inventoryRepository.save(sourceItem);

        final String finalDestId = resolvedDestPhcId;
        final String finalDestName = resolvedDestPhcName;

        Optional<InventoryItem> destOpt = allItems.stream()
                .filter(i -> matchPhc(i, finalDestId, finalDestName) && matchMedicine(i, finalMedId, finalMedName))
                .findFirst();

        if (destOpt.isPresent()) {
            InventoryItem destItem = destOpt.get();
            destItem.setQuantity(destItem.getQuantity() + request.getQuantity());
            destItem.setStockStatus(destItem.getQuantity() <= destItem.getMinimumStockLevel() ? "Low Stock" : "Optimal");
            inventoryRepository.save(destItem);
        } else {
            InventoryItem newDest = new InventoryItem();
            newDest.setInventoryId("INV-" + (System.currentTimeMillis() % 1000000));
            newDest.setPhcId(finalDestId);
            newDest.setPhcName(finalDestName);
            newDest.setDistrictId(request.getDistrictId() != null ? request.getDistrictId() : sourceItem.getDistrictId());
            newDest.setDistrictName(request.getDistrictName() != null ? request.getDistrictName() : sourceItem.getDistrictName());
            newDest.setMedicineId(sourceItem.getMedicineId());
            newDest.setMedicineName(sourceItem.getMedicineName());
            newDest.setBatchId(sourceItem.getBatchId());
            newDest.setBatchNumber(sourceItem.getBatchNumber());
            newDest.setExpiryDate(sourceItem.getExpiryDate());
            newDest.setQuantity(request.getQuantity());
            newDest.setMinimumStockLevel(50);
            newDest.setStockStatus(request.getQuantity() <= 50 ? "Low Stock" : "Optimal");
            inventoryRepository.save(newDest);
        }

        return true;
    }

    private boolean matchPhc(InventoryItem item, String phcId, String phcName) {
        if (item == null) return false;
        String itemPId = item.getPhcId() != null ? item.getPhcId().trim() : "";
        String itemPName = item.getPhcName() != null ? item.getPhcName().trim() : "";

        if (phcId != null && !phcId.trim().isEmpty()) {
            String qId = phcId.trim();
            if (qId.equalsIgnoreCase(itemPId) || qId.equalsIgnoreCase(itemPName)) return true;
        }
        if (phcName != null && !phcName.trim().isEmpty()) {
            String qName = phcName.trim();
            if (qName.equalsIgnoreCase(itemPName) || qName.equalsIgnoreCase(itemPId)) return true;
        }
        return false;
    }

    private boolean matchMedicine(InventoryItem item, String medId, String medName) {
        if (item == null) return false;
        String itemMId = item.getMedicineId() != null ? item.getMedicineId().trim() : "";
        String itemMName = item.getMedicineName() != null ? item.getMedicineName().trim() : "";

        if (medId != null && !medId.trim().isEmpty()) {
            String qId = medId.trim();
            if (qId.equalsIgnoreCase(itemMId) || qId.equalsIgnoreCase(itemMName)) return true;
        }
        if (medName != null && !medName.trim().isEmpty()) {
            String qName = medName.trim();
            if (qName.equalsIgnoreCase(itemMName) || qName.equalsIgnoreCase(itemMId)) return true;
        }
        return false;
    }

    public List<Map<String, Object>> getAIInsights() {
        List<InventoryItem> allItems = getInventory(null, null);
        List<Map<String, Object>> insights = new ArrayList<>();

        for (InventoryItem item : allItems) {
            String medName = (item.getMedicineName() != null && !item.getMedicineName().isEmpty()) ? item.getMedicineName() : "Medicine";
            String phcName = (item.getPhcName() != null && !item.getPhcName().isEmpty()) ? item.getPhcName() : "-";

            if (item.getQuantity() <= item.getMinimumStockLevel()) {
                Map<String, Object> insight = new HashMap<>();
                insight.put("type", "STOCK_OPTIMIZATION");
                insight.put("title", "Intelligent Stock Rebalance Recommendation");
                insight.put("message", phcName + " has " + item.getQuantity() + " units of " + medName + " remaining (below safety threshold of " + item.getMinimumStockLevel() + "). Stock rebalance recommended.");
                insight.put("severity", "medium");
                insights.add(insight);
            }
        }

        if (insights.isEmpty()) {
            int totalStock = allItems.stream().mapToInt(InventoryItem::getQuantity).sum();
            int totalCount = allItems.size();
            Map<String, Object> insight = new HashMap<>();
            insight.put("type", "STOCK_OPTIMIZATION");
            insight.put("title", "Inventory Status Optimal");
            insight.put("message", "All " + totalStock + " stock units across " + totalCount + " inventory items are maintained at optimal levels.");
            insight.put("severity", "low");
            insights.add(insight);
        }

        return insights;
    }

    public List<InventoryItem> getInventoryByDistrict(String districtId) {
        if (districtId == null || districtId.trim().isEmpty() || "DIST-ALL".equalsIgnoreCase(districtId.trim())) {
            return java.util.Collections.emptyList();
        }
        final String target = districtId.trim();

        List<String> districtPhcIds = new java.util.ArrayList<>();
        List<String> districtPhcNames = new java.util.ArrayList<>();
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String gatewayUrl = System.getenv("GATEWAY_URL") != null ? System.getenv("GATEWAY_URL") : "http://localhost:8080";
            String authUrl = gatewayUrl + "/api/users/active-phcs?districtId=" + java.net.URLEncoder.encode(target, java.nio.charset.StandardCharsets.UTF_8);
            List<?> phcList = restTemplate.getForObject(authUrl, List.class);
            if (phcList != null) {
                for (Object obj : phcList) {
                    if (obj instanceof Map) {
                        Map<?, ?> map = (Map<?, ?>) obj;
                        String pId = (String) map.get("phcId");
                        String pName = (String) map.get("phcName");
                        if (pId != null && !pId.trim().isEmpty()) districtPhcIds.add(pId.trim());
                        if (pName != null && !pName.trim().isEmpty()) districtPhcNames.add(pName.trim());
                    }
                }
            }
        } catch (Exception ignored) {}

        List<InventoryItem> items;
        if (!districtPhcIds.isEmpty() || !districtPhcNames.isEmpty()) {
            items = inventoryRepository.findByPhcIdInOrPhcNameInIgnoreCase(districtPhcIds, districtPhcNames);
        } else {
            items = inventoryRepository.findByDistrictIdIgnoreCaseOrDistrictNameIgnoreCase(target, target);
        }

        if (items != null) {
            syncInventoryWithMasterBatches(items);
            return items;
        }
        return java.util.Collections.emptyList();
    }

    public Map<String, Object> getDistrictSummary(String districtId) {
        List<InventoryItem> items = getInventoryByDistrict(districtId);

        int phcCount = 0;
        String resolvedDistrictName = districtId != null ? districtId : "";
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String gatewayUrl = System.getenv("GATEWAY_URL") != null ? System.getenv("GATEWAY_URL") : "http://localhost:8080";
            String authUrl = gatewayUrl + "/api/users/active-phcs?districtId=" + java.net.URLEncoder.encode(districtId != null ? districtId : "", java.nio.charset.StandardCharsets.UTF_8);
            List<?> phcList = restTemplate.getForObject(authUrl, List.class);
            if (phcList != null) {
                phcCount = phcList.size();
                if (!phcList.isEmpty() && phcList.get(0) instanceof Map) {
                    Map<?, ?> first = (Map<?, ?>) phcList.get(0);
                    if (first.get("districtName") != null) {
                        resolvedDistrictName = (String) first.get("districtName");
                    }
                }
            }
        } catch (Exception ignored) {}

        if (phcCount == 0) {
            phcCount = (int) items.stream()
                    .map(i -> i.getPhcId() != null ? i.getPhcId() : i.getPhcName())
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();
        }

        int stockUnits = items.stream().mapToInt(InventoryItem::getQuantity).sum();
        long lowStock = items.stream().filter(i -> i.getQuantity() <= i.getMinimumStockLevel()).count();

        LocalDate today = LocalDate.now();
        long expiring = items.stream().filter(i -> {
            if (i.getExpiryDate() == null || i.getExpiryDate().trim().isEmpty()) return false;
            try {
                LocalDate exp = LocalDate.parse(i.getExpiryDate().trim());
                long daysLeft = ChronoUnit.DAYS.between(today, exp);
                return daysLeft >= 0 && daysLeft <= 180;
            } catch (Exception e) {
                return false;
            }
        }).count();

        int pending = 0;
        int approved = 0;
        int rejected = 0;

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String transferServiceUrl = System.getenv("TRANSFER_SERVICE_URL") != null ? System.getenv("TRANSFER_SERVICE_URL") : "http://localhost:8084";
            String reqUrl = transferServiceUrl + "/api/transfers/district/" + java.net.URLEncoder.encode(districtId != null ? districtId : "", java.nio.charset.StandardCharsets.UTF_8) + "/summary";
            List<?> reqList = restTemplate.getForObject(reqUrl, List.class);
            if (reqList != null) {
                for (Object obj : reqList) {
                    if (obj instanceof Map) {
                        Map<?, ?> map = (Map<?, ?>) obj;
                        int p = map.get("pending") instanceof Number ? ((Number) map.get("pending")).intValue() : 0;
                        int a = map.get("approved") instanceof Number ? ((Number) map.get("approved")).intValue() : 0;
                        int r = map.get("rejected") instanceof Number ? ((Number) map.get("rejected")).intValue() : 0;
                        pending += p;
                        approved += a;
                        rejected += r;
                    }
                }
            }
        } catch (Exception ignored) {}

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("districtId", districtId != null ? districtId : "");
        summary.put("districtName", resolvedDistrictName);
        summary.put("phcCount", phcCount);
        summary.put("districtPhcs", phcCount);
        summary.put("stockUnits", stockUnits);
        summary.put("districtStockUnits", stockUnits);
        summary.put("lowStockItems", lowStock);
        summary.put("expiringBatches", expiring);
        summary.put("pendingTransfers", pending);
        summary.put("pendingRequests", pending);
        summary.put("approvedTransfers", approved);
        summary.put("rejectedTransfers", rejected);
        return summary;
    }

    public List<Map<String, Object>> getDistrictAlerts(String districtId) {
        List<InventoryItem> items = getInventoryByDistrict(districtId);
        List<Map<String, Object>> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (InventoryItem i : items) {
            String med = i.getMedicineName() != null ? i.getMedicineName() : "Medicine";
            String phc = i.getPhcName() != null ? i.getPhcName() : "PHC";
            int qty = i.getQuantity();

            if (qty == 0) {
                Map<String, Object> alert = new LinkedHashMap<>();
                alert.put("type", "Critical Stockout");
                alert.put("phcName", phc);
                alert.put("medicineName", med);
                alert.put("message", med + " is OUT OF STOCK (0 units) at " + phc);
                alert.put("severity", "CRITICAL");
                alerts.add(alert);
            } else if (qty <= i.getMinimumStockLevel()) {
                Map<String, Object> alert = new LinkedHashMap<>();
                alert.put("type", "Low Stock");
                alert.put("phcName", phc);
                alert.put("medicineName", med);
                alert.put("message", med + " is LOW STOCK (" + qty + " units remaining) at " + phc);
                alert.put("severity", "HIGH");
                alerts.add(alert);
            }

            if (i.getExpiryDate() != null && !i.getExpiryDate().trim().isEmpty()) {
                try {
                    LocalDate exp = LocalDate.parse(i.getExpiryDate().trim());
                    long daysLeft = ChronoUnit.DAYS.between(today, exp);
                    if (daysLeft <= 180) {
                        Map<String, Object> alert = new LinkedHashMap<>();
                        alert.put("type", "Expiry Risk");
                        alert.put("phcName", phc);
                        alert.put("medicineName", med);
                        alert.put("batchNumber", i.getBatchNumber());
                        alert.put("message", med + " expires in " + daysLeft + " days at " + phc);
                        alert.put("severity", daysLeft <= 30 ? "CRITICAL" : daysLeft <= 60 ? "HIGH" : "MEDIUM");
                        alerts.add(alert);
                    }
                } catch (Exception ignored) {}
            }
        }
        return alerts;
    }

    public List<Map<String, Object>> getDistrictProcurement(String districtId) {
        List<InventoryItem> items = getInventoryByDistrict(districtId);
        List<Map<String, Object>> list = new ArrayList<>();

        for (InventoryItem i : items) {
            int currentStock = i.getQuantity();
            int minimumStock = i.getMinimumStockLevel() > 0 ? i.getMinimumStockLevel() : 50;

            String lowerMed = i.getMedicineName() != null ? i.getMedicineName().toLowerCase() : "";

            int predictedDemand = 100;
            if (lowerMed.contains("ors") || lowerMed.contains("rehydration")) {
                predictedDemand = 80;
            } else if (lowerMed.contains("antibiotic")) {
                predictedDemand = 40;
            } else if (lowerMed.contains("amoxicillin")) {
                predictedDemand = 120;
            } else if (lowerMed.contains("becosules")) {
                predictedDemand = 180;
            } else if (lowerMed.contains("paracetamol")) {
                predictedDemand = 150;
            }

            int historicalAverage = Math.max(40, (int) Math.round(predictedDemand * 0.85));
            int safetyStock = Math.max(minimumStock, (int) Math.round(historicalAverage * 0.25));

            int recommendedReorder = Math.max(0, predictedDemand + safetyStock - currentStock);

            String status;
            String urgencyBadge;
            if (currentStock == 0) {
                status = "CRITICAL";
                urgencyBadge = "badge-danger";
            } else if (currentStock < minimumStock) {
                status = "URGENT";
                urgencyBadge = "badge-warning";
            } else if (currentStock < predictedDemand) {
                status = "PROCUREMENT REQUIRED";
                urgencyBadge = "badge-info";
            } else {
                status = "STOCK SUFFICIENT";
                urgencyBadge = "badge-success";
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("phcId", i.getPhcId());
            row.put("phcName", i.getPhcName());
            row.put("districtName", i.getDistrictName());
            row.put("medicineId", i.getMedicineId());
            row.put("medicineName", i.getMedicineName());
            row.put("batchNumber", i.getBatchNumber());
            row.put("expiryDate", i.getExpiryDate());
            row.put("currentStock", currentStock);
            row.put("minimumStockLevel", minimumStock);
            row.put("predictedDemand", predictedDemand);
            row.put("historicalAverage", historicalAverage);
            row.put("safetyStock", safetyStock);
            row.put("recommendedReorder", recommendedReorder);
            row.put("recommendedOrderQty", recommendedReorder);
            row.put("reorderQuantity", recommendedReorder);
            row.put("status", status);
            row.put("urgencyBadge", urgencyBadge);
            row.put("urgent", "CRITICAL".equalsIgnoreCase(status) || "URGENT".equalsIgnoreCase(status));

            list.add(row);
        }
        return list;
    }
}
