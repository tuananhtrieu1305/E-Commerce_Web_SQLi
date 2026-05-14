import { Descriptions, Tag } from "antd";
import ItemTab from "./ItemTab";

const OrderTab = (props) => {
  const { orderDataDetail } = props;

  const items = [
    {
      key: "1",
      label: "ID",
      children: orderDataDetail?.id,
    },
    {
      key: "2",
      label: "Customer Name",
      children: orderDataDetail?.customer_name,
    },
    {
      key: "3",
      label: "Customer ID",
      children: orderDataDetail?.customer_id,
      span: 4,
    },
    {
      key: "4",
      label: "Address",
      children: orderDataDetail?.address,
      span: 4,
    },
    {
      key: "5",
      label: "Phone",
      children: orderDataDetail?.phone,
    },
    {
      key: "6",
      label: "Created At",
      children: orderDataDetail?.created_at,
    },
    {
      key: "7",
      label: "Updated At",
      children: orderDataDetail?.updated_at
        ? orderDataDetail.created_at
        : "No Data",
      span: 4,
    },
    {
      key: "8",
      label: "Note",
      children: orderDataDetail?.note,
      span: 4,
    },
    {
      key: "9",
      label: "Order Items",
      children: <ItemTab orderDataDetail={orderDataDetail} />,
      span: 4,
    },
    {
      key: "10",
      label: "Total Cost",
      children: orderDataDetail?.total_cost,
      span: 2,
    },
    {
      key: "11",
      label: "Payment Status",
      children: (
        <Tag color="blue">
          <strong>{orderDataDetail?.payment_status}</strong>
        </Tag>
      ),
    },
  ];

  return <Descriptions bordered items={items} />;
};
export default OrderTab;
