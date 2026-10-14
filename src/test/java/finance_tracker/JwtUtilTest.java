package finance_tracker;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String SECRET = "test-secret-key-that-is-long-enough-for-hmac-signing";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", SECRET);
        jwtUtil.init();
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken("user@example.com");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateToken_tokenHasThreeParts() {
        String token = jwtUtil.generateToken("user@example.com");
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String email = "user@example.com";
        String token = jwtUtil.generateToken(email);
        assertEquals(email, jwtUtil.extractEmail(token));
    }

    @Test
    void extractEmail_differentUsersProduceDifferentTokens() {
        String token1 = jwtUtil.generateToken("alice@example.com");
        String token2 = jwtUtil.generateToken("bob@example.com");
        assertNotEquals(token1, token2);
        assertEquals("alice@example.com", jwtUtil.extractEmail(token1));
        assertEquals("bob@example.com", jwtUtil.extractEmail(token2));
    }

    @Test
    void isTokenValid_returnsTrueForFreshToken() {
        String token = jwtUtil.generateToken("user@example.com");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_returnsFalseForTamperedSignature() {
        String token = jwtUtil.generateToken("user@example.com");
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";
        assertFalse(jwtUtil.isTokenValid(tampered));
    }

    @Test
    void isTokenValid_returnsFalseForGarbageString() {
        assertFalse(jwtUtil.isTokenValid("not.a.valid.jwt"));
    }

    @Test
    void isTokenValid_returnsFalseForEmptyString() {
        assertFalse(jwtUtil.isTokenValid(""));
    }

    @Test
    void extractEmail_throwsForInvalidToken() {
        assertThrows(Exception.class, () -> jwtUtil.extractEmail("garbage.token.value"));
    }
}
