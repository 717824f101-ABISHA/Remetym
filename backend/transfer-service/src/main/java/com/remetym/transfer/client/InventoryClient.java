package com.remetym.transfer.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class InventoryClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.inventory.url:http://localhost:8083/api/inventory}")
    private String inventoryServiceUrl;

    public boolean executeStockTransfer(String sourcePhcId, String sourcePhcName, String destPhcId, String destPhcName,
                                         String districtId, String districtName, String medicineId,
                                         String medicineName, int quantity) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("sourcePhcId", sourcePhcId);
            payload.put("sourcePhcName", sourcePhcName);
            payload.put("destPhcId", destPhcId);
            payload.put("destPhcName", destPhcName);
            payload.put("districtId", districtId);
            payload.put("districtName", districtName);
            payload.put("medicineId", medicineId);
            payload.put("medicineName", medicineName);
            payload.put("quantity", quantity);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(inventoryServiceUrl + "/transfer", entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                return Boolean.TRUE.equals(success);
            }
            return false;
        } catch (Exception e) {
            System.err.println("[TRANSFER-SERVICE -> INVENTORY-SERVICE REST CALL ERROR]: " + e.getMessage());
            throw new RuntimeException("Stock transfer failed in Inventory Service: " + e.getMessage());
        }
    }
}
