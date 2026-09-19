package com.remetym.medicine.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "phcs")
public class Phc {
    @Id
    private String id;

    @Indexed(unique = true)
    private String phcId;

    @Indexed
    private String phcName;

    @Indexed
    private String districtId;

    private String districtName;
    private String email;
    private String createdDate;

    public Phc() {}

    public Phc(String phcId, String phcName) {
        this.phcId = phcId;
        this.phcName = phcName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPhcId() { return phcId; }
    public void setPhcId(String phcId) { this.phcId = phcId; }

    public String getPhcName() { return phcName; }
    public void setPhcName(String phcName) { this.phcName = phcName; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }
}
