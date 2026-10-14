package finance_tracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController
{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private boolean isAdmin(java.security.Principal principal)
    {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        return user != null && "ADMIN".equals(user.getRole());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(java.security.Principal principal)
    {
        if (!isAdmin(principal))
        {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("transactionCount", transactionRepository.findByUser(u).size());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions(java.security.Principal principal)
    {
        if (!isAdmin(principal))
        {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        List<Transaction> all = transactionRepository.findAll();
        List<Map<String, Object>> result = all.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("description", t.getDescription());
            map.put("amount", t.getAmount());
            map.put("category", t.getCategory());
            map.put("type", t.getType());
            map.put("createdAt", t.getCreatedAt());
            map.put("userEmail", t.getUser().getEmail());
            map.put("userName", t.getUser().getFullName());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(java.security.Principal principal)
    {
        if (!isAdmin(principal))
        {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        List<User> users = userRepository.findAll();
        List<Transaction> transactions = transactionRepository.findAll();

        double totalIncome = transactions.stream()
                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpenses = transactions.stream()
                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("totalTransactions", transactions.size());
        stats.put("totalIncome", totalIncome);
        stats.put("totalExpenses", totalExpenses);
        stats.put("netBalance", totalIncome - totalExpenses);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        java.security.Principal principal)
    {
        if (!isAdmin(principal))
        {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        User target = userRepository.findById(id).orElse(null);
        if (target == null)
        {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }

        User admin = userRepository.findByEmail(principal.getName()).orElse(null);
        if (admin != null && admin.getId().equals(id))
        {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Cannot delete your own account");
            return ResponseEntity.status(400).body(error);
        }

        transactionRepository.deleteAll(transactionRepository.findByUser(target));
        userRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User and their transactions deleted");
        return ResponseEntity.ok(response);
    }
}