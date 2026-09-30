package com.pissir.model;

import jakarta.persistence.*;

@Entity
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private boolean prenotabile = true;
    private boolean occupato = false;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public boolean isPrenotabile() { return prenotabile; }
    public void setPrenotabile(boolean prenotabile) { this.prenotabile = prenotabile; }
    public boolean isOccupato() { return occupato; }
    public void setOccupato(boolean occupato) { this.occupato = occupato; }
}
