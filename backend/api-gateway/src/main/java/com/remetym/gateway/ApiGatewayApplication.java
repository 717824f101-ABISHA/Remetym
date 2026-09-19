package com.remetym.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @GetMapping("/")
    public Mono<Map<String, Object>> rootEndpoint() {
        return Mono.just(Map.of(
            "status", "UP",
            "service", "RemeTym Spring Boot API Gateway",
            "port", 8080,
            "architecture", "Oracle (USERS/Auth) + MongoDB (Inventory/Medicine)",
            "health", "http://localhost:8080/health"
        ));
    }

    @GetMapping("/health")
    public Mono<Map<String, Object>> healthCheck() {
        return Mono.just(Map.of(
            "status", "UP",
            "service", "API Gateway",
            "port", 8080
        ));
    }
}
