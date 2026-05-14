import { Descriptions } from "antd";
import ImageProductTab from "./ImageProductTab";
import formatVND from "../../../../helpers/ConvertMoney";

const ProductTab = (props) => {
  const { productDataDetail } = props;

  const items = [
    {
      key: "1",
      label: "ID",
      children: productDataDetail?.id,
    },
    {
      key: "2",
      label: "Title",
      children: productDataDetail?.title,
      span: 2,
    },
    {
      key: "3",
      label: "Product Info",
      children: productDataDetail?.productInfo,
      span: 4,
    },
    {
      key: "4",
      label: "Price",
      children: <span>{formatVND(productDataDetail?.price)}</span>,
    },
    {
      key: "5",
      label: "Stock",
      children: productDataDetail?.stock,
      span: 2,
    },
    {
      key: "6",
      label: "Created At",
      children: productDataDetail?.createdAt,
    },
    {
      key: "7",
      label: "Updated At",
      children: productDataDetail?.updatedAt
        ? productDataDetail.createdAt
        : "No Data",
      span: 4,
    },
    {
      key: "8",
      label: "Category",
      children: productDataDetail?.category?.cate_name,
    },
    {
      key: "9",
      label: "Seller",
      children: productDataDetail?.seller?.seller_name,
      span: 4,
    },
    {
      key: "10",
      label: "Images",
      children: <ImageProductTab productDataDetail={productDataDetail} />,
    },
  ];

  return <Descriptions bordered items={items} />;
};
export default ProductTab;
