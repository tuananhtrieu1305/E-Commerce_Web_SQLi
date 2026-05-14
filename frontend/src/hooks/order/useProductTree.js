import { useState, useCallback } from "react";
import { getCategoryWithProduct } from "../../services/CategoryAPI";

export const useProductTree = () => {
  const [treeData, setTreeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTreeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCategoryWithProduct();
      console.log(res);

      const finalData = res.data.map((category) => ({
        key: `category-${category.category_name}`,
        title: category.category_name,
        children: (category.products ?? []).map((product) => ({
          key: `product-${product.product_id}`,
          title: product.product_name,
          product_id: product.product_id,
          stock: product.stock,
          isLeaf: true,
        })),
      }));

      setTreeData(finalData);
    } catch (error) {
      console.error("Failed to fetch product tree:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { treeData, fetchTreeData, isLoading, setTreeData };
};
