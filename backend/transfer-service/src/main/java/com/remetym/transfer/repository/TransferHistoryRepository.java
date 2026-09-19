package com.remetym.transfer.repository;

import com.remetym.transfer.model.TransferHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferHistoryRepository extends MongoRepository<TransferHistory, String> {
    List<TransferHistory> findByDistrictId(String districtId);
    List<TransferHistory> findByDistrictIdOrDistrictName(String districtId, String districtName);
    List<TransferHistory> findBySourcePhcIdOrDestPhcId(String sourcePhcId, String destPhcId);
    List<TransferHistory> findByDestPhcIdOrDestPhcName(String destPhcId, String destPhcName);
}
