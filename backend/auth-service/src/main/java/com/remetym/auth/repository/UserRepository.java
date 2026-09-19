package com.remetym.auth.repository;

import com.remetym.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByUserId(String userId);
    List<User> findByRoleIgnoreCaseAndStatusIgnoreCase(String role, String status);
    List<User> findByRoleIgnoreCaseAndDistrictIdIgnoreCaseAndStatusIgnoreCase(String role, String districtId, String status);
    List<User> findByRoleIgnoreCaseAndDistrictNameIgnoreCaseAndStatusIgnoreCase(String role, String districtName, String status);
    long countByRoleAndStatus(String role, String status);
    long countByStatus(String status);
}
