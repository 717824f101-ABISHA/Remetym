package com.remetym.transfer.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.notification.url:http://localhost:8085/api/notifications}")
    private String notificationServiceUrl;

    public void sendNotification(String targetRole, String targetUserId, String targetDistrictId,
                                 String targetPhcId, String title, String message, String type, String link) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("targetRole", targetRole);
            payload.put("targetUserId", targetUserId);
            payload.put("targetDistrictId", targetDistrictId);
            payload.put("targetPhcId", targetPhcId);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", type);
            payload.put("link", link);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(notificationServiceUrl, entity, Map.class);
        } catch (Exception e) {
            System.err.println("[TRANSFER-SERVICE -> NOTIFICATION-SERVICE REST CALL WARNING]: " + e.getMessage());
        }
    }
}
