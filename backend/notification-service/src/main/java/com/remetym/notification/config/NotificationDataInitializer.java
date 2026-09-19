package com.remetym.notification.config;

import com.remetym.notification.model.NotificationItem;
import com.remetym.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class NotificationDataInitializer implements CommandLineRunner {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (notificationRepository.count() == 0) {
            NotificationItem n1 = new NotificationItem();
            n1.setNotificationId("NOTIF-100001");
            n1.setTargetRole("ADMIN");
            n1.setTitle("System Initialized");
            n1.setMessage("RemeTym Spring Boot Microservices Architecture successfully started.");
            n1.setTimestamp(Instant.now().toString());
            n1.setRead(false);
            n1.setType("INFO");
            n1.setLink("/admin/dashboard");
            notificationRepository.save(n1);

            NotificationItem n2 = new NotificationItem();
            n2.setNotificationId("NOTIF-100002");
            n2.setTargetRole("DHO");
            n2.setTargetDistrictId(com.remetym.notification.util.DistrictIdGenerator.generateDistrictId("Theni"));
            n2.setTitle("Stock Alert");
            n2.setMessage("Low stock detected for Antibiotic Capsule 250mg at Health Center Alpha.");
            n2.setTimestamp(Instant.now().toString());
            n2.setRead(false);
            n2.setType("WARNING");
            n2.setLink("/dho/inventory");
            notificationRepository.save(n2);

            System.out.println("[NOTIFICATION-SERVICE] Pre-seeded initial notifications.");
        }
    }
}
