package com.remetym.inventory.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "inventory")
public class InventoryItem {
    @Id
    private String id;

    @Indexed(unique = true)
    private String inventoryId;

    @Indexed
    private String phcId;

    @Indexed
    private String phcName;

    @Indexed
    private String districtId;

    private String districtName;

    @Indexed
    private String medicineId;

    @Indexed
    private String medicineName;

    @Indexed
    private String batchId;

    @Indexed
    private String batchNumber;

    private String expiryDate;
    private int quantity;
    private int minimumStockLevel;

    @Indexed
    private String stockStatus; // Low Stock, Optimal

    public InventoryItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInventoryId() { return inventoryId; }
    public void setInventoryId(String inventoryId) { this.inventoryId = inventoryId; }

    public String getPhcId() { return phcId; }
    public void setPhcId(String phcId) { this.phcId = phcId; }

    public String getPhcName() { return phcName; }
    public void setPhcName(String phcName) { this.phcName = phcName; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getMinimumStockLevel() { return minimumStockLevel; }
    public void setMinimumStockLevel(int minimumStockLevel) { this.minimumStockLevel = minimumStockLevel; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }
}
