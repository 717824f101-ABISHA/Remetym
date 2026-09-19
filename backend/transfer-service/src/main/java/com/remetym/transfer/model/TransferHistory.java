package com.remetym.transfer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transfer_history")
public class TransferHistory {
    @Id
    private String id;

    @Indexed(unique = true)
    private String transferId;

    @Indexed
    private String requestId;

    @Indexed
    private String medicineId;

    @Indexed
    private String medicineName;

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

    private int quantity;
    private String requestedBy;
    private String approvedBy;
    private String requestDate;
    private String approvalDate;
    private String completionDate;

    @Indexed
    private String status; // COMPLETED

    public TransferHistory() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTransferId() { return transferId; }
    public void setTransferId(String transferId) { this.transferId = transferId; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

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

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }

    public String getApprovalDate() { return approvalDate; }
    public void setApprovalDate(String approvalDate) { this.approvalDate = approvalDate; }

    public String getCompletionDate() { return completionDate; }
    public void setCompletionDate(String completionDate) { this.completionDate = completionDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
