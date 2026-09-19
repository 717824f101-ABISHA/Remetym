package com.remetym.medicine.service;

import com.remetym.medicine.model.Phc;
import com.remetym.medicine.repository.PhcRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PhcService {

    @Autowired
    private PhcRepository phcRepository;

    public List<Phc> getAllPhcs() {
        return phcRepository.findAll();
    }

    public Phc getPhcById(String phcId) {
        return phcRepository.findByPhcId(phcId)
                .orElseGet(() -> phcRepository.findById(phcId).orElse(null));
    }

    public Phc findOrCreatePhc(String phcName) {
        if (phcName == null || phcName.trim().isEmpty()) {
            return null;
        }
        String cleanName = phcName.trim();
        Optional<Phc> existingOpt = phcRepository.findByPhcNameIgnoreCase(cleanName);
        if (existingOpt.isPresent()) {
            return existingOpt.get();
        }

        Phc newPhc = new Phc();
        newPhc.setPhcId("PHC-" + String.format("%03d", phcRepository.count() + 1));
        newPhc.setPhcName(cleanName);
        newPhc.setCreatedDate(LocalDate.now().toString());
        return phcRepository.save(newPhc);
    }

    public Phc addPhc(Phc phc) {
        if (phc.getPhcName() == null || phc.getPhcName().trim().isEmpty()) {
            throw new IllegalArgumentException("PHC Name is required.");
        }
        Optional<Phc> existing = phcRepository.findByPhcNameIgnoreCase(phc.getPhcName().trim());
        if (existing.isPresent()) {
            return existing.get();
        }
        if (phc.getPhcId() == null || phc.getPhcId().isEmpty()) {
            phc.setPhcId("PHC-" + String.format("%03d", phcRepository.count() + 1));
        }
        if (phc.getCreatedDate() == null) {
            phc.setCreatedDate(LocalDate.now().toString());
        }
        return phcRepository.save(phc);
    }
}
