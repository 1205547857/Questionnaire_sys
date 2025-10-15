package org.fofen1.questionnaire.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.fofen1.questionnaire.entity.LoginRequest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

//@SpringBootTest
public class JwtUtil {
    private static final String SECRET_STRING="06002a39-5c45-4a9f-ba76-03cf92c1d873";
    private static final SecretKey SECRET_KEY= Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    //生成token
    public String generateToken(String json) {
        JwtBuilder builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1200 * 1000))
                .signWith(SECRET_KEY)
                .claim("content", json);
        return builder.compact();
    }
    //解析token
    public Claims parseToken(String token) {
        JwtParser parser = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build();
        return parser.parseSignedClaims(token).getPayload();

    }
}
