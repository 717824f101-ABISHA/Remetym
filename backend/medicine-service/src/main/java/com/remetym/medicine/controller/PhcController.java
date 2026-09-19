package com.remetym.medicine.controller;

import com.remetym.medicine.model.Phc;
import com.remetym.medicine.service.PhcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/phcs", "/api/phcs/"})
public class PhcController {

    @Autowired
    private PhcService phcService;

    @GetMapping
    public ResponseEntity<List<Phc>> getPhcs() {
        return ResponseEntity.ok(phcService.getAllPhcs());
    }

    @PostMapping
    public ResponseEntity<Phc> addPhc(@RequestBody Phc phc) {
        return ResponseEntity.ok(phcService.addPhc(phc));
    }
}
