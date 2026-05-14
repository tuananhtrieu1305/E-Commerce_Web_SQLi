package com.backend.backend.api;

import com.backend.backend.builder.auth.LoginBuilder;
import com.backend.backend.config.JwtService;
import com.backend.backend.converter.account.AccountDTOConverter;
import com.backend.backend.converter.auth.LoginBuilderConverter;
import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.auth.AuthDTO;
import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.repository.account.AccountRepository;
import com.backend.backend.repository.account.entity.AccountEntity;
import com.backend.backend.service.account.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthAPI {
    @Autowired
    private AccountService accountService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AccountDTOConverter accountDTOConverter;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private LoginBuilderConverter loginBuilderConverter;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTO>> register(@RequestBody Map<String, Object> body) {
        AccountDTO accountDTO = accountService.createAccount(body);

        UserDetails userDetails = userDetailsService.loadUserByUsername(accountDTO.getUsername());
        String token = jwtService.generateToken(userDetails);

        AuthDTO authResponse = new AuthDTO(token, accountDTO);
        return new ResponseEntity<>(ApiResponse.success(authResponse, "Register succeeded!"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO>> login(@RequestBody Map<String, Object> body) {
        LoginBuilder builder = loginBuilderConverter.toBuilder(body);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        builder.getUsername(),
                        builder.getPassword()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(builder.getUsername());

        String token = jwtService.generateToken(userDetails);

        Optional<AccountEntity> accountEntityOptional =
                accountRepository.findByUsernameAndDeletedFalse(builder.getUsername());

        AccountDTO accountDTO;
        if (accountEntityOptional.isPresent()) {
            AccountEntity accountEntity = accountEntityOptional.get();
            accountDTO = accountDTOConverter.toAccountDTO(accountEntity);
        } else {
            throw new UsernameNotFoundException("Not found username: " + builder.getUsername());
        }

        AuthDTO authResponse = new AuthDTO(token, accountDTO);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login succeeded!"));
    }
}
