package com.remetym.notification.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "email_logs")
public class EmailLog {
    @Id
    private String id;
    private String emailId;
    private String to;
    private String recipientName;
    private String subject;
    private String body;
    private String sentAt;
    private String type; // ACCOUNT_APPROVED, ACCOUNT_REJECTED, LOW_STOCK_ALERT

    public EmailLog() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmailId() { return emailId; }
    public void setEmailId(String emailId) { this.emailId = emailId; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getSentAt() { return sentAt; }
    public void setSentAt(String sentAt) { this.sentAt = sentAt; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
