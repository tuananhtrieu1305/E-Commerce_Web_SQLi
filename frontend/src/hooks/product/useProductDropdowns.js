import { useState, useEffect, useRef } from "react";
import { getSeller } from "../../services/SellerAPI";
import { getCategoryOnly } from "../../services/CategoryAPI";

export const useProductDropdowns = () => {
  const [itemsSeller, setItemsSeller] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const sellerInputRef = useRef(null);

  const [itemsCate, setItemsCate] = useState([]);
  const [cateName, setCateName] = useState("");
  const cateInputRef = useRef(null);

  useEffect(() => {
    const handleGetSellerName = async () => {
      const res = await getSeller();
      setItemsSeller(res.data.map((item) => item.seller_name));
    };
    handleGetSellerName();
  }, []);

  useEffect(() => {
    const handleGetCateName = async () => {
      const res = await getCategoryOnly();
      setItemsCate(res.data.map((item) => item.cate_name));
    };
    handleGetCateName();
  }, []);

  const onSellerNameChange = (event) => {
    setSellerName(event.target.value);
  };

  const onCateNameChange = (event) => {
    setCateName(event.target.value);
  };

  const addItemSeller = (e) => {
    e.preventDefault();
    setItemsSeller([...itemsSeller, sellerName || `New item`]);
    setSellerName("");
    setTimeout(() => sellerInputRef.current?.focus(), 0);
  };

  const addItemCate = (e) => {
    e.preventDefault();
    setItemsCate([...itemsCate, cateName || `New item`]);
    setCateName("");
    setTimeout(() => cateInputRef.current?.focus(), 0);
  };

  return {
    itemsSeller,
    sellerName,
    sellerInputRef,
    onSellerNameChange,
    addItemSeller,
    itemsCate,
    cateName,
    cateInputRef,
    onCateNameChange,
    addItemCate,
  };
};
