package com.pissir.service;

import com.pissir.model.ChargingRequest;
import com.pissir.model.Payment;
import com.pissir.repository.ChargingRequestRepository;
import com.pissir.repository.PaymentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class SchedulerService {
    private final ChargingRequestRepository chargingRepo;
    private final MQTTService mqttService;
    private final PaymentRepository paymentRepository;
    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);
    private final PricingService pricingService;

    public SchedulerService(ChargingRequestRepository chargingRepo, MQTTService mqttService, PaymentRepository paymentRepository, PricingService pricingService) {
        this.chargingRepo = chargingRepo;
        this.mqttService = mqttService;
        this.paymentRepository = paymentRepository;
        this.pricingService = pricingService;
    }

    // Every 10 seconds assign the next pending charging request to MWbot
    @Scheduled(fixedDelay = 10000)
    public void assignNextCharging() {
        List<ChargingRequest> pending = chargingRepo.findByStatusOrderByRequestedAt("PENDING");
        if (pending.isEmpty()) return;
        ChargingRequest next = pending.get(0);
        next.setStatus("IN_PROGRESS");
        chargingRepo.save(next);

        // Notify MWbot via MQTT which request to serve
        String payload = String.format("ASSIGN:%d|user:%d|place:%d|targa:%s|desired:%d", next.getId(), next.getUserId(), next.getPlaceId(), next.getTarga(), next.getDesiredPercent());
        mqttService.publish("pissir/mwbot/assign", payload);

        // Simulate progressive charging asynchronously
        executor.submit(() -> {
            try {
                int steps = 5;
                for (int i = 1; i <= steps; i++) {
                    int percent = (i * 100) / steps;
                    String progressMsg = String.format("ChargingProgress:%d|%d%%", next.getId(), percent);
                    mqttService.publish("pissir/mwbot/progress", progressMsg);
                    TimeUnit.SECONDS.sleep(2);
                }

                // mark completed
                ChargingRequest finished = chargingRepo.findById(next.getId()).orElse(next);
                finished.setStatus("COMPLETED");
                chargingRepo.save(finished);

                // Create a payment record with pricing calculation
                double assumedKwh = 10.0; // demo assumption
                double amount = pricingService.calcolaCostoRicarica(assumedKwh);
                Payment p = new Payment();
                p.setUserId(next.getUserId());
                p.setAmount(amount);
                p.setType("RICARICA");
                paymentRepository.save(p);

                mqttService.publish("pissir/notifications", "ChargingCompleted:" + next.getId());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception ex) {
                System.err.println("Error in charging simulation: " + ex.getMessage());
            }
        });
    }
}
