package com.remetym.notification.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class NotificationItem {
    @Id
    private String id;
    private String notificationId;
    private String targetRole; // ADMIN, DHO, PHC_STAFF
    private String targetUserId;
    private String targetDistrictId;
    private String targetPhcId;
    private String title;
    private String message;
    private String timestamp;
    private boolean read;
    private String type; // INFO, WARNING, DANGER, SUCCESS, TRANSFER_REQUEST, APPROVAL
    private String link;

    public NotificationItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNotificationId() { return notificationId; }
    public void setNotificationId(String notificationId) { this.notificationId = notificationId; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getTargetUserId() { return targetUserId; }
    public void setTargetUserId(String targetUserId) { this.targetUserId = targetUserId; }

    public String getTargetDistrictId() { return targetDistrictId; }
    public void setTargetDistrictId(String targetDistrictId) { this.targetDistrictId = targetDistrictId; }

    public String getTargetPhcId() { return targetPhcId; }
    public void setTargetPhcId(String targetPhcId) { this.targetPhcId = targetPhcId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
