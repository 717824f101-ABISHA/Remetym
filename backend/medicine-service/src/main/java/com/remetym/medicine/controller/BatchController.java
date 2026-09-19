package com.remetym.medicine.controller;

import com.remetym.medicine.model.Batch;
import com.remetym.medicine.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    @Autowired
    private BatchService batchService;

    @GetMapping
    public ResponseEntity<List<Batch>> getBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    @PostMapping
    public ResponseEntity<Batch> addBatch(@RequestBody Batch batch) {
        return ResponseEntity.ok(batchService.addBatch(batch));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveBatch(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String approvedBy = body != null ? body.get("approvedBy") : "Admin";
            String reason = body != null ? body.get("reason") : "Approved by administrator";
            Batch approved = batchService.approveBatch(id, approvedBy, reason);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBatch(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : "Rejected by administrator";
            Batch rejected = batchService.rejectBatch(id, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
