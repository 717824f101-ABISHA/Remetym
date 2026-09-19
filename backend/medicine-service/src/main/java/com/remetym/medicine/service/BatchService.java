package com.remetym.medicine.service;

import com.remetym.medicine.model.Batch;
import com.remetym.medicine.model.Medicine;
import com.remetym.medicine.model.Phc;
import com.remetym.medicine.repository.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BatchService {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private PhcService phcService;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:abishasenthil06@gmail.com}")
    private String senderEmail;

    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    public Optional<Batch> getBatchById(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Optional.empty();
        }
        String clean = identifier.trim();
        return batchRepository.findByBatchId(clean)
                .or(() -> batchRepository.findByBatchNumber(clean))
                .or(() -> batchRepository.findById(clean));
    }

    public Batch addBatch(Batch batch) {
        if (batch.getBatchId() == null || batch.getBatchId().isEmpty()) {
            batch.setBatchId("BAT-" + (System.currentTimeMillis() % 1000000));
        }

        // 1. Find or create Medicine
        if (batch.getMedicineId() != null && !batch.getMedicineId().isEmpty()) {
            Medicine med = medicineService.getMedicineById(batch.getMedicineId());
            if (med != null) {
                batch.setMedicineId(med.getMedicineId());
                batch.setMedicineName(med.getMedicineName());
            } else if (batch.getMedicineName() != null && !batch.getMedicineName().isEmpty()) {
                Medicine created = medicineService.findOrCreateMedicine(batch.getMedicineName());
                if (created != null) {
                    batch.setMedicineId(created.getMedicineId());
                    batch.setMedicineName(created.getMedicineName());
                }
            }
        } else if (batch.getMedicineName() != null && !batch.getMedicineName().isEmpty()) {
            Medicine created = medicineService.findOrCreateMedicine(batch.getMedicineName());
            if (created != null) {
                batch.setMedicineId(created.getMedicineId());
                batch.setMedicineName(created.getMedicineName());
            }
        }

        // 2. Find or create Source PHC
        if (batch.getSourcePhcName() != null && !batch.getSourcePhcName().trim().isEmpty()) {
            Phc source = phcService.findOrCreatePhc(batch.getSourcePhcName());
            if (source != null) {
                batch.setSourcePhcId(source.getPhcId());
                batch.setSourcePhcName(source.getPhcName());
                if (batch.getPhcEmail() == null && source.getEmail() != null) {
                    batch.setPhcEmail(source.getEmail());
                }
            }
        }

        // 3. Find or create Destination PHC
        if (batch.getDestinationPhcName() != null && !batch.getDestinationPhcName().trim().isEmpty()) {
            Phc dest = phcService.findOrCreatePhc(batch.getDestinationPhcName());
            if (dest != null) {
                batch.setDestinationPhcId(dest.getPhcId());
                batch.setDestinationPhcName(dest.getPhcName());
                if (batch.getPhcEmail() == null && dest.getEmail() != null) {
                    batch.setPhcEmail(dest.getEmail());
                }
            }
        }

        if (batch.getPhcEmail() == null || batch.getPhcEmail().isEmpty()) {
            batch.setPhcEmail("abishasenthil06@gmail.com");
        }

        if (batch.getQualityStatus() == null || batch.getQualityStatus().isEmpty()) {
            batch.setQualityStatus("Passed");
        }

        if (batch.getStatus() == null || batch.getStatus().isEmpty()) {
            batch.setStatus("PENDING");
        }

        return batchRepository.save(batch);
    }

    public Batch approveBatch(String batchId, String approvedBy, String reason) {
        Batch batch = getBatchById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found with identifier: " + batchId));

        batch.setStatus("APPROVED");
        batch.setApprovedBy(approvedBy != null ? approvedBy : "Admin");
        Batch savedBatch = batchRepository.save(batch);

        // Dispatch JavaMailSender email notification
        sendBatchStatusEmail(savedBatch, "APPROVED", reason);

        return savedBatch;
    }

    public Batch rejectBatch(String batchId, String reason) {
        Batch batch = getBatchById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found with identifier: " + batchId));

        batch.setStatus("REJECTED");
        batch.setRejectionReason(reason != null ? reason : "Rejected by administrator");
        Batch savedBatch = batchRepository.save(batch);

        // Dispatch JavaMailSender email notification
        sendBatchStatusEmail(savedBatch, "REJECTED", reason);

        return savedBatch;
    }

    private void sendBatchStatusEmail(Batch batch, String status, String reason) {
        String recipientEmail = batch.getPhcEmail();
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            recipientEmail = "abishasenthil06@gmail.com";
        }

        String subject = "Pharmaceutical Batch Registration " + status + " - Batch #" + batch.getBatchNumber();
        StringBuilder body = new StringBuilder();
        body.append("Dear Health Center Staff,\n\n");
        body.append("Your registered pharmaceutical batch has been reviewed by the Health Administrator.\n\n");
        body.append("Batch Details:\n");
        body.append("• Batch Number: ").append(batch.getBatchNumber()).append("\n");
        body.append("• Medicine Name: ").append(batch.getMedicineName() != null ? batch.getMedicineName() : "N/A").append("\n");
        body.append("• Source PHC: ").append(batch.getSourcePhcName() != null ? batch.getSourcePhcName() : "-").append("\n");
        body.append("• Destination PHC: ").append(batch.getDestinationPhcName() != null ? batch.getDestinationPhcName() : "-").append("\n");
        body.append("• Approval Status: ").append(status).append("\n");
        if (reason != null && !reason.trim().isEmpty()) {
            body.append("• Decision Remarks / Reason: ").append(reason).append("\n");
        }
        body.append("\nThank you,\nRemeTym Health Administration System");

        System.out.println("[JAVAMAILSENDER DISPATCH] Sender: abishasenthil06@gmail.com | Recipient: " + recipientEmail + " | Status: " + status);

        if (mailSender == null) {
            String err = "JavaMailSender bean is not configured in Spring application context.";
            System.err.println("[JAVAMAILSENDER ERROR] " + err);
            throw new RuntimeException(err);
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("abishasenthil06@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body.toString());
            mailSender.send(message);
            System.out.println("[JAVAMAILSENDER SUCCESS] SMTP Email delivered to " + recipientEmail + " for Batch #" + batch.getBatchNumber());
        } catch (Exception e) {
            String smtpErr = "SMTP Email Delivery Failed to " + recipientEmail + ": " + e.getMessage();
            System.err.println("[JAVAMAILSENDER SMTP ERROR] " + smtpErr);
            throw new RuntimeException(smtpErr, e);
        }
    }
}
