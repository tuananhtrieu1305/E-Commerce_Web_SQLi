package com.backend.backend.api;

import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.account.UserListDTO;
import com.backend.backend.model.request.AccountCreateRequest;
import com.backend.backend.model.request.AccountUpdateRequest;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.account.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountAPI {

    @Autowired
    private AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAccount(@RequestParam Map<String, Object> params) {
        List<AccountDTO> accounts = accountService.getAccount(params);
        return ResponseEntity.ok(ApiResponse.success(accounts, "Get accounts succeeded!"));
    }

    // ✅ SECURE: @Valid → kích hoạt @Pattern allow-list validation trên DTO
    @PostMapping
    public ResponseEntity<ApiResponse<AccountDTO>> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {
        AccountDTO newAccount = accountService.createAccountFromRequest(request);
        ApiResponse<AccountDTO> response = ApiResponse.success(newAccount, "Create account succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> createListAccounts(
            @Valid @RequestBody List<AccountCreateRequest> requestList) {
        List<AccountDTO> newAccounts = accountService.createListAccountsFromRequest(requestList);
        ApiResponse<List<AccountDTO>> response = ApiResponse.success(newAccounts, "Create accounts succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ✅ SECURE: @Valid → kích hoạt @Pattern allow-list validation trên DTO
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountDTO>> updateAccount(
            @PathVariable Integer id,
            @Valid @RequestBody AccountUpdateRequest request) {
        AccountDTO updatedAccount = accountService.updateAccountFromRequest(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedAccount, "Update account succeeded!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable Integer id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Delete account succeeded!"));
    }

    @GetMapping("/user_list")
    public ResponseEntity<ApiResponse<List<UserListDTO>>> getUserList() {
        List<UserListDTO> users = accountService.getUserList();
        return ResponseEntity.ok(ApiResponse.success(users, "Get user list succeeded!"));
    }
}