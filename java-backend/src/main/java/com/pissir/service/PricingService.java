package com.pissir.service;

import org.springframework.stereotype.Service;

@Service
public class PricingService {
    private double costoOra = 1.5; // €/ora
    private double costoKw = 0.25; // €/kW

    public double calcolaCostoSosta(double ore) {
        return costoOra * ore;
    }

    public double calcolaCostoRicarica(double kWh) {
        return costoKw * kWh;
    }
}
