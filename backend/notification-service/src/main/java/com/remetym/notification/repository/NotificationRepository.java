package com.remetym.notification.repository;

import com.remetym.notification.model.NotificationItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationItem, String> {
    Optional<NotificationItem> findByNotificationId(String notificationId);
    List<NotificationItem> findByTargetRole(String targetRole);
}
