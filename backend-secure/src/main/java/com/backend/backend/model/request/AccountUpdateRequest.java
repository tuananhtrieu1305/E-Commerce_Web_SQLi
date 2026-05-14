package com.backend.backend.model.request;

import jakarta.validation.constraints.*;

// ============================================================
// ✅ SECURE: Allow-list Input Validation cho Account Update
// ============================================================
public class AccountUpdateRequest {

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$",
             message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @Email(message = "Email format is invalid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Pattern(regexp = "^(USER|ADMIN)$", message = "Role must be USER or ADMIN")
    private String role;

    @Size(max = 100, message = "Fullname must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\p{L}\\s.,()\\-–&+/'!:]*$",
             message = "Fullname contains invalid characters")
    private String fullname;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\p{L}\\s.,()\\-–&+/'!:#/]*$",
             message = "Address contains invalid characters")
    private String address;

    private String image; // base64

    // === Getters & Setters ===
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullname() { return fullname; }
    public void setFullname(String fullname) { this.fullname = fullname; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
