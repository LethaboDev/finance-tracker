package finance_tracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController
{

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request)
    {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String password = request.get("password");

        return authService.register(fullName, email, password);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request)
    {
        String email = request.get("email");
        String password = request.get("password");

        return authService.login(email, password);
    }
}