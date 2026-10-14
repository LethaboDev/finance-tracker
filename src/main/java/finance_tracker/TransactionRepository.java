package finance_tracker;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long>
{
    List<Transaction> findByUser(User user);
    List<Transaction> findByUserAndCategory(User user, String category);
    List<Transaction> findByUserAndType(User user, String type);
}