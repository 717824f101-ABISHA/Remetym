package com.remetym.transfer.repository;

import com.remetym.transfer.model.TransferRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransferRequestRepository extends MongoRepository<TransferRequest, String> {
    Optional<TransferRequest> findByRequestId(String requestId);
    List<TransferRequest> findByDistrictId(String districtId);
    List<TransferRequest> findByDistrictIdOrDistrictName(String districtId, String districtName);
    List<TransferRequest> findBySourcePhcIdOrDestPhcId(String sourcePhcId, String destPhcId);
    List<TransferRequest> findByDestPhcIdOrDestPhcName(String destPhcId, String destPhcName);
}
