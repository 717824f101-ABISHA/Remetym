package com.remetym.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "PASSWORD_RESET_TOKENS")
public class PasswordResetToken {
    @Id
    @Column(name = "ID", nullable = false)
    private String id;

    @Column(name = "TOKEN", nullable = false, unique = true)
    private String token;

    @Column(name = "USER_EMAIL", nullable = false)
    private String userEmail;

    @Column(name = "EXPIRY_DATE", nullable = false)
    private long expiryDate;

    @Column(name = "USED", nullable = false)
    private boolean used;

    public PasswordResetToken() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public long getExpiryDate() { return expiryDate; }
    public void setExpiryDate(long expiryDate) { this.expiryDate = expiryDate; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
