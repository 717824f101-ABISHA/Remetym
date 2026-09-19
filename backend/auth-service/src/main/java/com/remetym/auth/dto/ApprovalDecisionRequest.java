package com.remetym.auth.dto;

public class ApprovalDecisionRequest {
    private String reason;

    public ApprovalDecisionRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
