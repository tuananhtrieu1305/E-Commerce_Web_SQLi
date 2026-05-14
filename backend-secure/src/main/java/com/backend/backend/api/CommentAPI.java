package com.backend.backend.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.model.comment.CommentDTO;
import com.backend.backend.model.comment.RatingSummaryDTO;
import com.backend.backend.service.comment.CommentService;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentAPI {

    @Autowired
    private CommentService commentService;

    // 1. Lấy danh sách comment của 1 sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByProduct(
            @PathVariable Integer productId
    ) {
        List<CommentDTO> comments = commentService.getCommentsByProduct(productId);
        return ResponseEntity.ok(comments);
    }

    // 2. Lấy summary rating (avg star + tổng số đánh giá) của 1 sản phẩm
    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<RatingSummaryDTO> getRatingSummary(
            @PathVariable Integer productId
    ) {
        RatingSummaryDTO summary = commentService.getRatingSummaryByProduct(productId);
        return ResponseEntity.ok(summary);
    }

    // 3. Tạo mới comment cho 1 sản phẩm
    @PostMapping()
    public ResponseEntity<CommentDTO> createComment(@RequestBody CommentDTO dto) {
        // yêu cầu FE gửi: userId, productId, star, content
        CommentDTO created = commentService.createComment(dto);
        return ResponseEntity.ok(created);
    }

    // 4. Cập nhật comment (star / content)
    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Integer id,
            @RequestBody CommentDTO dto
    ) {
        CommentDTO updated = commentService.updateComment(id, dto);
        return ResponseEntity.ok(updated);
    }

    // 5. Xóa comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
