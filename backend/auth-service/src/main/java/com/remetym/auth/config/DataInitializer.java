package com.remetym.auth.config;

import com.remetym.auth.model.User;
import com.remetym.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
@Autowired
private UserRepository userRepository;

@Autowired
private PasswordEncoder passwordEncoder;

@Override
public void run(String... args) {
    try {
        seedProductionAdmin();
        System.out.println("[AUTH-SERVICE] Production initialization completed successfully.");
    } catch (Exception e) {
        System.err.println("[AUTH-SERVICE] Initialization warning: " + e.getMessage());
    }
}

private void seedProductionAdmin() {
    User admin = userRepository.findByEmailIgnoreCase("nivya1106@gmail.com")
            .orElseGet(User::new);

    admin.setId("admin-main");
    admin.setUserId("admin-main");
    admin.setName("System Administrator");
    admin.setUsername("admin");
    admin.setEmail("nivya1106@gmail.com");
    admin.setPassword(passwordEncoder.encode("Admin@123"));
    admin.setRole("ADMIN");
    admin.setStatus("ACTIVE");
    admin.setTitle("National System Administrator");
    admin.setDistrictId(null);
    admin.setDistrictName(null);
    admin.setPhcId(null);
    admin.setPhcName(null);

    userRepository.save(admin);

    System.out.println("[AUTH-SERVICE] Production admin account ensured: nivya1106@gmail.com");
}

}
