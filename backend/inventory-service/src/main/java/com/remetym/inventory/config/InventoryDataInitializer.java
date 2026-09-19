package com.remetym.inventory.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class InventoryDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        System.out.println("[INVENTORY-SERVICE] Static inventory initialization disabled (production mode).");
    }
}