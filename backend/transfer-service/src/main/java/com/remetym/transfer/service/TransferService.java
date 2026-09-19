package com.remetym.transfer.service;

import com.remetym.transfer.client.InventoryClient;
import com.remetym.transfer.client.NotificationClient;
import com.remetym.transfer.model.TransferHistory;
import com.remetym.transfer.model.TransferRequest;
import com.remetym.transfer.repository.TransferHistoryRepository;
import com.remetym.transfer.repository.TransferRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransferService {

    @Autowired
    private TransferRequestRepository requestRepository;

    @Autowired
    private TransferHistoryRepository historyRepository;

    @Autowired
    private InventoryClient inventoryClient;

    @Autowired
    private NotificationClient notificationClient;

    public List<TransferRequest> getRequests(String userRole, String districtId, String phcId) {
        if ("ADMIN".equalsIgnoreCase(userRole)) {
            return requestRepository.findAll();
        }

        if ("DHO".equalsIgnoreCase(userRole)) {
            if (districtId != null && !districtId.trim().isEmpty() && !"DIST-ALL".equalsIgnoreCase(districtId.trim())) {
                List<TransferRequest> list = requestRepository.findByDistrictIdOrDistrictName(districtId.trim(), districtId.trim());
                if (list.isEmpty()) {
                    final String queryD = districtId.trim().toLowerCase();
                    return requestRepository.findAll().stream().filter(r -> {
                        String dId = r.getDistrictId() != null ? r.getDistrictId().trim().toLowerCase() : "";
                        String dName = r.getDistrictName() != null ? r.getDistrictName().trim().toLowerCase() : "";
                        return (dId.equals(queryD) || dName.equals(queryD));
                    }).collect(Collectors.toList());
                }
                return list;
            }
            return requestRepository.findAll();
        }

        if ("PHC_STAFF".equalsIgnoreCase(userRole)) {
            if (phcId != null && !phcId.trim().isEmpty()) {
                final String queryP = phcId.trim().toLowerCase();
                List<TransferRequest> list = requestRepository.findByDestPhcIdOrDestPhcName(phcId.trim(), phcId.trim());
                if (list.isEmpty()) {
                    return requestRepository.findAll().stream().filter(r -> {
                        String dId = r.getDestPhcId() != null ? r.getDestPhcId().trim().toLowerCase() : "";
                        String dName = r.getDestPhcName() != null ? r.getDestPhcName().trim().toLowerCase() : "";
                        return (dId.equals(queryP) || dName.equals(queryP));
                    }).collect(Collectors.toList());
                }
                return list;
            }
        }

        return requestRepository.findAll();
    }

    public TransferRequest createRequest(TransferRequest req, String userEmail, String userName, String userPhcId, String userDistrictId) {
        if (req.getSourcePhcId() != null && req.getSourcePhcId().equals(req.getDestPhcId())) {
            throw new RuntimeException("Source PHC and Destination PHC cannot be the same.");
        }

        // Server-side strict District-based Transfer Restriction Validation
        String sDistId = req.getSourceDistrictId() != null ? req.getSourceDistrictId().trim() : (req.getDistrictId() != null ? req.getDistrictId().trim() : "");
        String dDistId = req.getDestDistrictId() != null ? req.getDestDistrictId().trim() : (req.getDistrictId() != null ? req.getDistrictId().trim() : "");
        String sDistName = req.getSourceDistrictName() != null ? req.getSourceDistrictName().trim() : (req.getDistrictName() != null ? req.getDistrictName().trim() : "");
        String dDistName = req.getDestDistrictName() != null ? req.getDestDistrictName().trim() : (req.getDistrictName() != null ? req.getDistrictName().trim() : "");

        if (!sDistId.isEmpty() && !dDistId.isEmpty() && !sDistId.equalsIgnoreCase(dDistId)) {
            throw new RuntimeException("Transfers are allowed only between PHCs within the same district.");
        }
        if (!sDistName.isEmpty() && !dDistName.isEmpty() && !sDistName.equalsIgnoreCase(dDistName)) {
            throw new RuntimeException("Transfers are allowed only between PHCs within the same district.");
        }

        if (req.getQuantity() <= 0) {
            throw new RuntimeException("Transfer quantity must be greater than 0.");
        }

        req.setRequestId("REQ-" + (1000 + (int)(Math.random() * 9000)));
        req.setStatus("PENDING");
        req.setRequestDate(Instant.now().toString());
        if (req.getRequestedBy() == null) req.setRequestedBy(userName != null ? userName : userEmail);
        if (req.getRequestedByUserId() == null) req.setRequestedByUserId(userEmail);
        if (req.getDistrictId() == null) req.setDistrictId(userDistrictId != null ? userDistrictId : com.remetym.transfer.util.DistrictIdGenerator.generateDistrictId(req.getDistrictName()));
        if (req.getSourceDistrictId() == null) req.setSourceDistrictId(req.getDistrictId());
        if (req.getDestDistrictId() == null) req.setDestDistrictId(req.getDistrictId());

        TransferRequest saved = requestRepository.save(req);

        // Send notification to DHO for the specific district
        notificationClient.sendNotification(
                "DHO",
                null,
                saved.getDistrictId(),
                null,
                "New Inter-PHC Transfer Request (" + saved.getDistrictName() + ")",
                saved.getRequestedBy() + " requested " + saved.getQuantity() + " units of " + saved.getMedicineName() + " from " + saved.getSourcePhcName() + " to " + saved.getDestPhcName(),
                "TRANSFER_REQUEST",
                "/dho/transfer-requests"
        );

        return saved;
    }

    public TransferRequest approveRequest(String requestId, String dhoName, String remarks) {
        TransferRequest req = requestRepository.findByRequestId(requestId)
                .orElseGet(() -> requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Transfer request not found.")));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new RuntimeException("Request is already " + req.getStatus());
        }

        // 1. Call Inventory Service via REST API to perform stock transfer atomically
        boolean transferred = inventoryClient.executeStockTransfer(
                req.getSourcePhcId(),
                req.getSourcePhcName(),
                req.getDestPhcId(),
                req.getDestPhcName(),
                req.getDistrictId(),
                req.getDistrictName(),
                req.getMedicineId(),
                req.getMedicineName(),
                req.getQuantity()
        );

        if (!transferred) {
            throw new RuntimeException("Stock transfer failed at Inventory Service.");
        }

        String now = Instant.now().toString();

        // 2. Update request status to APPROVED
        req.setStatus("APPROVED");
        req.setApprovedBy(dhoName != null ? dhoName : "DHO Officer");
        req.setDecisionDate(now);
        req.setRemarks(remarks != null && !remarks.isEmpty() ? remarks : "Approved by DHO.");
        requestRepository.save(req);

        // 3. Save transfer history record
        TransferHistory history = new TransferHistory();
        history.setTransferId("TRF-" + (8000 + (int)(Math.random() * 1000)));
        history.setRequestId(req.getRequestId());
        history.setMedicineId(req.getMedicineId());
        history.setMedicineName(req.getMedicineName());
        history.setBatchNumber(req.getBatchNumber() != null ? req.getBatchNumber() : "BAT-001");
        history.setSourcePhcId(req.getSourcePhcId());
        history.setSourcePhcName(req.getSourcePhcName());
        history.setDestPhcId(req.getDestPhcId());
        history.setDestPhcName(req.getDestPhcName());
        history.setDistrictId(req.getDistrictId());
        history.setDistrictName(req.getDistrictName());
        history.setQuantity(req.getQuantity());
        history.setRequestedBy(req.getRequestedBy());
        history.setApprovedBy(req.getApprovedBy());
        history.setRequestDate(req.getRequestDate());
        history.setApprovalDate(now);
        history.setCompletionDate(now);
        history.setStatus("COMPLETED");
        historyRepository.save(history);

        // 4. Send notifications
        notificationClient.sendNotification(
                "PHC_STAFF",
                req.getRequestedByUserId(),
                null,
                req.getDestPhcId(),
                "Transfer Request Approved!",
                "Your request (" + req.getRequestId() + ") for " + req.getQuantity() + " units of " + req.getMedicineName() + " was APPROVED.",
                "APPROVAL",
                "/phc/my-requests"
        );

        return req;
    }

    public TransferRequest rejectRequest(String requestId, String dhoName, String remarks) {
        TransferRequest req = requestRepository.findByRequestId(requestId)
                .orElseGet(() -> requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Transfer request not found.")));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new RuntimeException("Request is already " + req.getStatus());
        }

        String now = Instant.now().toString();
        req.setStatus("REJECTED");
        req.setApprovedBy(dhoName != null ? dhoName : "DHO Officer");
        req.setDecisionDate(now);
        req.setRemarks(remarks != null && !remarks.isEmpty() ? remarks : "Rejected by DHO.");
        requestRepository.save(req);

        notificationClient.sendNotification(
                "PHC_STAFF",
                req.getRequestedByUserId(),
                null,
                req.getDestPhcId(),
                "Transfer Request Rejected",
                "Your request (" + req.getRequestId() + ") for " + req.getMedicineName() + " was REJECTED by DHO.",
                "REJECTION",
                "/phc/my-requests"
        );

        return req;
    }

    public List<TransferHistory> getHistory(String userRole, String districtId, String phcId) {
        if ("ADMIN".equalsIgnoreCase(userRole)) {
            return historyRepository.findAll();
        }

        if ("DHO".equalsIgnoreCase(userRole)) {
            if (districtId != null && !districtId.trim().isEmpty() && !"DIST-ALL".equalsIgnoreCase(districtId.trim())) {
                List<TransferHistory> list = historyRepository.findByDistrictIdOrDistrictName(districtId.trim(), districtId.trim());
                if (list.isEmpty()) {
                    final String queryD = districtId.trim().toLowerCase();
                    return historyRepository.findAll().stream().filter(h -> {
                        String dId = h.getDistrictId() != null ? h.getDistrictId().trim().toLowerCase() : "";
                        String dName = h.getDistrictName() != null ? h.getDistrictName().trim().toLowerCase() : "";
                        return (dId.equals(queryD) || dName.equals(queryD));
                    }).collect(Collectors.toList());
                }
                return list;
            }
            return historyRepository.findAll();
        }

        if ("PHC_STAFF".equalsIgnoreCase(userRole)) {
            if (phcId != null && !phcId.trim().isEmpty()) {
                final String queryP = phcId.trim().toLowerCase();
                List<TransferHistory> list = historyRepository.findByDestPhcIdOrDestPhcName(phcId.trim(), phcId.trim());
                if (list.isEmpty()) {
                    return historyRepository.findAll().stream().filter(h -> {
                        String dId = h.getDestPhcId() != null ? h.getDestPhcId().trim().toLowerCase() : "";
                        String dName = h.getDestPhcName() != null ? h.getDestPhcName().trim().toLowerCase() : "";
                        return (dId.equals(queryP) || dName.equals(queryP));
                    }).collect(Collectors.toList());
                }
                return list;
            }
        }

        return historyRepository.findAll();
    }

    public List<java.util.Map<String, Object>> getDistrictTransferSummary(String districtId) {
        String target = districtId != null ? districtId.trim() : "";

        // 1. Query active PHCs for district from auth service
        List<java.util.Map<String, String>> phcs = new java.util.ArrayList<>();
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String gatewayUrl = System.getenv("GATEWAY_URL") != null ? System.getenv("GATEWAY_URL") : "http://localhost:8080";
            String authUrl = gatewayUrl + "/api/users/active-phcs?districtId=" + java.net.URLEncoder.encode(target, java.nio.charset.StandardCharsets.UTF_8);
            List<?> rawList = restTemplate.getForObject(authUrl, List.class);
            if (rawList != null) {
                for (Object item : rawList) {
                    if (item instanceof java.util.Map) {
                        java.util.Map<?, ?> map = (java.util.Map<?, ?>) item;
                        java.util.Map<String, String> entry = new java.util.HashMap<>();
                        entry.put("phcId", (String) map.get("phcId"));
                        entry.put("phcName", (String) map.get("phcName"));
                        phcs.add(entry);
                    }
                }
            }
        } catch (Exception ignored) {}

        // Fallback: if auth service unreachable, check request history distinct PHCs
        List<TransferRequest> allRequests = requestRepository.findAll();
        List<TransferHistory> allHistory = historyRepository.findAll();

        if (phcs.isEmpty()) {
            java.util.Map<String, String> distinctPhcs = new java.util.LinkedHashMap<>();
            for (TransferRequest r : allRequests) {
                if (matchDistrict(r.getDistrictId(), r.getDistrictName(), target)) {
                    if (r.getSourcePhcName() != null) distinctPhcs.put(r.getSourcePhcName(), r.getSourcePhcId() != null ? r.getSourcePhcId() : r.getSourcePhcName());
                    if (r.getDestPhcName() != null) distinctPhcs.put(r.getDestPhcName(), r.getDestPhcId() != null ? r.getDestPhcId() : r.getDestPhcName());
                }
            }
            for (TransferHistory h : allHistory) {
                if (matchDistrict(h.getDistrictId(), h.getDistrictName(), target)) {
                    if (h.getSourcePhcName() != null) distinctPhcs.put(h.getSourcePhcName(), h.getSourcePhcId() != null ? h.getSourcePhcId() : h.getSourcePhcName());
                    if (h.getDestPhcName() != null) distinctPhcs.put(h.getDestPhcName(), h.getDestPhcId() != null ? h.getDestPhcId() : h.getDestPhcName());
                }
            }
            for (java.util.Map.Entry<String, String> entry : distinctPhcs.entrySet()) {
                java.util.Map<String, String> m = new java.util.HashMap<>();
                m.put("phcName", entry.getKey());
                m.put("phcId", entry.getValue());
                phcs.add(m);
            }
        }

        List<java.util.Map<String, Object>> summaryList = new java.util.ArrayList<>();

        for (java.util.Map<String, String> phc : phcs) {
            String pId = phc.get("phcId");
            String pName = phc.get("phcName");

            long pending = allRequests.stream().filter(r ->
                matchDistrict(r.getDistrictId(), r.getDistrictName(), target) &&
                matchPhc(r.getSourcePhcId(), r.getSourcePhcName(), r.getDestPhcId(), r.getDestPhcName(), pId, pName) &&
                "PENDING".equalsIgnoreCase(r.getStatus())
            ).count();

            long approved = allRequests.stream().filter(r ->
                matchDistrict(r.getDistrictId(), r.getDistrictName(), target) &&
                matchSinglePhc(r.getSourcePhcId(), r.getSourcePhcName(), pId, pName) &&
                "APPROVED".equalsIgnoreCase(r.getStatus())
            ).count();

            long rejected = allRequests.stream().filter(r ->
                matchDistrict(r.getDistrictId(), r.getDistrictName(), target) &&
                matchPhc(r.getSourcePhcId(), r.getSourcePhcName(), r.getDestPhcId(), r.getDestPhcName(), pId, pName) &&
                "REJECTED".equalsIgnoreCase(r.getStatus())
            ).count();

            java.util.Map<String, Object> phcSummary = new java.util.LinkedHashMap<>();
            phcSummary.put("phcName", pName);
            phcSummary.put("phcId", pId);
            phcSummary.put("pending", (int) pending);
            phcSummary.put("approved", (int) approved);
            phcSummary.put("rejected", (int) rejected);
            summaryList.add(phcSummary);
        }

        return summaryList;
    }

    private boolean matchDistrict(String dId, String dName, String target) {
        if (target == null || target.trim().isEmpty() || "DIST-ALL".equalsIgnoreCase(target.trim())) return true;
        String tClean = target.trim().toLowerCase();

        String dIdClean = dId != null ? dId.trim().toLowerCase() : "";
        String dNameClean = dName != null ? dName.trim().toLowerCase() : "";

        if (dIdClean.equals(tClean) || dNameClean.equals(tClean)) return true;

        String genTargetId = com.remetym.transfer.util.DistrictIdGenerator.generateDistrictId(target).toLowerCase();
        if (dIdClean.equals(genTargetId)) return true;

        if (dNameClean != null && !dNameClean.isEmpty()) {
            String genDNameId = com.remetym.transfer.util.DistrictIdGenerator.generateDistrictId(dNameClean).toLowerCase();
            if (genDNameId.equals(genTargetId)) return true;
        }

        return false;
    }

    private boolean matchPhc(String sId, String sName, String dId, String dName, String targetId, String targetName) {
        if (targetId != null && !targetId.isEmpty()) {
            if (targetId.equalsIgnoreCase(sId) || targetId.equalsIgnoreCase(dId)) return true;
        }
        if (targetName != null && !targetName.isEmpty()) {
            if (targetName.equalsIgnoreCase(sName) || targetName.equalsIgnoreCase(dName)) return true;
        }
        return false;
    }

    private boolean matchSinglePhc(String sId, String sName, String targetId, String targetName) {
        if (targetId != null && !targetId.trim().isEmpty() && targetId.equalsIgnoreCase(sId)) return true;
        if (targetName != null && !targetName.trim().isEmpty() && targetName.equalsIgnoreCase(sName)) return true;
        return false;
    }
}
