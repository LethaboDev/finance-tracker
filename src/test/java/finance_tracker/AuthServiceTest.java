package finance_tracker;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_newUser_returns200WithTokenAndUserInfo() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("bcrypted");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtUtil.generateToken("new@example.com")).thenReturn("jwt-token");

        ResponseEntity<?> response = authService.register("John Doe", "new@example.com", "password");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("jwt-token", body.get("token"));
        assertEquals("John Doe", body.get("fullName"));
        assertEquals("new@example.com", body.get("email"));
    }

    @Test
    void register_duplicateEmail_returns400AndNeverSaves() {
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        ResponseEntity<?> response = authService.register("Jane", "taken@example.com", "password");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void register_passwordIsEncoded() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("plaintext")).thenReturn("bcrypted");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtUtil.generateToken(any())).thenReturn("token");

        authService.register("Alice", "alice@example.com", "plaintext");

        verify(passwordEncoder).encode("plaintext");
        verify(userRepository).save(argThat(u -> "bcrypted".equals(u.getPassword())));
    }

    @Test
    void login_validCredentials_returns200WithToken() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("bcrypted");
        user.setFullName("John");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "bcrypted")).thenReturn(true);
        when(jwtUtil.generateToken("user@example.com")).thenReturn("jwt-token");

        ResponseEntity<?> response = authService.login("user@example.com", "password");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("jwt-token", body.get("token"));
        assertEquals("user@example.com", body.get("email"));
        assertEquals("John", body.get("fullName"));
    }

    @Test
    void login_wrongPassword_returns400() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("bcrypted");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "bcrypted")).thenReturn(false);

        ResponseEntity<?> response = authService.login("user@example.com", "wrong");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void login_unknownEmail_returns400() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authService.login("nobody@example.com", "password");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(jwtUtil, never()).generateToken(any());
    }
}
