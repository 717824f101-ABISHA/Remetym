package com.remetym.medicine.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "batches")
public class Batch {
    @Id
    private String id;

    @Indexed(unique = true)
    private String batchId;

    @Indexed
    private String medicineId;

    @Indexed
    private String medicineName;

    @Indexed
    private String batchNumber;

    private String manufacturingDate;
    private String manufactureDate;
    private String expiryDate;
    private int initialQuantity;
    private String qualityStatus;
    private String sourcePhcId;

    @Indexed
    private String sourcePhcName;

    private String destinationPhcId;

    @Indexed
    private String destinationPhcName;

    private String phcEmail;

    @Indexed
    private String status; // PENDING, APPROVED, REJECTED

    private String rejectionReason;
    private String approvedBy;

    public Batch() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getManufacturingDate() {
        return manufacturingDate != null ? manufacturingDate : manufactureDate;
    }
    public void setManufacturingDate(String manufacturingDate) {
        this.manufacturingDate = manufacturingDate;
        this.manufactureDate = manufacturingDate;
    }

    public String getManufactureDate() {
        return manufactureDate != null ? manufactureDate : manufacturingDate;
    }
    public void setManufactureDate(String manufactureDate) {
        this.manufactureDate = manufactureDate;
        this.manufacturingDate = manufactureDate;
    }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public int getInitialQuantity() { return initialQuantity; }
    public void setInitialQuantity(int initialQuantity) { this.initialQuantity = initialQuantity; }

    public String getQualityStatus() { return qualityStatus; }
    public void setQualityStatus(String qualityStatus) { this.qualityStatus = qualityStatus; }

    public String getSourcePhcId() { return sourcePhcId; }
    public void setSourcePhcId(String sourcePhcId) { this.sourcePhcId = sourcePhcId; }

    public String getSourcePhcName() { return sourcePhcName; }
    public void setSourcePhcName(String sourcePhcName) { this.sourcePhcName = sourcePhcName; }

    public String getDestinationPhcId() { return destinationPhcId; }
    public void setDestinationPhcId(String destinationPhcId) { this.destinationPhcId = destinationPhcId; }

    public String getDestinationPhcName() { return destinationPhcName; }
    public void setDestinationPhcName(String destinationPhcName) { this.destinationPhcName = destinationPhcName; }

    public String getPhcEmail() { return phcEmail; }
    public void setPhcEmail(String phcEmail) { this.phcEmail = phcEmail; }

    public String getStatus() { return status != null ? status : "PENDING"; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
}
