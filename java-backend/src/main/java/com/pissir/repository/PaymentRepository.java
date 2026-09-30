package com.pissir.repository;

import com.pissir.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    List<Payment> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
