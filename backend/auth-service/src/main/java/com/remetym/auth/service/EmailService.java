package com.remetym.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:abishasenthil06@gmail.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendApprovalEmail(String toEmail, String recipientName, String role, String facilityName) {
        String formattedRole = "DHO".equalsIgnoreCase(role)
                ? "District Health Officer (DHO)"
                : "PHC Staff";

        String loginUrl = frontendUrl.replaceAll("/+$", "") + "/login";
        String subject = "RemeTym Registration ACCEPTED - " + recipientName;

        StringBuilder body = new StringBuilder();

        body.append("Dear ").append(recipientName).append(",\n\n");
        body.append("Your registration for the RemeTym Health System has been ACCEPTED by the Administrator.\n\n");
        body.append("Registration Details:\n");
        body.append("• User Name: ").append(recipientName).append("\n");
        body.append("• Role: ").append(formattedRole).append("\n");

        if (facilityName != null && !facilityName.trim().isEmpty()) {
            body.append("• PHC / District Name: ").append(facilityName).append("\n");
        }

        body.append("• Final Status: ACCEPTED\n\n");
        body.append("You can now log in using your registered email (")
                .append(toEmail)
                .append(") at:\n");
        body.append(loginUrl).append("\n\n");
        body.append("Thank you,\nRemeTym Health Administration");

        sendMail(toEmail, subject, body.toString());
    }

    public void sendRejectionEmail(
            String toEmail,
            String recipientName,
            String role,
            String facilityName,
            String reason) {

        String formattedRole = "DHO".equalsIgnoreCase(role)
                ? "District Health Officer (DHO)"
                : "PHC Staff";

        String subject = "RemeTym Registration REJECTED - " + recipientName;

        StringBuilder body = new StringBuilder();

        body.append("Dear ").append(recipientName).append(",\n\n");
        body.append("Your registration request for the RemeTym Health System has been REJECTED by the Administrator.\n\n");
        body.append("Registration Details:\n");
        body.append("• User Name: ").append(recipientName).append("\n");
        body.append("• Role: ").append(formattedRole).append("\n");

        if (facilityName != null && !facilityName.trim().isEmpty()) {
            body.append("• PHC / District Name: ").append(facilityName).append("\n");
        }

        body.append("• Final Status: REJECTED\n");

        if (reason != null && !reason.trim().isEmpty()) {
            body.append("• Rejection Reason: ").append(reason).append("\n");
        }

        body.append("\nPlease contact the RemeTym Administrator if you believe this is in error.\n\n");
        body.append("Thank you,\nRemeTym Health Administration");

        sendMail(toEmail, subject, body.toString());
    }

    @Async
    public void sendDeactivationEmail(
            String toEmail,
            String recipientName) {

        String subject = "Account Deactivated – Remetyme";

        StringBuilder body = new StringBuilder();

        body.append("Dear ").append(recipientName).append(",\n\n");
        body.append("Your Remetyme account has been deactivated by the System Administrator.\n\n");
        body.append("You will no longer be able to access the system until your account is reactivated.\n\n");
        body.append("If you believe this is an error, please contact the District Health Office or System Administration.\n\n");
        body.append("Regards,\nRemetyme Administration");

        sendMail(toEmail, subject, body.toString());
    }

    @Async
    public void sendReactivationEmail(
            String toEmail,
            String recipientName) {

        String subject = "Account Reactivated – Remetyme";

        StringBuilder body = new StringBuilder();

        body.append("Dear ").append(recipientName).append(",\n\n");
        body.append("Your Remetyme account has been reactivated by the System Administrator.\n\n");
        body.append("You can now log in and access the Remetyme system.\n\n");
        body.append("Regards,\nRemetyme Administration");

        sendMail(toEmail, subject, body.toString());
    }

    public void sendPasswordResetEmail(
            String toEmail,
            String resetToken) {

        String resetUrl =
                frontendUrl.replaceAll("/+$", "")
                        + "/reset-password?token="
                        + resetToken;

        String subject = "Reset Your RemeTym Password";

        String body =
                "Hello,\n\n"
                        + "You have requested to reset your password for RemeTym.\n\n"
                        + "Please click the link below or open it in your browser to set a new password:\n"
                        + resetUrl
                        + "\n\n"
                        + "This link will expire in 15 minutes.\n\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "Thank you,\nRemeTym Security Team";

        sendMail(toEmail, subject, body);
    }

    private void sendMail(
            String toEmail,
            String subject,
            String body) {

        String sender =
                (fromEmail != null && !fromEmail.trim().isEmpty())
                        ? fromEmail.trim()
                        : "abishasenthil06@gmail.com";

        System.out.println(
                "[EMAIL DISPATCH ATTEMPT] From: "
                        + sender
                        + " | To: "
                        + toEmail
                        + " | Subject: "
                        + subject
        );

        if (mailSender == null) {

            String err =
                    "JavaMailSender bean is not configured in Spring application context.";

            System.err.println("[EMAIL ERROR] " + err);

            throw new RuntimeException(err);
        }

        try {

            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(sender);
            message.setTo(toEmail.trim());
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            System.out.println(
                    "[EMAIL DISPATCH SUCCESS] Delivered to "
                            + toEmail
            );

        } catch (Exception e) {

            String smtpErr =
                    "SMTP Delivery Failed to "
                            + toEmail
                            + ": "
                            + e.getMessage();

            System.err.println(
                    "[EMAIL SMTP ERROR] "
                            + smtpErr
            );

            throw new RuntimeException(
                    smtpErr,
                    e
            );
        }
    }
}
