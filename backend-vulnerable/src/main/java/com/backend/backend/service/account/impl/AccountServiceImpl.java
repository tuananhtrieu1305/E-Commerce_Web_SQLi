package com.backend.backend.service.account.impl;

import com.backend.backend.builder.account.AccountSearchBuilder;
import com.backend.backend.converter.account.AccountDTOConverter;
import com.backend.backend.converter.account.AccountSearchBuilderConverter;
import com.backend.backend.model.account.UserListDTO;
import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.order.OrderStatsDTO;
import com.backend.backend.repository.account.AccountRepository;
import com.backend.backend.repository.account.AdminRepository;
import com.backend.backend.repository.account.UserRepository;
import com.backend.backend.repository.account.custom.AccountRepositoryCustom;
import com.backend.backend.repository.account.entity.AccountEntity;
import com.backend.backend.repository.account.entity.AdminEntity;
import com.backend.backend.repository.account.entity.UserEntity;
import com.backend.backend.repository.order.OrderRepository;
import com.backend.backend.service.account.AccountService;

import com.backend.backend.utils.ImageUtil;
import com.backend.backend.utils.exception.DuplicateRecordException;
import com.backend.backend.utils.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountSearchBuilderConverter accountSearchBuilderConverter;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountDTOConverter accountDTOConverter;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AccountRepositoryCustom accountRepositoryCustom;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    @Override
    public List<AccountDTO> getAccount(Map<String, Object> params) {
        // ❌ VULNERABLE: Dùng AccountRepositoryCustom (string concatenation)
        // → Boolean-based Blind SQLi
        AccountSearchBuilder builder = accountSearchBuilderConverter.paramsToBuilder(params);
        return accountRepositoryCustom.getAccount(builder);
    }

    @Transactional
    @Override
    public AccountDTO createAccount(Map<String, Object> body) {
        AccountSearchBuilder accountSearchBuilder = accountSearchBuilderConverter.bodyToBuilderCreate(body);

        if (accountRepository.existsByUsernameAndDeletedFalse(accountSearchBuilder.getUsername())) {
            throw new DuplicateRecordException("Username '" + accountSearchBuilder.getUsername() + "' already " +
                    "existed!");
        }
        if (accountRepository.existsByEmailAndDeletedFalse(accountSearchBuilder.getEmail())) {
            throw new DuplicateRecordException("Email '" + accountSearchBuilder.getEmail() + "' already existed!");
        }


        AccountEntity entity = new AccountEntity();

        entity.setUsername(accountSearchBuilder.getUsername());
        String rawPassword = accountSearchBuilder.getPassword();
        entity.setPassword(passwordEncoder.encode(rawPassword));
        entity.setEmail(accountSearchBuilder.getEmail());
        entity.setRole(accountSearchBuilder.getRole());
        entity.setCreated_at(LocalDateTime.now());
        entity.setUpdated_at(LocalDateTime.now());

        AccountEntity saved = accountRepository.save(entity);

        if ("USER".equalsIgnoreCase(saved.getRole())) {
            UserEntity user = new UserEntity();
            user.setAccount(saved);
            userRepository.save(user);
        } else if ("ADMIN".equalsIgnoreCase(saved.getRole())) {
            AdminEntity admin = new AdminEntity();
            admin.setAccount(saved);
            adminRepository.save(admin);
        }

        return accountDTOConverter.toAccountDTO(saved);
    }

    @Transactional
    @Override
    public List<AccountDTO> createListAccounts(List<Map<String, Object>> bodyList) {
        List<AccountEntity> entities = new ArrayList<>();

        for (Map<String, Object> body : bodyList) {
            AccountSearchBuilder accountSearchBuilder = accountSearchBuilderConverter.bodyToBuilderCreate(body);
            String username = accountSearchBuilder.getUsername();
            String email = accountSearchBuilder.getEmail();

            Optional<AccountEntity> existingAccountOpt = accountRepository.findByEmailIncludeDeleted(email);

            if (existingAccountOpt.isPresent()) {
                AccountEntity existingAccount = existingAccountOpt.get();
                if (existingAccount.getDeleted()) {
                    existingAccount.setUsername(username);
                    existingAccount.setPassword(passwordEncoder.encode(accountSearchBuilder.getPassword()));
                    existingAccount.setRole(accountSearchBuilder.getRole().toUpperCase());
                    existingAccount.setDeleted(false);
                    existingAccount.setUpdated_at(LocalDateTime.now());
                    entities.add(existingAccount);
                } else {
                    throw new DuplicateRecordException("Email '" + email + "' already existed!");
                }
            } else {
                if (accountRepository.existsByUsernameAndDeletedFalse(username)) {
                    throw new DuplicateRecordException("Username '" + username + "' already existed!");
                }
                AccountEntity account = new AccountEntity();
                account.setUsername(username);
                account.setEmail(email);
                account.setRole(accountSearchBuilder.getRole());
                account.setCreated_at(LocalDateTime.now());
                account.setUpdated_at(LocalDateTime.now());
                account.setPassword(passwordEncoder.encode(accountSearchBuilder.getPassword()));

                if ("USER".equalsIgnoreCase(account.getRole())) {
                    UserEntity user = new UserEntity();
                    user.setAccount(account);
                    account.setUser(user);
                } else if ("ADMIN".equalsIgnoreCase(account.getRole())) {
                    AdminEntity admin = new AdminEntity();
                    admin.setAccount(account);
                    account.setAdmin(admin);
                }
                entities.add(account);
            }
        }

        List<AccountEntity> savedEntities = accountRepository.saveAll(entities);

        List<AccountDTO> resultDTOs = new ArrayList<>();
        for (AccountEntity savedEntity : savedEntities) {
            resultDTOs.add(accountDTOConverter.toAccountDTO(savedEntity));
        }
        return resultDTOs;
    }

    @Transactional
    @Override
    public AccountDTO updateAccount(Integer id, Map<String, Object> body) {
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        AccountSearchBuilder accountSearchBuilder = accountSearchBuilderConverter.bodyToBuilderUpdate(body);
        account.setUsername(accountSearchBuilder.getUsername());
        account.setEmail(accountSearchBuilder.getEmail());
        account.setRole(accountSearchBuilder.getRole());
        account.setUpdated_at(LocalDateTime.now());

        if ("USER".equals(account.getRole())) {
            UserEntity user = account.getUser();
            if (user == null) {
                user = new UserEntity();
                user.setAccount(account);
            }
            user.setFullname(accountSearchBuilder.getFullname());
            user.setAddress(accountSearchBuilder.getAddress());
            if (accountSearchBuilder.getImage() != null) {
                String base64Image = accountSearchBuilder.getImage();
                if (base64Image != null && !base64Image.isEmpty()) {
                    String imagePath = ImageUtil.saveImage(base64Image);
                    user.setImage(imagePath);
                }
            }
            userRepository.save(user);

        } else if ("ADMIN".equals(account.getRole())) {
            AdminEntity admin = account.getAdmin();
            if (admin == null) {
                admin = new AdminEntity();
                admin.setAccount(account);
            }
            admin.setFullname(accountSearchBuilder.getFullname());
            admin.setAddress(accountSearchBuilder.getAddress());
            if (accountSearchBuilder.getImage() != null) {
                String base64Image = accountSearchBuilder.getImage();
                if (base64Image != null && !base64Image.isEmpty()) {
                    String imagePath = ImageUtil.saveImage(base64Image);
                    admin.setImage(imagePath);
                }
            }
            adminRepository.save(admin);
        }

        accountRepository.save(account);
        return accountDTOConverter.toAccountDTO(account);
    }

    @Transactional
    @Override
    public void deleteAccount(Integer id) {
        if (!accountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Account not found with ID: " + id);
        }
        accountRepository.deleteById(id);
    }

    @Transactional
    @Override
    public List<UserListDTO> getUserList() {
        List<UserEntity> users = userRepository.findAll();
        List<UserListDTO> res = new ArrayList<>();
        for(UserEntity user : users) {
            UserListDTO userListDTO = new UserListDTO();
            userListDTO.setId(user.getId());
            userListDTO.setName(user.getFullname());
            userListDTO.setAddress(user.getAddress());
            res.add(userListDTO);
        }
        return res;
    }

    // ============================================================
    // ❌ SECOND-ORDER SQLi
    // Lấy fullname từ DB (tưởng an toàn), rồi cộng chuỗi vào query mới
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAccountReport(Integer accountId) {
        // Bước 1: Lấy user entity từ DB
        AccountEntity account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        UserEntity user = account.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User profile not found for account ID: " + accountId);
        }

        // Lấy fullname từ DB (đã lưu trước đó qua Prepared Statement → tưởng an toàn)
        String fullname = user.getFullname();

        // ❌ Bước 2: Cộng chuỗi từ DB vào native query mới → SECOND-ORDER SQLi!
        String sql = "SELECT o.id, o.total_cost, o.address, o.created_at, u.fullname " +
                     "FROM orders o JOIN users u ON o.user_id = u.id " +
                     "WHERE u.fullname LIKE '%" + fullname + "%'";

        Query query = entityManager.createNativeQuery(sql);
        List<Object[]> results = query.getResultList();

        List<Map<String, Object>> report = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("order_id", row[0]);
            item.put("total_cost", row[1]);
            item.put("address", row[2]);
            item.put("created_at", row[3]);
            item.put("customer_name", row[4]);
            report.add(item);
        }
        return report;
    }
}