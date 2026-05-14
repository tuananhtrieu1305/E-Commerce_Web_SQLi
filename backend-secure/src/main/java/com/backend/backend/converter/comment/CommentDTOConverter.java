package com.backend.backend.converter.comment;

import org.springframework.stereotype.Component;

import com.backend.backend.model.comment.CommentDTO;
import com.backend.backend.repository.account.entity.AccountEntity;
import com.backend.backend.repository.account.entity.UserEntity;
import com.backend.backend.repository.comment.entity.CommentEntity;

@Component
public class CommentDTOConverter {

    public CommentDTO toDTO(CommentEntity comment) {
        CommentDTO dto = new CommentDTO();

        dto.setId(comment.getId());
        dto.setUserId(comment.getUserId());
        dto.setProductId(comment.getProductId());
        dto.setStar(comment.getStar());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        return dto;
    }
    public CommentDTO toDTO(CommentEntity comment, UserEntity user, AccountEntity account) {
    CommentDTO dto = toDTO(comment); // dùng hàm đơn giản ở trên

    if (user != null) {
        dto.setFullname(user.getFullname());
        dto.setAvatar(user.getImage());
    }

    if (account != null) {
        dto.setUsername(account.getUsername());
        dto.setUserEmail(account.getEmail());
    }

    return dto;
}


    public CommentEntity toEntity(CommentDTO dto) {
        if (dto == null) return null;

        CommentEntity entity = new CommentEntity();
        entity.setId(dto.getId());
        entity.setUserId(dto.getUserId());
        entity.setProductId(dto.getProductId());
        entity.setStar(dto.getStar());
        entity.setContent(dto.getContent());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        return entity;
    }

    public void updateEntity(CommentDTO dto, CommentEntity entity) {
        if (dto.getStar() != null) {
            entity.setStar(dto.getStar());
        }
        if (dto.getContent() != null) {
            entity.setContent(dto.getContent());
        }
        // userId, productId thường không cho sửa
    }
}
