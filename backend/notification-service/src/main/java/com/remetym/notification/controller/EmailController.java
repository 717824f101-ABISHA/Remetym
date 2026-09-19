package com.remetym.notification.controller;

import com.remetym.notification.model.EmailLog;
import com.remetym.notification.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<EmailLog> sendEmail(@RequestBody EmailLog email) {
        return ResponseEntity.ok(emailService.sendEmail(email));
    }

    @GetMapping("/history")
    public ResponseEntity<List<EmailLog>> getEmailHistory() {
        return ResponseEntity.ok(emailService.getEmailHistory());
    }
}
