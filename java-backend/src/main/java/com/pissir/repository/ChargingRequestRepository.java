package com.pissir.repository;

import com.pissir.model.ChargingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChargingRequestRepository extends JpaRepository<ChargingRequest, Long> {
    List<ChargingRequest> findByStatusOrderByRequestedAt(String status);
}
