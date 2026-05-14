package com.backend.backend.repository.comment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.backend.model.comment.CommentDTO;
import com.backend.backend.repository.comment.entity.CommentEntity;

public interface CommentRepository extends JpaRepository<CommentEntity, Integer> {

    List<CommentEntity> findByProductIdOrderByCreatedAtDesc(Integer productId);

    long countByProductId(Integer productId);

    @Query("SELECT COALESCE(AVG(c.star), 0) FROM CommentEntity c WHERE c.productId = :productId")
    Double getAverageStarByProductId(@Param("productId") Integer productId);

   @Query("""
    SELECT new com.backend.backend.model.comment.CommentDTO(
        c.id,
        c.userId,
        c.productId,
        acc.username,
        u.fullname,
        acc.email,
        u.image,
        c.star,
        c.content,
        c.createdAt,
        c.updatedAt
    )
    FROM CommentEntity c
    JOIN UserEntity u ON c.userId = u.id
    JOIN AccountEntity acc ON u.account.id = acc.id
    WHERE c.productId = :pid
    ORDER BY c.createdAt DESC
    """)
    List<CommentDTO> getCommentsByProduct(@Param("pid") Integer productId);

    @Query("""
        SELECT new com.backend.backend.model.comment.CommentDTO(
            c.id,
            c.userId,
            c.productId,
            acc.username,
            u.fullname,
            acc.email,
            u.image,
            c.star,
            c.content,
            c.createdAt,
            c.updatedAt
        )
        FROM CommentEntity c
        JOIN UserEntity u ON c.userId = u.id
        JOIN AccountEntity acc ON u.account.id = acc.id
        WHERE c.id = :id
    """)
    CommentDTO getCommentDTOById(@Param("id") Integer id);

}
