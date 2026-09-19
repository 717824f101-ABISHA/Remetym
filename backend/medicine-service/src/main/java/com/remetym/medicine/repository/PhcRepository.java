package com.remetym.medicine.repository;

import com.remetym.medicine.model.Phc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhcRepository extends MongoRepository<Phc, String> {
    Optional<Phc> findByPhcId(String phcId);
    Optional<Phc> findByPhcNameIgnoreCase(String phcName);
}
