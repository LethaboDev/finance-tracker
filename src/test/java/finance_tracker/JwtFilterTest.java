package finance_tracker;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;

    @InjectMocks
    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void noAuthHeader_continuesChainWithoutAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void nonBearerHeader_continuesChainWithoutAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void validToken_setsAuthenticationAndContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
        when(jwtUtil.extractEmail("valid.token.here")).thenReturn("user@example.com");
        when(jwtUtil.isTokenValid("valid.token.here")).thenReturn(true);

        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("user@example.com", SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    @Test
    void expiredToken_doesNotThrow_continuesChainWithoutAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer expired.token.here");
        when(jwtUtil.extractEmail("expired.token.here")).thenThrow(new RuntimeException("Token expired"));

        assertDoesNotThrow(() -> jwtFilter.doFilterInternal(request, response, filterChain));
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void tokenFailsValidation_noAuthenticationSet() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer bad.token.here");
        when(jwtUtil.extractEmail("bad.token.here")).thenReturn("user@example.com");
        when(jwtUtil.isTokenValid("bad.token.here")).thenReturn(false);

        jwtFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void validToken_doesNotOverwriteExistingAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
        when(jwtUtil.extractEmail("valid.token.here")).thenReturn("user@example.com");

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken existing =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "existing@example.com", null, new java.util.ArrayList<>());
        SecurityContextHolder.getContext().setAuthentication(existing);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertEquals("existing@example.com",
                SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }
}
