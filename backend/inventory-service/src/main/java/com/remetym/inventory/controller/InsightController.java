package com.remetym.inventory.controller;

import com.remetym.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getInsights() {
        return ResponseEntity.ok(inventoryService.getAIInsights());
    }
}
