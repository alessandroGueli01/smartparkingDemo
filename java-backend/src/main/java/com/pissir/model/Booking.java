package com.pissir.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long placeId;
    private String targa;
    private LocalDateTime orarioArrivo;
    private int durataMinuti;
    private LocalDateTime createdAt = LocalDateTime.now();

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }
    public String getTarga() { return targa; }
    public void setTarga(String targa) { this.targa = targa; }
    public LocalDateTime getOrarioArrivo() { return orarioArrivo; }
    public void setOrarioArrivo(LocalDateTime orarioArrivo) { this.orarioArrivo = orarioArrivo; }
    public int getDurataMinuti() { return durataMinuti; }
    public void setDurataMinuti(int durataMinuti) { this.durataMinuti = durataMinuti; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
