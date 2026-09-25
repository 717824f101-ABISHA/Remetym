package com.remetym.auth.service;
import org.springframework.scheduling.annotation.Async;
import com.remetym.auth.dto.RegisterRequest;
import com.remetym.auth.model.RegistrationRequest;
import com.remetym.auth.model.User;
import com.remetym.auth.repository.RegistrationRequestRepository;
import com.remetym.auth.repository.UserRepository;
import com.remetym.auth.util.DistrictIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRequestRepository registrationRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<RegistrationRequest> getAllRequests() {
        return registrationRequestRepository.findAll();
    }

    public RegistrationRequest register(RegisterRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanUsername = req.getUsername().trim();
        String cleanRole = req.getRole().trim().toUpperCase().replace(" ", "_");
        String cleanDistrict = (req.getDistrictName() != null ? req.getDistrictName() :
                (req.getDistrict() != null ? req.getDistrict() : "District Area")).trim();

        if ("ADMIN".equalsIgnoreCase(cleanRole)) {
            throw new RuntimeException("Admin registration is not permitted.");
        }

        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(cleanEmail);
        if (existingUser.isPresent() && "ACTIVE".equalsIgnoreCase(existingUser.get().getStatus())) {
            throw new RuntimeException("An account with this email already exists.");
        }

        Optional<RegistrationRequest> existingReq =
                registrationRequestRepository.findByEmailIgnoreCase(cleanEmail);

        if (existingReq.isPresent() && "PENDING".equalsIgnoreCase(existingReq.get().getStatus())) {
            throw new RuntimeException("Your registration request is already pending Admin approval.");
        }

        String dynamicId = "REG-" + System.currentTimeMillis();
        String dynamicUserId = "USR-" + System.currentTimeMillis();

        String generatedDistrictId = DistrictIdGenerator.generateDistrictId(cleanDistrict);

        RegistrationRequest request = new RegistrationRequest();
        request.setId(dynamicId);
        request.setUserId(dynamicUserId);
        request.setUsername(cleanUsername);
        request.setFullName(cleanUsername);
        request.setEmail(cleanEmail);
        request.setPassword(req.getPassword());
        request.setRole(cleanRole);
        request.setTitle("DHO".equals(cleanRole)
                ? "District Health Officer"
                : "PHC Staff");
        request.setDistrictName(cleanDistrict);
        request.setDistrictId(generatedDistrictId);
        request.setDhoId("DHO".equals(cleanRole) ? req.getDhoId() : null);
        request.setPhcName("PHC_STAFF".equals(cleanRole) ? req.getPhcName() : null);
        request.setPhcId("PHC_STAFF".equals(cleanRole) ? req.getPhcId() : null);
        request.setEmployeeId("DHO".equals(cleanRole) ? req.getDhoId() : req.getPhcId());
        request.setStatus("PENDING");
        request.setRegisteredAt(Instant.now().toString());

        registrationRequestRepository.save(request);

        User user = existingUser.orElse(new User());

        user.setId(dynamicUserId);
        user.setUserId(dynamicUserId);
        user.setName(cleanUsername);
        user.setUsername(cleanUsername);
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(cleanRole);
        user.setStatus("PENDING");
        user.setTitle(request.getTitle());
        user.setDistrictName(cleanDistrict);
        user.setDistrictId(generatedDistrictId);
        user.setDhoId(request.getDhoId());
        user.setPhcName(request.getPhcName());
        user.setPhcId(request.getPhcId());
        user.setEmployeeId(request.getEmployeeId());

        userRepository.save(user);

        sendAdminRegistrationNotification(request);

        return request;
    }

    private void sendAdminRegistrationNotification(RegistrationRequest request) {
        try {
            String facility =
                    "PHC_STAFF".equalsIgnoreCase(request.getRole())
                            && request.getPhcName() != null
                            ? request.getPhcName()
                            : request.getDistrictName();

            String title =
                    "New " +
                    ("DHO".equalsIgnoreCase(request.getRole()) ? "DHO" : "PHC Staff") +
                    " Registration";

            String message =
                    "Applicant " + request.getFullName() +
                    " (" + request.getEmail() + ") requested " +
                    request.getRole() + " access for " +
                    facility + ". Status: PENDING.";

            String jsonPayload = String.format(
                    "{\"notificationId\":\"NOTIF-REG-%d\",\"title\":\"%s\",\"message\":\"%s\",\"type\":\"WARNING\",\"targetRole\":\"ADMIN\",\"link\":\"/admin/user-approvals\",\"read\":false,\"timestamp\":\"%s\"}",
                    System.currentTimeMillis() % 1000000,
                    escapeJson(title),
                    escapeJson(message),
                    request.getRegisteredAt() != null
                            ? request.getRegisteredAt()
                            : Instant.now().toString()
            );

            String gatewayUrl =
                    System.getenv("GATEWAY_URL") != null
                            ? System.getenv("GATEWAY_URL")
                            : "http://localhost:8080";

            java.net.http.HttpClient client =
                    java.net.http.HttpClient.newHttpClient();

            java.net.http.HttpRequest httpRequest =
                    java.net.http.HttpRequest.newBuilder()
                            .uri(java.net.URI.create(
                                    gatewayUrl + "/api/notifications"))
                            .header("Content-Type", "application/json")
                            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                            .build();

            client.sendAsync(
                    httpRequest,
                    java.net.http.HttpResponse.BodyHandlers.ofString()
            ).thenAccept(res ->
                    System.out.println(
                            "[ADMIN NOTIFICATION DISPATCHED] Status: " +
                            res.statusCode()
                    )
            ).exceptionally(err -> {
                System.out.println(
                        "[ADMIN NOTIFICATION NOTICE] Async notification send skipped: " +
                        err.getMessage()
                );
                return null;
            });

        } catch (Exception e) {
            System.err.println(
                    "[ADMIN NOTIFICATION ERROR]: " + e.getMessage()
            );
        }
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";

        return raw
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", " ");
    }

    public RegistrationRequest approveRequest(
            String requestId,
            String adminName) {

        RegistrationRequest req =
                registrationRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration request not found."
                                ));

        req.setStatus("ACTIVE");
        req.setApprovedAt(Instant.now().toString());
        req.setApprovedBy(
                adminName != null
                        ? adminName
                        : "System Admin"
        );

        registrationRequestRepository.save(req);

        User user =
                userRepository.findByEmailIgnoreCase(req.getEmail())
                        .orElseGet(() -> {
                            User u = new User();
                            u.setId(req.getUserId());
                            u.setUserId(req.getUserId());
                            return u;
                        });

        user.setName(req.getFullName());
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());

        if (req.getPassword() != null
                && !req.getPassword().isEmpty()) {

            user.setPassword(
                    passwordEncoder.encode(req.getPassword())
            );
        }

        user.setRole(req.getRole());
        user.setStatus("ACTIVE");
        user.setTitle(req.getTitle());
        user.setDistrictId(
                req.getDistrictId() != null
                        ? req.getDistrictId()
                        : DistrictIdGenerator.generateDistrictId(
                                req.getDistrictName()
                        )
        );
        user.setDistrictName(req.getDistrictName());
        user.setDhoId(req.getDhoId());
        user.setPhcId(req.getPhcId());
        user.setPhcName(req.getPhcName());
        user.setEmployeeId(req.getEmployeeId());
        user.setApprovedAt(req.getApprovedAt());
        user.setApprovedBy(req.getApprovedBy());

        userRepository.save(user);

        if (req.getPhcName() != null
                && !req.getPhcName().trim().isEmpty()) {

            syncPhcToMedicineService(
                    req.getPhcId(),
                    req.getPhcName(),
                    req.getDistrictId(),
                    req.getDistrictName(),
                    req.getEmail()
            );
        }

        String facility =
                req.getPhcName() != null
                        ? req.getPhcName()
                        : req.getDistrictName();

        emailService.sendApprovalEmail(
                req.getEmail(),
                req.getFullName(),
                req.getRole(),
                facility
        );

        return req;
    }

    private void syncPhcToMedicineService(
            String phcId,
            String phcName,
            String districtId,
            String districtName,
            String email) {

        if (phcName == null || phcName.trim().isEmpty()) {
            return;
        }

        try {
            String jsonPayload = String.format(
                    "{\"phcId\":\"%s\",\"phcName\":\"%s\",\"districtId\":\"%s\",\"districtName\":\"%s\",\"email\":\"%s\"}",
                    escapeJson(
                            phcId != null
                                    ? phcId
                                    : "PHC-" + System.currentTimeMillis()
                    ),
                    escapeJson(phcName),
                    escapeJson(
                            districtId != null
                                    ? districtId
                                    : DistrictIdGenerator.generateDistrictId(
                                            districtName
                                    )
                    ),
                    escapeJson(
                            districtName != null
                                    ? districtName
                                    : ""
                    ),
                    escapeJson(
                            email != null
                                    ? email
                                    : ""
                    )
            );

            String gatewayUrl =
                    System.getenv("GATEWAY_URL") != null
                            ? System.getenv("GATEWAY_URL")
                            : "http://localhost:8080";

            java.net.http.HttpClient client =
                    java.net.http.HttpClient.newHttpClient();

            java.net.http.HttpRequest httpRequest =
                    java.net.http.HttpRequest.newBuilder()
                            .uri(java.net.URI.create(
                                    gatewayUrl + "/api/phcs"))
                            .header("Content-Type", "application/json")
                            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                            .build();

            client.sendAsync(
                    httpRequest,
                    java.net.http.HttpResponse.BodyHandlers.ofString()
            ).thenAccept(res ->
                    System.out.println(
                            "[PHC SYNC DISPATCHED] Status: " +
                            res.statusCode()
                    )
            ).exceptionally(err -> {
                System.out.println(
                        "[PHC SYNC NOTICE] Async send skipped: " +
                        err.getMessage()
                );
                return null;
            });

        } catch (Exception e) {
            System.err.println(
                    "[PHC SYNC ERROR]: " + e.getMessage()
            );
        }
    }

    public RegistrationRequest rejectRequest(
            String requestId,
            String adminName,
            String reason) {

        RegistrationRequest req =
                registrationRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration request not found."
                                ));

        req.setStatus("REJECTED");
        req.setRejectedAt(Instant.now().toString());
        req.setRejectedBy(
                adminName != null
                        ? adminName
                        : "System Admin"
        );
        req.setRejectionReason(reason);

        registrationRequestRepository.save(req);

        userRepository.findByEmailIgnoreCase(req.getEmail())
                .ifPresent(user -> {
                    user.setStatus("REJECTED");
                    user.setRejectionReason(reason);
                    userRepository.save(user);
                });

        String facility =
                req.getPhcName() != null
                        ? req.getPhcName()
                        : req.getDistrictName();

        emailService.sendRejectionEmail(
                req.getEmail(),
                req.getFullName(),
                req.getRole(),
                facility,
                reason
        );

        return req;
    }

    public RegistrationRequest deactivateUser(
            String identifier,
            String adminName) {

        Optional<RegistrationRequest> reqOpt =
                registrationRequestRepository.findById(identifier);

        if (reqOpt.isEmpty()) {
            reqOpt =
                    registrationRequestRepository
                            .findByEmailIgnoreCase(identifier);
        }

        Optional<User> userOpt =
                userRepository.findById(identifier);

        if (userOpt.isEmpty()) {
            userOpt =
                    userRepository.findByEmailIgnoreCase(identifier);
        }

        if (userOpt.isEmpty()) {
            userOpt =
                    userRepository.findByUserId(identifier);
        }

        if (userOpt.isEmpty() && reqOpt.isEmpty()) {
            throw new RuntimeException("User account not found.");
        }

        String userEmail =
                userOpt.isPresent()
                        ? userOpt.get().getEmail()
                        : reqOpt.get().getEmail();

        String userName =
                userOpt.isPresent()
                        ? userOpt.get().getName()
                        : reqOpt.get().getFullName();

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())
                    && !"APPROVED".equalsIgnoreCase(user.getStatus())) {

                throw new RuntimeException(
                        "Only currently APPROVED users can be deactivated."
                );
            }

            user.setStatus("DEACTIVATED");
            userRepository.save(user);
        }

        RegistrationRequest req = reqOpt.orElse(null);

        if (req != null) {
            req.setStatus("DEACTIVATED");
            registrationRequestRepository.save(req);

        } else if (userOpt.isPresent()) {

            req = new RegistrationRequest();
            req.setId(userOpt.get().getId());
            req.setUserId(userOpt.get().getUserId());
            req.setEmail(userOpt.get().getEmail());
            req.setFullName(userOpt.get().getName());
            req.setRole(userOpt.get().getRole());
            req.setStatus("DEACTIVATED");
        }

        // Email is now sent in the background.
        sendDeactivationEmailAsync(userEmail, userName);

        return req;
    }

    public RegistrationRequest reactivateUser(
            String identifier,
            String adminName) {

        Optional<RegistrationRequest> reqOpt =
                registrationRequestRepository.findById(identifier);

        if (reqOpt.isEmpty()) {
            reqOpt =
                    registrationRequestRepository
                            .findByEmailIgnoreCase(identifier);
        }

        Optional<User> userOpt =
                userRepository.findById(identifier);

        if (userOpt.isEmpty()) {
            userOpt =
                    userRepository.findByEmailIgnoreCase(identifier);
        }

        if (userOpt.isEmpty()) {
            userOpt =
                    userRepository.findByUserId(identifier);
        }

        if (userOpt.isEmpty() && reqOpt.isEmpty()) {
            throw new RuntimeException("User account not found.");
        }

        String userEmail =
                userOpt.isPresent()
                        ? userOpt.get().getEmail()
                        : reqOpt.get().getEmail();

        String userName =
                userOpt.isPresent()
                        ? userOpt.get().getName()
                        : reqOpt.get().getFullName();

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!"DEACTIVATED".equalsIgnoreCase(user.getStatus())) {
                throw new RuntimeException(
                        "Only DEACTIVATED users can be reactivated."
                );
            }

            user.setStatus("ACTIVE");
            userRepository.save(user);
        }

        RegistrationRequest req = reqOpt.orElse(null);

        if (req != null) {
            req.setStatus("ACTIVE");
            registrationRequestRepository.save(req);

        } else if (userOpt.isPresent()) {

            req = new RegistrationRequest();
            req.setId(userOpt.get().getId());
            req.setUserId(userOpt.get().getUserId());
            req.setEmail(userOpt.get().getEmail());
            req.setFullName(userOpt.get().getName());
            req.setRole(userOpt.get().getRole());
            req.setStatus("ACTIVE");
        }

        // Email is now sent in the background.
        sendReactivationEmailAsync(userEmail, userName);

        return req;
    }

    @Async
    public void sendDeactivationEmailAsync(
            String email,
            String name) {

        try {
            emailService.sendDeactivationEmail(
                    email,
                    name
            );
        } catch (Exception e) {
            System.err.println(
                    "[DEACTIVATION EMAIL NOTICE]: " +
                    e.getMessage()
            );
        }
    }

    @Async
    public void sendReactivationEmailAsync(
            String email,
            String name) {

        try {
            emailService.sendReactivationEmail(
                    email,
                    name
            );
        } catch (Exception e) {
            System.err.println(
                    "[REACTIVATION EMAIL NOTICE]: " +
                    e.getMessage()
            );
        }
    }

    public java.util.Map<String, Object> getOracleStats() {

        long totalPhcs =
                userRepository.findAll().stream()
                        .filter(u ->
                                "PHC_STAFF".equalsIgnoreCase(u.getRole())
                                && "ACTIVE".equalsIgnoreCase(u.getStatus()))
                        .map(u ->
                                u.getPhcName() != null
                                        ? u.getPhcName().trim().toLowerCase()
                                        : u.getPhcId())
                        .filter(name ->
                                name != null && !name.isEmpty())
                        .distinct()
                        .count();

        long approvedPhcReqs =
                registrationRequestRepository
                        .findByStatus("ACTIVE")
                        .stream()
                        .filter(r ->
                                "PHC_STAFF".equalsIgnoreCase(r.getRole())
                                && r.getPhcName() != null)
                        .map(r ->
                                r.getPhcName().trim().toLowerCase())
                        .distinct()
                        .count();

        totalPhcs = Math.max(
                totalPhcs,
                approvedPhcReqs
        );

        long dhoUserCount =
                userRepository.findAll().stream()
                        .filter(u ->
                                "DHO".equalsIgnoreCase(u.getRole())
                                && "ACTIVE".equalsIgnoreCase(u.getStatus()))
                        .count();

        long totalDistricts =
                userRepository.findAll().stream()
                        .filter(u ->
                                "ACTIVE".equalsIgnoreCase(u.getStatus())
                                && u.getDistrictName() != null
                                && !u.getDistrictName().trim().isEmpty())
                        .map(u ->
                                u.getDistrictName().trim().toLowerCase())
                        .distinct()
                        .count();

        long pendingReqs =
                registrationRequestRepository.countByStatus("PENDING");

        long approvedReqs =
                registrationRequestRepository.countByStatus("ACTIVE");

        long rejectedReqs =
                registrationRequestRepository.countByStatus("REJECTED");

        java.util.Map<String, Object> stats =
                new java.util.HashMap<>();

        stats.put("totalPhcs", totalPhcs);
        stats.put("totalDhos", dhoUserCount);
        stats.put("totalDistricts", totalDistricts);
        stats.put("pendingRegistrations", pendingReqs);
        stats.put("approvedRegistrations", approvedReqs);
        stats.put("rejectedRegistrations", rejectedReqs);

        return stats;
    }
}
