package com.backend.backend.builder.account;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class AccountSearchBuilder {
    private Integer id;
    private String username;
    private String email;
    private String role;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime created_at;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updated_at;
    private String fullname;
    private String address;
    private String startTime;
    private String endTime;
    private String password;
    private String image;

    private AccountSearchBuilder(Builder builder) {
        this.id = builder.id;
        this.username = builder.username;
        this.email = builder.email;
        this.role = builder.role;
        this.created_at = builder.created_at;
        this.updated_at = builder.updated_at;
        this.fullname = builder.fullname;
        this.address = builder.address;
        this.startTime = builder.startTime;
        this.endTime = builder.endTime;
        this.password = builder.password;
        this.image = builder.image;
    }

    public Integer getId() {
        return id;
    }
    public String getUsername() {
        return username;
    }
    public String getEmail() {
        return email;
    }
    public String getRole() {
        return role;
    }
    public LocalDateTime getCreated_at() {
        return created_at;
    }
    public LocalDateTime getUpdated_at() {
        return updated_at;
    }
    public String getFullname() {
        return fullname;
    }
    public String getAddress() {
        return address;
    }
    public String getStartTime() {
        return startTime;
    }
    public String getEndTime() {
        return endTime;
    }

    public String getPassword() {
        return password;
    }

    public String getImage() {
        return image;
    }

    public static class Builder {
        private Integer id;
        private String username;
        private String email;
        private String role;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime created_at;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updated_at;
        private String fullname;
        private String address;
        private String startTime;
        private String endTime;
        private String password;
        private String image;

        public Builder setId(Integer id) {
            this.id = id;
            return this;
        }
        public Builder setUsername(String username) {
            this.username = username;
            return this;
        }
        public Builder setEmail(String email) {
            this.email = email;
            return this;
        }
        public Builder setRole(String role) {
            this.role = role;
            return this;
        }
        public Builder setCreated_at(LocalDateTime created_at) {
            this.created_at = created_at;
            return this;
        }
        public Builder setUpdated_at(LocalDateTime updated_at) {
            this.updated_at = updated_at;
            return this;
        }
        public Builder setFullname(String fullname) {
            this.fullname = fullname;
            return this;
        }
        public Builder setAddress(String address) {
            this.address = address;
            return this;
        }
        public Builder setStartTime(String startTime) {
            this.startTime = startTime;
            return this;
        }
        public Builder setEndTime(String endTime) {
            this.endTime = endTime;
            return this;
        }

        public Builder setPassword(String password) {
            this.password = password;
            return this;
        }

        public Builder setImage(String image) {
            this.image = image;
            return this;
        }

        public AccountSearchBuilder build() {
            return new AccountSearchBuilder(this);
        }
    }
}