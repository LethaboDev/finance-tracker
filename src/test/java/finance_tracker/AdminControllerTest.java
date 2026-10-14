package finance_tracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AdminControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private ObjectMapper objectMapper;

    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        transactionRepository.deleteAll();
        userRepository.deleteAll();

        User admin = new User();
        admin.setFullName("Admin User");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("AdminPass123"));
        admin.setRole("ADMIN");
        userRepository.save(admin);
        adminToken = jwtUtil.generateToken("admin@example.com");

        userToken = registerAndGetToken("regular@example.com");
    }

    private String registerAndGetToken(String email) throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Regular User",
                        "email", email,
                        "password", "Password123"
                )))).andExpect(status().isOk());

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", email,
                        "password", "Password123"
                )))).andReturn();

        return (String) objectMapper.readValue(result.getResponse().getContentAsString(), Map.class).get("token");
    }

    @Test
    void getUsers_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUsers_asRegularUser_returns403() throws Exception {
        mockMvc.perform(get("/admin/users")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUsers_asAdmin_returnsAllUsers() throws Exception {
        mockMvc.perform(get("/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].email", hasItems("admin@example.com", "regular@example.com")));
    }

    @Test
    void getUsers_includesTransactionCount() throws Exception {
        mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "Salary", "amount", 1000.0, "type", "INCOME", "category", "Work"
                )))).andExpect(status().isOk());

        mockMvc.perform(get("/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'regular@example.com')].transactionCount", contains(1)));
    }

    @Test
    void getTransactions_asAdmin_returnsAllTransactions() throws Exception {
        mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "Coffee", "amount", 5.0, "type", "EXPENSE", "category", "Food"
                )))).andExpect(status().isOk());

        mockMvc.perform(get("/admin/transactions")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Coffee"))
                .andExpect(jsonPath("$[0].userEmail").value("regular@example.com"));
    }

    @Test
    void getTransactions_asRegularUser_returns403() throws Exception {
        mockMvc.perform(get("/admin/transactions")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getStats_asAdmin_returnsCorrectStats() throws Exception {
        mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "Salary", "amount", 3000.0, "type", "INCOME", "category", "Work"
                )))).andExpect(status().isOk());

        mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "Rent", "amount", 1000.0, "type", "EXPENSE", "category", "Housing"
                )))).andExpect(status().isOk());

        mockMvc.perform(get("/admin/stats")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(2))
                .andExpect(jsonPath("$.totalTransactions").value(2))
                .andExpect(jsonPath("$.totalIncome").value(3000.0))
                .andExpect(jsonPath("$.totalExpenses").value(1000.0))
                .andExpect(jsonPath("$.netBalance").value(2000.0));
    }

    @Test
    void deleteUser_asAdmin_deletesUserAndTheirTransactions() throws Exception {
        mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "To be deleted", "amount", 100.0, "type", "INCOME", "category", "Work"
                )))).andExpect(status().isOk());

        User target = userRepository.findByEmail("regular@example.com").orElseThrow();

        mockMvc.perform(delete("/admin/users/" + target.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User and their transactions deleted"));

        mockMvc.perform(get("/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("admin@example.com"));
    }

    @Test
    void deleteUser_adminCannotDeleteSelf_returns400() throws Exception {
        User admin = userRepository.findByEmail("admin@example.com").orElseThrow();

        mockMvc.perform(delete("/admin/users/" + admin.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot delete your own account"));
    }

    @Test
    void deleteUser_nonExistentUser_returns404() throws Exception {
        mockMvc.perform(delete("/admin/users/99999")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUser_asRegularUser_returns403() throws Exception {
        User target = userRepository.findByEmail("regular@example.com").orElseThrow();

        mockMvc.perform(delete("/admin/users/" + target.getId())
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }
}
