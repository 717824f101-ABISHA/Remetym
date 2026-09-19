package com.remetym.auth.controller;

import com.remetym.auth.dto.ApprovalDecisionRequest;
import com.remetym.auth.model.RegistrationRequest;
import com.remetym.auth.security.JwtProvider;
import com.remetym.auth.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/admin/users", "/api/users"})
public class UserController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private com.remetym.auth.repository.UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @GetMapping("/requests")
    public ResponseEntity<List<RegistrationRequest>> getRegistrationRequests() {
        return ResponseEntity.ok(registrationService.getAllRequests());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOracleStats() {
        return ResponseEntity.ok(registrationService.getOracleStats());
    }

    @GetMapping({"/active-phcs", "/phcs"})
    public ResponseEntity<List<Map<String, String>>> getActivePhcsFromOracle(
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "districtName", required = false) String districtName,
            @RequestParam(value = "dhoId", required = false) String dhoId) {
        List<com.remetym.auth.model.User> phcUsers = userRepository.findByRoleIgnoreCaseAndStatusIgnoreCase("PHC_STAFF", "ACTIVE");
        
        System.out.println("===== REGISTERED ACTIVE PHCs FROM ORACLE =====");
        Map<String, Map<String, String>> distinctPhcs = new java.util.LinkedHashMap<>();
        String queryId = districtId != null ? districtId.trim() : "";
        String queryName = districtName != null ? districtName.trim() : "";
        
        for (com.remetym.auth.model.User u : phcUsers) {
            String pName = u.getPhcName() != null ? u.getPhcName().trim() : null;
            if (pName != null && !pName.isEmpty()) {
                String pId = (u.getPhcId() != null && !u.getPhcId().trim().isEmpty())
                        ? u.getPhcId().trim()
                        : "PHC-" + pName.replaceAll("\\s+", "").toUpperCase();
                
                String uId = u.getDistrictId() != null ? u.getDistrictId().trim() : "";
                String uName = u.getDistrictName() != null ? u.getDistrictName().trim() : "";

                boolean districtMatches = true;
                if (!queryId.isEmpty() && !"DIST-ALL".equalsIgnoreCase(queryId)) {
                    districtMatches = queryId.equalsIgnoreCase(uId) || queryId.equalsIgnoreCase(uName);
                }
                if (districtMatches && !queryName.isEmpty() && !"DIST-ALL".equalsIgnoreCase(queryName)) {
                    districtMatches = queryName.equalsIgnoreCase(uId) || queryName.equalsIgnoreCase(uName);
                }
                boolean matchDho = (dhoId == null || dhoId.isEmpty() || (u.getDhoId() != null && u.getDhoId().equalsIgnoreCase(dhoId)));

                if (districtMatches && matchDho) {
                    System.out.println(pId + " -> " + pName + (u.getDistrictName() != null ? " (" + u.getDistrictName() + ")" : ""));

                    if (!distinctPhcs.containsKey(pId.toLowerCase())) {
                        Map<String, String> item = new java.util.HashMap<>();
                        item.put("phcId", pId);
                        item.put("id", pId);
                        item.put("phcName", pName);
                        item.put("districtId", u.getDistrictId() != null ? u.getDistrictId() : "");
                        item.put("districtName", u.getDistrictName() != null ? u.getDistrictName() : "");
                        item.put("dhoId", u.getDhoId() != null ? u.getDhoId() : "");
                        item.put("email", u.getEmail() != null ? u.getEmail() : "");
                        item.put("status", "ACTIVE");
                        distinctPhcs.put(pId.toLowerCase(), item);
                    }
                }
            }
        }

        return ResponseEntity.ok(new java.util.ArrayList<>(distinctPhcs.values()));
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable("id") String requestId,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
                                            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        String authError = verifyAdminAuthorization(authHeader, headerRole);
        if (authError != null) {
            HttpStatus status = authError.contains("Unauthorized") ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN;
            return ResponseEntity.status(status).body(Map.of("message", authError));
        }

        try {
            RegistrationRequest request = registrationService.approveRequest(requestId, adminEmail != null ? adminEmail : "Admin");
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable("id") String requestId,
                                           @RequestBody(required = false) ApprovalDecisionRequest decision,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestHeader(value = "X-User-Role", required = false) String headerRole,
                                           @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        String authError = verifyAdminAuthorization(authHeader, headerRole);
        if (authError != null) {
            HttpStatus status = authError.contains("Unauthorized") ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN;
            return ResponseEntity.status(status).body(Map.of("message", authError));
        }

        try {
            String reason = decision != null ? decision.getReason() : "";
            RegistrationRequest request = registrationService.rejectRequest(requestId, adminEmail != null ? adminEmail : "Admin", reason);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @RequestMapping(value = {"/{id}/deactivate", "/requests/{id}/deactivate", "/api/admin/users/{id}/deactivate", "/api/users/{id}/deactivate"}, method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> deactivateUser(@PathVariable("id") String userId,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
                                            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        String authError = verifyAdminAuthorization(authHeader, headerRole);
        if (authError != null) {
            HttpStatus status = authError.contains("Unauthorized") ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN;
            return ResponseEntity.status(status).body(Map.of("success", false, "message", authError));
        }

        try {
            RegistrationRequest request = registrationService.deactivateUser(userId, adminEmail != null ? adminEmail : "Admin");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User account deactivated successfully",
                "data", request
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @RequestMapping(value = {"/{id}/reactivate", "/requests/{id}/reactivate", "/api/admin/users/{id}/reactivate", "/api/users/{id}/reactivate"}, method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> reactivateUser(@PathVariable("id") String userId,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @RequestHeader(value = "X-User-Role", required = false) String headerRole,
                                            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        String authError = verifyAdminAuthorization(authHeader, headerRole);
        if (authError != null) {
            HttpStatus status = authError.contains("Unauthorized") ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN;
            return ResponseEntity.status(status).body(Map.of("success", false, "message", authError));
        }

        try {
            RegistrationRequest request = registrationService.reactivateUser(userId, adminEmail != null ? adminEmail : "Admin");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User account reactivated successfully",
                "data", request
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private String verifyAdminAuthorization(String authHeader, String headerRole) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return "Unauthorized: Missing or invalid Authorization token header.";
        }
        String token = authHeader.substring(7);
        if (!jwtProvider.validateToken(token)) {
            return "Unauthorized: Invalid or expired JWT token.";
        }

        String roleFromToken = jwtProvider.getRoleFromToken(token);
        if (roleFromToken == null || !"ADMIN".equalsIgnoreCase(roleFromToken.trim())) {
            return "Access Denied: Only Administrator can perform approval/rejection operations.";
        }

        if (headerRole != null && !"ADMIN".equalsIgnoreCase(headerRole.trim())) {
            return "Access Denied: Role mismatch detected.";
        }

        return null;
    }
}
