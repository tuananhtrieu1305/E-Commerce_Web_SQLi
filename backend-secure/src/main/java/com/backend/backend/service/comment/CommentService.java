package com.backend.backend.service.comment;

import java.util.List;

import com.backend.backend.model.comment.CommentDTO;
import com.backend.backend.model.comment.RatingSummaryDTO;

public interface CommentService {

    List<CommentDTO> getCommentsByProduct(Integer productId);

    CommentDTO createComment(CommentDTO dto);

    CommentDTO updateComment(Integer id, CommentDTO dto);

    void deleteComment(Integer id);

    RatingSummaryDTO getRatingSummaryByProduct(Integer productId);
}
