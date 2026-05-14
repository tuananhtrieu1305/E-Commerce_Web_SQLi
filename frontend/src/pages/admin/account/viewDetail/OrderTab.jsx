import { Descriptions } from "antd";
import formatVND from "../../../../helpers/ConvertMoney";

const OrderTab = (props) => {
  const { accountDataDetail } = props;

  const items = [
    {
      key: "1",
      label: "Order Quantities",
      children: accountDataDetail?.orderCount,
      span: 4,
    },
    {
      key: "2",
      label: "Total Payment",
      children: formatVND(accountDataDetail?.totalOrderPrice),
      span: 4,
    },
    {
      key: "3",
      label: "Note",
      children: (
        <div>
          <span>
            To view the detail order, please go to{" "}
            <strong>Manage Orders</strong> Tab
          </span>
          <br />
          <span>
            Or if you want to view the detail payment, please go to{" "}
            <strong>Manage Payments</strong> Tab
          </span>
        </div>
      ),
    },
  ];

  return <Descriptions bordered items={items} />;
};
export default OrderTab;
