package com.pissir.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChargingRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long placeId;
    private String targa;
    private int desiredPercent;
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED
    private LocalDateTime requestedAt = LocalDateTime.now();

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }
    public String getTarga() { return targa; }
    public void setTarga(String targa) { this.targa = targa; }
    public int getDesiredPercent() { return desiredPercent; }
    public void setDesiredPercent(int desiredPercent) { this.desiredPercent = desiredPercent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
}
