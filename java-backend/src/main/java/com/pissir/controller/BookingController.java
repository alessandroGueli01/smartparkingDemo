package com.pissir.controller;

import com.pissir.model.Booking;
import com.pissir.model.Place;
import com.pissir.repository.BookingRepository;
import com.pissir.repository.PlaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingRepository bookingRepository;
    private final PlaceRepository placeRepository;

    public BookingController(BookingRepository bookingRepository, PlaceRepository placeRepository) {
        this.bookingRepository = bookingRepository;
        this.placeRepository = placeRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking b) {
        // check place availability
        Place p = placeRepository.findById(b.getPlaceId()).orElse(null);
        if (p == null || !p.isPrenotabile() || p.isOccupato()) return ResponseEntity.badRequest().body("Place not available");
        p.setOccupato(true);
        placeRepository.save(p);
        Booking saved = bookingRepository.save(b);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        Booking b = bookingRepository.findById(id).orElse(null);
        if (b == null) return ResponseEntity.notFound().build();
        Place p = placeRepository.findById(b.getPlaceId()).orElse(null);
        if (p != null) { p.setOccupato(false); placeRepository.save(p); }
        bookingRepository.delete(b);
        return ResponseEntity.ok("Cancelled");
    }

    @GetMapping("/user/{userId}")
    public List<Booking> byUser(@PathVariable Long userId) { return bookingRepository.findByUserId(userId); }
}
