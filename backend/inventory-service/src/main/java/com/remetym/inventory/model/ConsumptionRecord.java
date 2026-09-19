package com.remetym.inventory.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "consumption_history")
public class ConsumptionRecord {
    @Id
    private String id;
    private String consumptionId;
    private String medicineId;
    private String medicineName;
    private String phcId;
    private String phcName;
    private String batchNumber;
    private int quantityConsumed;
    private String date;
    private String createdAt;

    public ConsumptionRecord() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getConsumptionId() { return consumptionId; }
    public void setConsumptionId(String consumptionId) { this.consumptionId = consumptionId; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getPhcId() { return phcId; }
    public void setPhcId(String phcId) { this.phcId = phcId; }

    public String getPhcName() { return phcName; }
    public void setPhcName(String phcName) { this.phcName = phcName; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public int getQuantityConsumed() { return quantityConsumed; }
    public void setQuantityConsumed(int quantityConsumed) { this.quantityConsumed = quantityConsumed; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
