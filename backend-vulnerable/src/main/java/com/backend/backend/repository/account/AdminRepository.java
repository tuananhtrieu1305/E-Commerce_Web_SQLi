package com.backend.backend.repository.account;

import com.backend.backend.repository.account.entity.AdminEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<AdminEntity, Integer> {
}