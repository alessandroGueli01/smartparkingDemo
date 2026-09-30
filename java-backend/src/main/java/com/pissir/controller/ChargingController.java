package com.pissir.controller;

import com.pissir.model.ChargingRequest;
import com.pissir.model.Payment;
import com.pissir.repository.ChargingRequestRepository;
import com.pissir.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/charging")
public class ChargingController {
    private final ChargingRequestRepository chargingRepo;
    private final PaymentRepository paymentRepository;

    public ChargingController(ChargingRequestRepository chargingRepo, PaymentRepository paymentRepository) {
        this.chargingRepo = chargingRepo;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestCharging(@RequestBody ChargingRequest req) {
        req.setStatus("PENDING");
        ChargingRequest saved = chargingRepo.save(req);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/queue")
    public List<ChargingRequest> queue() { return chargingRepo.findByStatusOrderByRequestedAt("PENDING"); }

    @GetMapping("/history/user/{userId}")
    public List<Payment> payments(@PathVariable Long userId) { return paymentRepository.findByUserId(userId); }
}
