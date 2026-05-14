package com.backend.backend.repository.account;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.backend.repository.account.entity.AccountEntity;


public interface AccountRepository extends JpaRepository<AccountEntity, Integer>, JpaSpecificationExecutor<AccountEntity> {
    boolean existsByUsernameAndDeletedFalse(String username);
    boolean existsByEmailAndDeletedFalse(String email);

    @Query(value = "SELECT * FROM accounts a WHERE a.email = :email LIMIT 1", nativeQuery = true)
    Optional<AccountEntity> findByEmailIncludeDeleted(@Param("email") String email);

    Optional<AccountEntity> findByUsernameAndDeletedFalse(String username);
}