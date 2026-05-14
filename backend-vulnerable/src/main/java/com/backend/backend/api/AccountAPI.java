package com.backend.backend.api;

import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.account.UserListDTO;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.service.account.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<ApiResponse<AccountDTO>> createAccount(@RequestBody Map<String, Object> body) {
        AccountDTO newAccount = accountService.createAccount(body);
        ApiResponse<AccountDTO> response = ApiResponse.success(newAccount, "Create account succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> createListAccounts(@RequestBody List<Map<String, Object>> bodyList) {
        List<AccountDTO> newAccounts = accountService.createListAccounts(bodyList);
        ApiResponse<List<AccountDTO>> response = ApiResponse.success(newAccounts, "Create accounts succeeded!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountDTO>> updateAccount(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        AccountDTO updatedAccount = accountService.updateAccount(id, body);
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

    // ============================================================
    // ❌ SECOND-ORDER SQLi ENDPOINT
    // User đổi fullname thành SQL payload → Lưu vào DB an toàn (Prepared Statement)
    // Admin GET /report/{accountId} → Lấy fullname từ DB rồi concat vào query mới
    // ============================================================
    @GetMapping("/report/{accountId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAccountReport(@PathVariable Integer accountId) {
        List<Map<String, Object>> report = accountService.getAccountReport(accountId);
        return ResponseEntity.ok(ApiResponse.success(report, "Account report generated!"));
    }
}