package com.remetym.medicine.controller;

import com.remetym.medicine.model.Medicine;
import com.remetym.medicine.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping
    public ResponseEntity<List<Medicine>> getMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedicineById(@PathVariable("id") String id) {
        Medicine med = medicineService.getMedicineById(id);
        if (med == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(med);
    }

    @PostMapping
    public ResponseEntity<Medicine> addMedicine(@RequestBody Medicine medicine) {
        return ResponseEntity.ok(medicineService.addMedicine(medicine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedicine(@PathVariable("id") String id, @RequestBody Medicine medicine) {
        try {
            return ResponseEntity.ok(medicineService.updateMedicine(id, medicine));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicine(@PathVariable("id") String id) {
        boolean deleted = medicineService.deleteMedicine(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Medicine deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }
}
