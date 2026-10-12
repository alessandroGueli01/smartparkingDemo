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
        String username = u.getUsername() == null ? "" : u.getUsername().trim();
        String email = u.getEmail() == null ? "" : u.getEmail().trim().toLowerCase();
        if (username.isEmpty() || u.getPassword() == null || u.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }
        if (userRepository.findByUsernameIgnoreCase(username).isPresent() ||
                (!email.isEmpty() && userRepository.findByEmailIgnoreCase(email).isPresent())) {
            return ResponseEntity.status(409).body("Username or email already exists");
        }
        u.setUsername(username);
        u.setEmail(email.isEmpty() ? null : email);
        u.setTipo(u.getTipo() == null ? "base" : u.getTipo());
        User saved = userRepository.save(u);
        return ResponseEntity.ok(toSafeUser(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        String identifier = credentials.getUsername() == null ? "" : credentials.getUsername().trim();
        Optional<User> u = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier);
        if (u.isPresent() && u.get().getPassword() != null &&
                u.get().getPassword().equals(credentials.getPassword())) {
            String token = jwtUtil.generateToken(String.valueOf(u.get().getId()));
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("user", toSafeUser(u.get()));
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    private Map<String, Object> toSafeUser(User user) {
        Map<String, Object> safeUser = new HashMap<>();
        safeUser.put("id", user.getId());
        safeUser.put("username", user.getUsername());
        safeUser.put("tipo", user.getTipo());
        return safeUser;
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> u = userRepository.findById(id);
        if (u.isEmpty()) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
