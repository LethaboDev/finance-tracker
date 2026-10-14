package finance_tracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController
{

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(String email)
    {
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction,
                                      java.security.Principal principal)
    {
        User user = getCurrentUser(principal.getName());
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    @GetMapping
    public List<Transaction> getAllTransactions(java.security.Principal principal)
    {
        User user = getCurrentUser(principal.getName());
        return transactionRepository.findByUser(user);
    }

    @GetMapping("/category/{category}")
    public List<Transaction> getByCategory(@PathVariable String category,
                                           java.security.Principal principal)
    {
        User user = getCurrentUser(principal.getName());
        return transactionRepository.findByUserAndCategory(user, category);
    }

    @GetMapping("/type/{type}")
    public List<Transaction> getByType(@PathVariable String type,
                                       java.security.Principal principal)
    {
        User user = getCurrentUser(principal.getName());
        return transactionRepository.findByUserAndType(user, type);
    }

    @GetMapping("/balance")
    public Double getBalance(java.security.Principal principal)
    {
        User user = getCurrentUser(principal.getName());
        List<Transaction> all = transactionRepository.findByUser(user);

        double income = 0;
        double expenses = 0;

        for (Transaction t : all)
        {
            if (t.getType().equalsIgnoreCase("income"))
            {
                income += t.getAmount();
            }
            else if (t.getType().equalsIgnoreCase("expense"))
            {
                expenses += t.getAmount();
            }
        }

        return income - expenses;
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id,
                                  java.security.Principal principal)
    {
        User user = getCurrentUser(principal.getName());
        Transaction transaction = transactionRepository.findById(id).orElseThrow();
        if (transaction.getUser().getId().equals(user.getId()))
        {
            transactionRepository.deleteById(id);
        }
    }
}