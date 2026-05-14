package com.backend.backend.repository.order;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.backend.model.order.OrderStatsDTO;
import com.backend.backend.repository.order.entity.OrderEntity;

public interface OrderRepository extends JpaRepository<OrderEntity, Integer>, JpaSpecificationExecutor<OrderEntity> {
    @Query("SELECT new com.backend.backend.model.order.OrderStatsDTO(o.user.id, COUNT(o.id), SUM(o.total_cost)) " +
            "FROM OrderEntity o " +
            "WHERE o.user.id IN :userIds " +
            "GROUP BY o.user.id")
    List<OrderStatsDTO> findOrderStatsByUserIds(@Param("userIds") Set<Integer> userIds);
    List<OrderEntity> findByUserId(Integer userId, Sort sort);
}
