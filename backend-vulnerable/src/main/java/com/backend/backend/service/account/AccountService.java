package com.backend.backend.service.account;

import com.backend.backend.model.account.UserListDTO;
import com.backend.backend.model.account.AccountDTO;

import java.util.List;
import java.util.Map;

public interface AccountService {
    List<AccountDTO> getAccount(Map<String, Object> params);
    AccountDTO updateAccount(Integer id, Map<String, Object> body);
    AccountDTO createAccount(Map<String, Object> body);
    void deleteAccount(Integer id);
    List<AccountDTO> createListAccounts(List<Map<String, Object>> bodyList);
    List<UserListDTO> getUserList();

    // ❌ VULNERABLE: Second-Order SQLi — lấy data từ DB rồi concat vào query mới
    List<Map<String, Object>> getAccountReport(Integer accountId);
}