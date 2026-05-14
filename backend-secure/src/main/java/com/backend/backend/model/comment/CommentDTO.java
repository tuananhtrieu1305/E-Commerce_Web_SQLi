package com.backend.backend.model.comment;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class CommentDTO {

   private Integer id;
    private Integer userId;
    private Integer productId;

    private String username;   // accounts.username
    private String fullname;   // users.fullname
    private String email;      // accounts.email
    private String avatar;     // users.image

    private Integer star;
    private String content;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // FE đang dùng c.date
    public String getDate() {
        return createdAt != null ? createdAt.toString() : null;
    }

    // Constructor dùng cho JPQL projection
    public CommentDTO(Integer id,
                      Integer userId,
                      Integer productId,
                      String username,
                      String fullname,
                      String email,
                      String avatar,
                      Integer star,
                      String content,
                      LocalDateTime createdAt,
                      LocalDateTime updatedAt) {

        this.id = id;
        this.userId = userId;
        this.productId = productId;

        this.username = username;
        this.fullname = fullname;
        this.email = email;
        this.avatar = avatar;

        this.star = star;
        this.content = content;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public CommentDTO() {}


    // GETTER/SETTER
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFullname() { return fullname;}
    public void setFullname(String fullname) {this.fullname=fullname;}
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUserEmail() { return email; }
    public void setUserEmail(String userEmail) { this.email = userEmail; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Integer getStar() { return star; }
    public void setStar(Integer star) { this.star = star; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
