package com.remetym.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "REGISTRATION_REQUESTS")
public class RegistrationRequest {
    @Id
    @Column(name = "ID", nullable = false)
    private String id;

    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "FULL_NAME")
    private String fullName;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "ROLE")
    private String role;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "DISTRICT_NAME")
    private String districtName;

    @Column(name = "DISTRICT_ID")
    private String districtId;

    @Column(name = "DHO_ID")
    private String dhoId;

    @Column(name = "PHC_NAME")
    private String phcName;

    @Column(name = "PHC_ID")
    private String phcId;

    @Column(name = "EMPLOYEE_ID")
    private String employeeId;

    @Column(name = "STATUS")
    private String status; // PENDING, ACTIVE, REJECTED

    @Column(name = "REGISTERED_AT")
    private String registeredAt;

    @Column(name = "APPROVED_AT")
    private String approvedAt;

    @Column(name = "APPROVED_BY")
    private String approvedBy;

    @Column(name = "REJECTED_AT")
    private String rejectedAt;

    @Column(name = "REJECTED_BY")
    private String rejectedBy;

    @Column(name = "REJECTION_REASON")
    private String rejectionReason;

    public RegistrationRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDhoId() { return dhoId; }
    public void setDhoId(String dhoId) { this.dhoId = dhoId; }

    public String getPhcName() { return phcName; }
    public void setPhcName(String phcName) { this.phcName = phcName; }

    public String getPhcId() { return phcId; }
    public void setPhcId(String phcId) { this.phcId = phcId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(String rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
