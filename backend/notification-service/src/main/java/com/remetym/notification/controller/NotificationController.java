package com.remetym.notification.controller;

import com.remetym.notification.model.NotificationItem;
import com.remetym.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationItem>> getNotifications(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        return ResponseEntity.ok(notificationService.getNotifications(role, userId, districtId, phcId));
    }

    @PostMapping
    public ResponseEntity<NotificationItem> createNotification(@RequestBody NotificationItem item) {
        return ResponseEntity.ok(notificationService.createNotification(item));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") String id) {
        NotificationItem updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        notificationService.markAllAsRead(role, userId, districtId, phcId);
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read."));
    }

    @DeleteMapping
    public ResponseEntity<?> clearNotificationsDelete(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        notificationService.clearNotifications(role, userId, districtId, phcId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Notifications cleared successfully"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearNotificationsDeleteSubpath(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        notificationService.clearNotifications(role, userId, districtId, phcId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Notifications cleared successfully"));
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearNotificationsPostSubpath(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        notificationService.clearNotifications(role, userId, districtId, phcId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Notifications cleared successfully"));
    }
}
