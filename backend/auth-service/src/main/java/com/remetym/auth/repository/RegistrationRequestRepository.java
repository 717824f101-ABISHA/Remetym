package com.remetym.auth.repository;

import com.remetym.auth.model.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, String> {
    Optional<RegistrationRequest> findByEmailIgnoreCase(String email);
    List<RegistrationRequest> findByStatus(String status);
    long countByStatus(String status);
}
