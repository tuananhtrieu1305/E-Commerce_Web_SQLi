package com.backend.backend.service.seller.impl;

import com.backend.backend.model.product.SellerDTO;
import com.backend.backend.repository.product.SellerRepository;
import com.backend.backend.repository.product.entity.SellerEntity;
import com.backend.backend.service.seller.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SellerServiceImpl implements SellerService {
    @Autowired
    private SellerRepository sellerRepository;

    @Override
    public List<SellerDTO> getSeller() {
        List<SellerEntity> sellerEntities = sellerRepository.findAll();
        List<SellerDTO> res = new ArrayList<>();
        for(SellerEntity sellerEntity : sellerEntities) {
            SellerDTO sellerDTO = new SellerDTO();
            sellerDTO.setId(sellerEntity.getId());
            sellerDTO.setSeller_name(sellerEntity.getSeller_name());
            sellerDTO.setSeller_info(sellerEntity.getSeller_info());
            res.add(sellerDTO);
        }
        return res;
    }
}
