package com.backend.backend.repository.account.custom;

import com.backend.backend.builder.account.AccountSearchBuilder;
import com.backend.backend.model.account.AccountDTO;

import java.util.List;

public interface AccountRepositoryCustom {
    List<AccountDTO> getAccount(AccountSearchBuilder accountSearchBuilder);
}