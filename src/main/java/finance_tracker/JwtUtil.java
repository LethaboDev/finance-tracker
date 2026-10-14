package finance_tracker;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil
{

    @Value("${jwt.secret}")
    private String secretKey;

    private Key key;

    @jakarta.annotation.PostConstruct
    public void init()
    {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    private final long EXPIRATION = 1000 * 60 * 60 * 24;

    public String generateToken(String email)
    {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token)
    {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token)
    {
        try
        {
            getClaims(token);
            return true;
        }
        catch (Exception e)
        {
            return false;
        }
    }

    private Claims getClaims(String token)
    {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}