import { useEffect, useRef, useState } from "react";
import { EditTwoTone, PlusOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import formatVND from "../../../helpers/ConvertMoney";
import { getProduct } from "../../../services/ProductAPI";
import ModalViewDetailProduct from "./viewDetail/ModalViewDetailProduct";
import ModalCreateProduct from "./createProduct/ModalCreateProduct";
import ModalUpdateProduct from "./updateProduct/ModalUpdateProduct";
import PopDeleteProduct from "./PopDeleteProduct";
import { getCategoryOnly } from "../../../services/CategoryAPI";

const ProductTable = () => {
  const actionRef = useRef();
  const [openModalViewDetail, setOpenModalViewDetail] = useState(false);
  const [openModalCreateProduct, setOpenModalCreateProduct] = useState(false);
  const [openModalUpdateProduct, setOpenModalUpdateProduct] = useState(false);
  const [productDataDetail, setProductDataDetail] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategoryOnly();
        const options = categories.data.reduce((acc, category) => {
          acc[category.cate_name] = { text: category.cate_name };
          return acc;
        }, {});
        setCategoryOptions(options);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const waitTimePromise = async (time = 20) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const waitTime = async (time = 20) => {
    await waitTimePromise(time);
  };

  const columns = [
    {
      title: "TITLE",
      dataIndex: "title",
      copyable: true,
      ellipsis: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return (
          <a
            href="#"
            onClick={() => {
              setOpenModalViewDetail(true);
              setProductDataDetail(entity);
            }}
          >
            {entity.title}
          </a>
        );
      },
    },
    {
      title: "CATEGORY",
      dataIndex: ["category", "cate_name"],
      valueType: "select",
      valueEnum: categoryOptions,
      filters: true,
      onFilter: true,
      ellipsis: true,
    },
    {
      title: "SELLER",
      dataIndex: ["seller", "seller_name"],
      search: true,
      copyable: true,
    },
    {
      title: "PRICE",
      dataIndex: "price",
      valueType: "money",
      hideInSearch: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return <span>{formatVND(entity.price)}</span>;
      },
    },
    {
      title: "PRICE",
      dataIndex: "price",
      valueType: "digitRange",
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            minPrice: value[0],
            maxPrice: value[1],
          };
        },
      },
    },

    {
      title: "STOCK",
      dataIndex: "stock",
      valueType: "money",
      hideInSearch: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return <span>{entity.stock}</span>;
      },
    },
    {
      title: "STOCK",
      dataIndex: "stock",
      valueType: "digitRange",
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            minStock: value[0],
            maxStock: value[1],
          };
        },
      },
    },
    {
      title: "ACTION",
      hideInSearch: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return (
          <>
            <EditTwoTone
              twoToneColor="#f57800"
              style={{
                cursor: "pointer",
                marginRight: 15,
                padding: "5px",
                fontSize: "18px",
              }}
              className="hover:translate-y-[-5px] hover:top-[5px] transition-all"
              onClick={() => {
                setOpenModalUpdateProduct(true);
                setProductDataDetail(entity);
              }}
            />
            <PopDeleteProduct
              productDataDetail={entity}
              refreshTable={refreshTable}
            />
          </>
        );
      },
    },
  ];
  const refreshTable = () => {
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        // eslint-disable-next-line no-unused-vars
        request={async (params, sort, filter) => {
          let query = "?1=1";

          if (params?.title) {
            query += `&title=${params.title}`;
          }
          if (params?.category?.cate_name) {
            query += `&category_name=${params.category.cate_name}`;
          }
          if (params?.seller?.seller_name) {
            query += `&seller_name=${params.seller.seller_name}`;
          }
          if (params?.minStock) {
            query += `&min_stock=${params.minStock}`;
          }
          if (params?.maxStock) {
            query += `&max_stock=${params.maxStock}`;
          }
          if (params?.minPrice) {
            query += `&minPrice=${params.minPrice}`;
          }
          if (params?.maxPrice) {
            query += `&maxPrice=${params.maxPrice}`;
          }

          const res = await getProduct(query);

          await waitTime(80);
          return {
            data: res.data,
            page: 1,
            success: true,
            // "total": 30
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 5,
          onChange: (page) => console.log(page),
        }}
        headerTitle="MANAGE PRODUCTS"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setOpenModalCreateProduct(true);
            }}
          >
            Create
          </Button>,
        ]}
      />
      <ModalViewDetailProduct
        openModalViewDetail={openModalViewDetail}
        setOpenModalViewDetail={setOpenModalViewDetail}
        productDataDetail={productDataDetail}
      />
      <ModalCreateProduct
        openModalCreateProduct={openModalCreateProduct}
        setOpenModalCreateProduct={setOpenModalCreateProduct}
        refreshTable={refreshTable}
      />
      <ModalUpdateProduct
        openModalUpdateProduct={openModalUpdateProduct}
        setOpenModalUpdateProduct={setOpenModalUpdateProduct}
        refreshTable={refreshTable}
        setProductDataDetail={setProductDataDetail}
        productDataDetail={productDataDetail}
      />
    </>
  );
};

export default ProductTable;
