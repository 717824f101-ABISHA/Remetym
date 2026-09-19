package com.remetym.notification.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class DistrictIdGenerator {

    public static String generateDistrictId(String districtName) {
        if (districtName == null || districtName.trim().isEmpty()) {
            return "DIST-000000";
        }

        String normalized = districtName
                .trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9 ]", "")
                .replaceAll("\\s+", " ");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02X", b));
            }

            return "DIST-" + hex.substring(0, 6);

        } catch (Exception e) {
            throw new RuntimeException("Unable to generate district ID", e);
        }
    }
}
