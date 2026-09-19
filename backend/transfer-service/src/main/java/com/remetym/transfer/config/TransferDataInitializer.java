package com.remetym.transfer.config;

import com.remetym.transfer.repository.TransferRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TransferDataInitializer implements CommandLineRunner {

    @Autowired
    private TransferRequestRepository requestRepository;

    @Override
    public void run(String... args) throws Exception {
        // No dummy/sample transfer requests auto-seeded.
        // Transfer requests are loaded exclusively from real user submissions stored in MongoDB.
        System.out.println("[TRANSFER-SERVICE] Real data mode active. Zero dummy requests initialized.");
    }
}
