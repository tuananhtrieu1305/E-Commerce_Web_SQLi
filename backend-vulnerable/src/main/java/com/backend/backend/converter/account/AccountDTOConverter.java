package com.backend.backend.converter.account;
import com.backend.backend.model.account.AccountDTO;
import com.backend.backend.model.account.ProfileDTO;
import com.backend.backend.repository.account.AccountRepository;
import com.backend.backend.repository.account.entity.AccountEntity;
import com.backend.backend.repository.account.entity.AdminEntity;
import com.backend.backend.repository.account.entity.UserEntity;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AccountDTOConverter {
    @Autowired private AccountRepository accountRepository;
    @Autowired private ModelMapper modelMapper;
    public AccountDTO toAccountDTO(AccountEntity item) {
        AccountDTO accountDTO = modelMapper.map(item, AccountDTO.class);
        ProfileDTO profileDTO = null;

        if(item.getRole().equals("ADMIN")) {
            AdminEntity adminEntity = item.getAdmin();
            if (adminEntity != null) {
                profileDTO = modelMapper.map(adminEntity, ProfileDTO.class);
            }
        } else {
            UserEntity userEntity = item.getUser();
            if (userEntity != null) {
                profileDTO = modelMapper.map(userEntity, ProfileDTO.class);
            }
        }
        accountDTO.setProfile(profileDTO);
        accountDTO.setOrderCount(0);
        accountDTO.setTotalOrderPrice(0);
        return accountDTO;
    }
}