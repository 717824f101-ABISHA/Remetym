package com.remetym.transfer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transfer_requests")
public class TransferRequest {
    @Id
    private String id;

    @Indexed(unique = true)
    private String requestId;

    @Indexed
    private String medicineId;

    @Indexed
    private String medicineName;

    @Indexed
    private String batchId;

    @Indexed
    private String batchNumber;

    @Indexed
    private String sourcePhcId;

    @Indexed
    private String sourcePhcName;

    @Indexed
    private String destPhcId;

    @Indexed
    private String destPhcName;

    @Indexed
    private String districtId;

    @Indexed
    private String districtName;

    private String sourceDistrictId;
    private String sourceDistrictName;
    private String destDistrictId;
    private String destDistrictName;

    private int quantity;
    private String reason;

    @Indexed
    private String status; // PENDING, APPROVED, REJECTED
    private String requestedBy;
    private String requestedByUserId;
    private String requestDate;
    private int availableSourceStock;
    private String approvedBy;
    private String decisionDate;
    private String remarks;

    public TransferRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

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

    public String getSourceDistrictId() { return sourceDistrictId; }
    public void setSourceDistrictId(String sourceDistrictId) { this.sourceDistrictId = sourceDistrictId; }

    public String getSourceDistrictName() { return sourceDistrictName; }
    public void setSourceDistrictName(String sourceDistrictName) { this.sourceDistrictName = sourceDistrictName; }

    public String getDestDistrictId() { return destDistrictId; }
    public void setDestDistrictId(String destDistrictId) { this.destDistrictId = destDistrictId; }

    public String getDestDistrictName() { return destDistrictName; }
    public void setDestDistrictName(String destDistrictName) { this.destDistrictName = destDistrictName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getRequestedByUserId() { return requestedByUserId; }
    public void setRequestedByUserId(String requestedByUserId) { this.requestedByUserId = requestedByUserId; }

    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }

    public int getAvailableSourceStock() { return availableSourceStock; }
    public void setAvailableSourceStock(int availableSourceStock) { this.availableSourceStock = availableSourceStock; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getDecisionDate() { return decisionDate; }
    public void setDecisionDate(String decisionDate) { this.decisionDate = decisionDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
