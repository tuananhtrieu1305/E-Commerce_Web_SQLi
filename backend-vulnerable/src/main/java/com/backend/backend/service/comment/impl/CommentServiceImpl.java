package com.backend.backend.service.comment.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.backend.converter.comment.CommentDTOConverter;
import com.backend.backend.model.comment.CommentDTO;
import com.backend.backend.model.comment.RatingSummaryDTO;
import com.backend.backend.repository.comment.CommentRepository;
import com.backend.backend.repository.comment.entity.CommentEntity;
import com.backend.backend.service.comment.CommentService;
import com.backend.backend.utils.exception.ResourceNotFoundException;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentDTOConverter commentDTOConverter;

    @Override
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByProduct(Integer productId) {
        // ✅ dùng JPQL projection trong Repository, trả thẳng List<CommentDTO>
        return commentRepository.getCommentsByProduct(productId);
    }

@Override
@Transactional
public CommentDTO createComment(CommentDTO dto) {

    // 1. Convert DTO → Entity
    CommentEntity entity = commentDTOConverter.toEntity(dto);
    entity.setId(null);

    // 2. Save entity
    CommentEntity saved = commentRepository.save(entity);

    // 3. Trả về bản FULL từ repo (JOIN 3 bảng)
    return commentRepository.getCommentDTOById(saved.getId());
}


    @Override
    @Transactional
    public CommentDTO updateComment(Integer id, CommentDTO dto) {
        CommentEntity entity = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment not found with ID: " + id
                ));

        commentDTOConverter.updateEntity(dto, entity);
        CommentEntity updated = commentRepository.save(entity);
        return commentDTOConverter.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteComment(Integer id) {
        if (!commentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Comment not found with ID: " + id);
        }
        commentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public RatingSummaryDTO getRatingSummaryByProduct(Integer productId) {
        Double avg = commentRepository.getAverageStarByProductId(productId);
        long count = commentRepository.countByProductId(productId);
        if (avg == null) avg = 0.0;
        return new RatingSummaryDTO(productId, avg, count);
    }
}
