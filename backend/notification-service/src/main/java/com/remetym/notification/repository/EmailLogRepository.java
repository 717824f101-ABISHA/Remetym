package com.remetym.notification.repository;

import com.remetym.notification.model.EmailLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailLogRepository extends MongoRepository<EmailLog, String> {
}
