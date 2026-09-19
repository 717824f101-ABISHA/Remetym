package com.remetym.inventory.dto;

public class StockTransferRequest {
    private String sourcePhcId;
    private String sourcePhcName;
    private String destPhcId;
    private String destPhcName;
    private String districtId;
    private String districtName;
    private String medicineId;
    private String medicineName;
    private int quantity;

    public StockTransferRequest() {}

    public String getSourcePhcId() { return sourcePhcId; }
    public void setSourcePhcId(String sourcePhcId) { this.sourcePhcId = sourcePhcId; }

    public String getSourcePhcName() { return sourcePhcName; }
    public void setSourcePhcName(String sourcePhcName) { this.sourcePhcName = sourcePhcName; }

    public String getDestPhcId() { return destPhcId; }
    public void setDestPhcId(String destPhcId) { this.destPhcId = destPhcId; }

    public String getDestPhcName() { return destPhcName; }
    public void setDestPhcName(String destPhcName) { this.destPhcName = destPhcName; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
