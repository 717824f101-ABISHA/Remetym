package com.remetym.transfer.controller;

import com.remetym.transfer.dto.DecisionRequest;
import com.remetym.transfer.model.TransferHistory;
import com.remetym.transfer.model.TransferRequest;
import com.remetym.transfer.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class TransferController {

    @Autowired
    private TransferService transferService;

    @GetMapping({"/api/transfers/requests", "/api/requests"})
    public ResponseEntity<List<TransferRequest>> getRequests(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        return ResponseEntity.ok(transferService.getRequests(role, districtId, phcId));
    }

    @PostMapping({"/api/transfers/requests", "/api/requests"})
    public ResponseEntity<?> createRequest(@RequestBody TransferRequest request,
                                           @RequestHeader(value = "X-User-Email", required = false) String email,
                                           @RequestHeader(value = "X-User-Role", required = false) String role) {
        try {
            TransferRequest result = transferService.createRequest(request, email, email, request.getDestPhcId(), request.getDistrictId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping({"/api/transfers/requests/{id}/approve", "/api/requests/{id}/approve"})
    public ResponseEntity<?> approveRequest(@PathVariable("id") String id,
                                            @RequestBody(required = false) DecisionRequest decision,
                                            @RequestHeader(value = "X-User-Email", required = false) String email) {
        try {
            String remarks = decision != null ? decision.getRemarks() : null;
            TransferRequest result = transferService.approveRequest(id, email != null ? email : "DHO", remarks);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping({"/api/transfers/requests/{id}/reject", "/api/requests/{id}/reject"})
    public ResponseEntity<?> rejectRequest(@PathVariable("id") String id,
                                           @RequestBody(required = false) DecisionRequest decision,
                                           @RequestHeader(value = "X-User-Email", required = false) String email) {
        try {
            String remarks = decision != null ? decision.getRemarks() : null;
            TransferRequest result = transferService.rejectRequest(id, email != null ? email : "DHO", remarks);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/transfers/history")
    public ResponseEntity<List<TransferHistory>> getHistory(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(value = "districtId", required = false) String districtId,
            @RequestParam(value = "phcId", required = false) String phcId) {
        return ResponseEntity.ok(transferService.getHistory(role, districtId, phcId));
    }

    @GetMapping("/api/transfers/district/{districtId}/summary")
    public ResponseEntity<List<Map<String, Object>>> getDistrictTransferSummary(@PathVariable("districtId") String districtId) {
        return ResponseEntity.ok(transferService.getDistrictTransferSummary(districtId));
    }
}
