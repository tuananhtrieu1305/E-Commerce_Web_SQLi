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
import com.backend.backend.repository.account.entity.AccountEntity;
import com.backend.backend.repository.account.entity.AdminEntity;
import com.backend.backend.repository.account.entity.UserEntity;
import com.backend.backend.repository.account.specification.AccountSpecification;
import com.backend.backend.repository.order.OrderRepository;
import com.backend.backend.service.account.AccountService;

import com.backend.backend.model.request.AccountCreateRequest;
import com.backend.backend.model.request.AccountUpdateRequest;
import com.backend.backend.utils.ImageUtil;
import com.backend.backend.utils.exception.DuplicateRecordException;
import com.backend.backend.utils.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
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

    @Transactional
    @Override
    public List<AccountDTO> getAccount(Map<String, Object> params) {
        AccountSearchBuilder builder = accountSearchBuilderConverter.paramsToBuilder(params);
        Specification<AccountEntity> spec = AccountSpecification.findByCriteria(builder);
        List<AccountEntity> entities = accountRepository.findAll(spec);

        if (entities.isEmpty()) {
            return List.of();
        }

        List<AccountDTO> accountDTOs = new ArrayList<>();
        for (AccountEntity entity : entities) {
            accountDTOs.add(accountDTOConverter.toAccountDTO(entity));
        }

        Set<Integer> userIds = new HashSet<>();
        for (AccountDTO dto : accountDTOs) {
            if ("USER".equals(dto.getRole()) && dto.getProfile() != null) {
                userIds.add(dto.getProfile().getId());
            }
        }

        if (userIds.isEmpty()) {
            return accountDTOs;
        }

        List<OrderStatsDTO> statsList = orderRepository.findOrderStatsByUserIds(userIds);

        Map<Integer, OrderStatsDTO> statsMap = new HashMap<>();
        for (OrderStatsDTO stats : statsList) {
            statsMap.put(stats.getUserId(), stats);
        }

        for (AccountDTO dto : accountDTOs) {
            if ("USER".equals(dto.getRole()) && dto.getProfile() != null) {
                OrderStatsDTO stats = statsMap.get(dto.getProfile().getId());
                if (stats != null) {
                    dto.setOrderCount(stats.getOrderCount().intValue());
                    dto.setTotalOrderPrice(stats.getTotalAmount() != null ? stats.getTotalAmount().intValue() : 0);
                }
            }
        }

        return accountDTOs;
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
        // ✅ SECURE: Soft Delete — đánh dấu deleted=true thay vì xóa vĩnh viễn
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
        account.setDeleted(true);
        account.setUpdated_at(LocalDateTime.now());
        accountRepository.save(account);
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
    // ✅ SECURE: Methods chấp nhận validated DTO (đã qua @Pattern/@Valid)
    // ============================================================

    @Override
    @Transactional
    public AccountDTO createAccountFromRequest(AccountCreateRequest request) {
        if (accountRepository.existsByUsernameAndDeletedFalse(request.getUsername())) {
            throw new DuplicateRecordException("Username '" + request.getUsername() + "' already existed!");
        }
        if (accountRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateRecordException("Email '" + request.getEmail() + "' already existed!");
        }

        AccountEntity entity = new AccountEntity();
        entity.setUsername(request.getUsername());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setEmail(request.getEmail());
        entity.setRole(request.getRole().toUpperCase());
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

    @Override
    @Transactional
    public List<AccountDTO> createListAccountsFromRequest(List<AccountCreateRequest> requestList) {
        List<AccountEntity> entities = new ArrayList<>();

        for (AccountCreateRequest request : requestList) {
            String username = request.getUsername();
            String email = request.getEmail();

            Optional<AccountEntity> existingAccountOpt = accountRepository.findByEmailIncludeDeleted(email);

            if (existingAccountOpt.isPresent()) {
                AccountEntity existingAccount = existingAccountOpt.get();
                if (existingAccount.getDeleted()) {
                    existingAccount.setUsername(username);
                    existingAccount.setPassword(passwordEncoder.encode(request.getPassword()));
                    existingAccount.setRole(request.getRole().toUpperCase());
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
                account.setRole(request.getRole().toUpperCase());
                account.setCreated_at(LocalDateTime.now());
                account.setUpdated_at(LocalDateTime.now());
                account.setPassword(passwordEncoder.encode(request.getPassword()));

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

    @Override
    @Transactional
    public AccountDTO updateAccountFromRequest(Integer id, AccountUpdateRequest request) {
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));

        if (request.getUsername() != null) {
            account.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            account.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            account.setRole(request.getRole());
        }
        account.setUpdated_at(LocalDateTime.now());

        if ("USER".equals(account.getRole())) {
            UserEntity user = account.getUser();
            if (user == null) {
                user = new UserEntity();
                user.setAccount(account);
            }
            if (request.getFullname() != null) {
                user.setFullname(request.getFullname());
            }
            if (request.getAddress() != null) {
                user.setAddress(request.getAddress());
            }
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                String imagePath = ImageUtil.saveImage(request.getImage());
                user.setImage(imagePath);
            }
            userRepository.save(user);
        } else if ("ADMIN".equals(account.getRole())) {
            AdminEntity admin = account.getAdmin();
            if (admin == null) {
                admin = new AdminEntity();
                admin.setAccount(account);
            }
            if (request.getFullname() != null) {
                admin.setFullname(request.getFullname());
            }
            if (request.getAddress() != null) {
                admin.setAddress(request.getAddress());
            }
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                String imagePath = ImageUtil.saveImage(request.getImage());
                admin.setImage(imagePath);
            }
            adminRepository.save(admin);
        }

        accountRepository.save(account);
        return accountDTOConverter.toAccountDTO(account);
    }
}