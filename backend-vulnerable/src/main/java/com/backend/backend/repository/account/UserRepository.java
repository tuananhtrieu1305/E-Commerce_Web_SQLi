package com.backend.backend.repository.account;

import com.backend.backend.repository.account.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Integer> {
}