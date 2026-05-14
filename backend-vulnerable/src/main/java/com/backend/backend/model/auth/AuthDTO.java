package com.backend.backend.model.auth;

import com.backend.backend.model.account.AccountDTO;

public class AuthDTO {
    private String token;
    private AccountDTO userDetails;

    public AuthDTO(String token, AccountDTO userDetails) {
        this.token = token;
        this.userDetails = userDetails;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public AccountDTO getUserDetails() { return userDetails; }
    public void setUserDetails(AccountDTO userDetails) { this.userDetails = userDetails; }
}