package finance_tracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class TransactionControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void corsPreflight_allowsConfiguredFrontend() throws Exception {
        mockMvc.perform(options("/transactions")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    @Test
    void corsPreflight_rejectsUnconfiguredFrontend() throws Exception {
        mockMvc.perform(options("/transactions")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    private String registerAndGetToken(String email) throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Test User",
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

    private String createTransaction(String token, String description, double amount, String type, String category) throws Exception {
        MvcResult result = mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", description,
                        "amount", amount,
                        "type", type,
                        "category", category
                ))))
                .andExpect(status().isOk())
                .andReturn();
        Map<?, ?> body = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return String.valueOf(((Number) body.get("id")).longValue());
    }

    @Test
    void getTransactions_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/transactions"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createTransaction_withAuth_returns200WithTransactionData() throws Exception {
        String token = registerAndGetToken("user@example.com");

        mockMvc.perform(post("/transactions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "Salary",
                        "amount", 5000.0,
                        "type", "INCOME",
                        "category", "Work"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Salary"))
                .andExpect(jsonPath("$.amount").value(5000.0))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.category").value("Work"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void getTransactions_returnsOnlyCurrentUsersTransactions() throws Exception {
        String token1 = registerAndGetToken("user1@example.com");
        String token2 = registerAndGetToken("user2@example.com");

        createTransaction(token1, "User1 salary", 3000, "INCOME", "Work");
        createTransaction(token2, "User2 salary", 4000, "INCOME", "Work");

        mockMvc.perform(get("/transactions").header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("User1 salary"));
    }

    @Test
    void getBalance_incomeMinus_expenses() throws Exception {
        String token = registerAndGetToken("balance@example.com");

        createTransaction(token, "Salary", 5000, "INCOME", "Work");
        createTransaction(token, "Rent", 1500, "EXPENSE", "Housing");
        createTransaction(token, "Groceries", 300, "EXPENSE", "Food");

        mockMvc.perform(get("/transactions/balance").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("3200.0"));
    }

    @Test
    void getBalance_noTransactions_returnsZero() throws Exception {
        String token = registerAndGetToken("empty@example.com");

        mockMvc.perform(get("/transactions/balance").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("0.0"));
    }

    @Test
    void deleteTransaction_ownTransaction_deletesSuccessfully() throws Exception {
        String token = registerAndGetToken("delete@example.com");
        String id = createTransaction(token, "To delete", 100, "EXPENSE", "Other");

        mockMvc.perform(delete("/transactions/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/transactions").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void deleteTransaction_anotherUsersTransaction_doesNotDelete() throws Exception {
        String token1 = registerAndGetToken("owner@example.com");
        String token2 = registerAndGetToken("attacker@example.com");
        String id = createTransaction(token1, "Owner's transaction", 500, "INCOME", "Work");

        mockMvc.perform(delete("/transactions/" + id).header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk());

        // Transaction must still exist for owner
        mockMvc.perform(get("/transactions").header("Authorization", "Bearer " + token1))
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getByCategory_returnsMatchingTransactionsOnly() throws Exception {
        String token = registerAndGetToken("cat@example.com");

        createTransaction(token, "Coffee", 5, "EXPENSE", "Food");
        createTransaction(token, "Lunch", 15, "EXPENSE", "Food");
        createTransaction(token, "Bus pass", 40, "EXPENSE", "Transport");

        mockMvc.perform(get("/transactions/category/Food").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(get("/transactions/category/Transport").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Bus pass"));
    }

    @Test
    void getByType_returnsMatchingTransactionsOnly() throws Exception {
        String token = registerAndGetToken("type@example.com");

        createTransaction(token, "Salary", 3000, "INCOME", "Work");
        createTransaction(token, "Freelance", 500, "INCOME", "Work");
        createTransaction(token, "Rent", 1200, "EXPENSE", "Housing");

        mockMvc.perform(get("/transactions/type/INCOME").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(get("/transactions/type/EXPENSE").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void createTransaction_withoutAuth_returns403() throws Exception {
        mockMvc.perform(post("/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "description", "Unauthorized", "amount", 100.0, "type", "INCOME", "category", "Other"
                ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void expiredToken_returns403() throws Exception {
        mockMvc.perform(get("/transactions")
                .header("Authorization", "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalidsig"))
                .andExpect(status().isForbidden());
    }
}
