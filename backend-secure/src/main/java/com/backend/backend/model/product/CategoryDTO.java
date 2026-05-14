package com.backend.backend.model.product;

public class CategoryDTO {
    private Integer id;
    private String cate_name;

    public CategoryDTO() {
    }

    public CategoryDTO(Integer id, String cate_name) {
        this.id = id;
        this.cate_name = cate_name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCate_name() {
        return cate_name;
    }

    public void setCate_name(String cate_name) {
        this.cate_name = cate_name;
    }
}
