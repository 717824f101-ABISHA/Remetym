package com.remetym.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

@Component
public class JwtAuthGatewayFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret:RemeTymSuperSecretKeyForJwtAuthenticationTokenVerification2026!}")
    private String jwtSecret;

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/",
            "/health",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/users/active-phcs",
            "/api/users/phcs",
            "/api/phcs"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Skip JWT validation for OPTIONS preflight requests and public auth endpoints
        if ("OPTIONS".equalsIgnoreCase(request.getMethod().name()) || isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        // 2. Validate Authorization header on protected endpoints
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = validateToken(token);
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-User-Email");
                        h.remove("X-User-Role");
                        h.remove("X-User-Id");
                    })
                    .header("X-User-Email", claims.getSubject())
                    .header("X-User-Role", String.valueOf(claims.get("role")))
                    .header("X-User-Id", String.valueOf(claims.get("userId")))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } catch (Exception e) {
            return onError(exchange, "Invalid or Expired Token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    private boolean isPublicEndpoint(String path) {
        if (path == null) return false;
        return PUBLIC_ENDPOINTS.stream().anyMatch(p -> path.equalsIgnoreCase(p) || path.startsWith(p));
    }

    private Claims validateToken(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
