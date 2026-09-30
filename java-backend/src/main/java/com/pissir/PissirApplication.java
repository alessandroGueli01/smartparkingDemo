package com.pissir;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PissirApplication {
    public static void main(String[] args) {
        SpringApplication.run(PissirApplication.class, args);
    }
}
