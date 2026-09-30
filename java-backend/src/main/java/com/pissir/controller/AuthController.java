package com.pissir.controller;

import com.pissir.model.User;
import com.pissir.repository.UserRepository;
import com.pissir.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User u) {
        Optional<User> existing = userRepository.findByUsername(u.getUsername());
        if (existing.isPresent()) return ResponseEntity.badRequest().body("Username already exists");
        u.setTipo(u.getTipo() == null ? "base" : u.getTipo());
        User saved = userRepository.save(u);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        Optional<User> u = userRepository.findByUsername(credentials.getUsername());
        if (u.isPresent() && u.get().getPassword().equals(credentials.getPassword())) {
            String token = jwtUtil.generateToken(String.valueOf(u.get().getId()));
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("user", u.get());
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> u = userRepository.findById(id);
        if (u.isEmpty()) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
