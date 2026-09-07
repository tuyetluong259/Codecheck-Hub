package com.codecheckhub.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;

import javax.crypto.SecretKey;

@Component
@Slf4j
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private ReactiveStringRedisTemplate redisTemplate;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorized(exchange, "Missing or invalid Authorization header");
            }

            try {
                String token = authHeader.substring(7);
                Claims claims = validateToken(token);
                String userId = claims.get("userId", String.class);

                return redisTemplate.hasKey("blacklist:user:" + userId)
                        .flatMap(isBlacklisted -> {
                            if (Boolean.TRUE.equals(isBlacklisted)) {
                                return unauthorized(exchange, "Tài khoản của bạn đã bị khóa");
                            }
                            
                            // Forward user info trong header đến downstream service
                            ServerWebExchange mutatedExchange = exchange.mutate()
                                    .request(r -> r.header("X-User-Id", userId)
                                            .header("X-User-Email", claims.getSubject())
                                            .header("X-User-Role", claims.get("role", String.class)))
                                    .build();
            
                            return chain.filter(mutatedExchange);
                        });
            } catch (Exception e) {
                log.error("JWT validation failed: {}", e.getMessage());
                return unauthorized(exchange, "Invalid or expired token");
            }
        };
    }

    private Claims validateToken(String token) {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        org.springframework.http.server.reactive.ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        String body = "{\"message\":\"" + message + "\"}";
        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        org.springframework.core.io.buffer.DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {}
}
