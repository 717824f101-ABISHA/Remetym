package com.remetym.notification.service;

import com.remetym.notification.model.NotificationItem;
import com.remetym.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<NotificationItem> getNotifications(String userRole, String userId, String districtId, String phcId) {
        List<NotificationItem> all = notificationRepository.findAll();

        if (userRole == null || userRole.isEmpty() || "ADMIN".equalsIgnoreCase(userRole)) {
            return all;
        }

        return all.stream().filter(n -> {
            if ("DHO".equalsIgnoreCase(userRole)) {
                return "DHO".equalsIgnoreCase(n.getTargetRole()) &&
                        (n.getTargetDistrictId() == null || n.getTargetDistrictId().equals(districtId));
            }
            if ("PHC_STAFF".equalsIgnoreCase(userRole)) {
                return "PHC_STAFF".equalsIgnoreCase(n.getTargetRole()) &&
                        ((n.getTargetUserId() != null && n.getTargetUserId().equals(userId)) ||
                         (n.getTargetPhcId() != null && n.getTargetPhcId().equals(phcId)));
            }
            return false;
        }).collect(Collectors.toList());
    }

    public NotificationItem createNotification(NotificationItem item) {
        if (item.getNotificationId() == null || item.getNotificationId().isEmpty()) {
            item.setNotificationId("NOTIF-" + (System.currentTimeMillis() % 1000000));
        }
        if (item.getTimestamp() == null) {
            item.setTimestamp(Instant.now().toString());
        }
        return notificationRepository.save(item);
    }

    public NotificationItem markAsRead(String id) {
        NotificationItem item = notificationRepository.findByNotificationId(id)
                .orElseGet(() -> notificationRepository.findById(id).orElse(null));

        if (item != null) {
            item.setRead(true);
            return notificationRepository.save(item);
        }
        return null;
    }

    public void markAllAsRead(String userRole, String userId, String districtId, String phcId) {
        List<NotificationItem> items = getNotifications(userRole, userId, districtId, phcId);
        items.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(items);
    }

    public void clearNotifications(String userRole, String userId, String districtId, String phcId) {
        List<NotificationItem> items = getNotifications(userRole, userId, districtId, phcId);
        if (!items.isEmpty()) {
            notificationRepository.deleteAll(items);
        }
    }
}
