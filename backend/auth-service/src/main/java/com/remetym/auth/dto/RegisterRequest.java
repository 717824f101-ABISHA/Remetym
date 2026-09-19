package com.remetym.auth.dto;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role;
    private String districtName;
    private String district;
    private String dhoId;
    private String phcName;
    private String phcId;

    public RegisterRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getDhoId() { return dhoId; }
    public void setDhoId(String dhoId) { this.dhoId = dhoId; }

    public String getPhcName() { return phcName; }
    public void setPhcName(String phcName) { this.phcName = phcName; }

    public String getPhcId() { return phcId; }
    public void setPhcId(String phcId) { this.phcId = phcId; }
}
