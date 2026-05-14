package com.backend.backend.service.account;

import com.backend.backend.model.account.UserListDTO;
import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.request.AccountCreateRequest;
import com.backend.backend.model.request.AccountUpdateRequest;

import java.util.List;
import java.util.Map;

public interface AccountService {
    List<AccountDTO> getAccount(Map<String, Object> params);
    AccountDTO updateAccount(Integer id, Map<String, Object> body);
    AccountDTO createAccount(Map<String, Object> body);
    void deleteAccount(Integer id);
    List<AccountDTO> createListAccounts(List<Map<String, Object>> bodyList);
    List<UserListDTO> getUserList();

    // ✅ SECURE: Method chấp nhận validated DTO thay vì raw Map
    AccountDTO createAccountFromRequest(AccountCreateRequest request);
    List<AccountDTO> createListAccountsFromRequest(List<AccountCreateRequest> requestList);
    AccountDTO updateAccountFromRequest(Integer id, AccountUpdateRequest request);
}