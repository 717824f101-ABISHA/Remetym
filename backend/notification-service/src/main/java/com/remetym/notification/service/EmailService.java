package com.remetym.notification.service;

import com.remetym.notification.model.EmailLog;
import com.remetym.notification.repository.EmailLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    private JavaMailSender mailSender;

    public EmailLog sendEmail(EmailLog email) {

        if (email.getEmailId() == null || email.getEmailId().isEmpty()) {
            email.setEmailId("EMAIL-" + System.currentTimeMillis());
        }

        if (email.getSentAt() == null) {
            email.setSentAt(Instant.now().toString());
        }

        // Actually send the email through Gmail SMTP
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email.getTo());
        message.setSubject(email.getSubject());
        message.setText(email.getBody());

        mailSender.send(message);

        System.out.println(
            "[NOTIFICATION-SERVICE EMAIL SENT] To: "
            + email.getTo()
            + " | Subject: "
            + email.getSubject()
        );

        return emailLogRepository.save(email);
    }

    public List<EmailLog> getEmailHistory() {
        return emailLogRepository.findAll();
    }
}
