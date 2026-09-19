package com.remetym.medicine.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "medicines")
public class Medicine {
    @Id
    private String id;

    @Indexed(unique = true)
    private String medicineId;

    @Indexed
    private String medicineName;

    private String genericName;
    private String category;
    private String manufacturer;
    private String unitPrice;
    private String dosageForm;
    private String storageCondition;
    private String createdDate;
    private String strength;
    private String description;

    public Medicine() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getUnitPrice() { return unitPrice; }
    public void setUnitPrice(String unitPrice) { this.unitPrice = unitPrice; }

    public String getDosageForm() { return dosageForm; }
    public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

    public String getStorageCondition() { return storageCondition; }
    public void setStorageCondition(String storageCondition) { this.storageCondition = storageCondition; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
