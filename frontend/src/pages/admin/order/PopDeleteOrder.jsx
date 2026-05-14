import { DeleteTwoTone } from "@ant-design/icons";
import { message, Popconfirm, Tooltip } from "antd";
import { deleteOrder } from "../../../services/OrderAPI";

const PopDeleteOrder = (props) => {
  const { orderDataDetail, refreshTable } = props;
  const [messageApi, contextHolder] = message.useMessage();

  const confirm = async () => {
    const res = await deleteOrder(orderDataDetail.id);
    if (res?.status === 200) {
      messageApi.open({
        type: "success",
        content: res.message,
        duration: 2,
      });
      setTimeout(() => {
        refreshTable();
      }, 1000);
    } else {
      messageApi.open({
        type: "error",
        content: res.message,
      });
    }
  };

  const cancel = () => {
    messageApi.open({ type: "info", content: "Delete cancelled!" });
  };

  return (
    <>
      {contextHolder}
      <Popconfirm
        title={`Delete ${orderDataDetail.customer_name} Order`}
        description="Are you sure to delete this order?"
        onConfirm={confirm}
        onCancel={cancel}
        okText="Yes"
        cancelText="No"
      >
        <Tooltip title="Delete">
          <DeleteTwoTone
            twoToneColor="#ff4d4f"
            className="hover:translate-y-[-5px] hover:top-[5px] transition-all"
            style={{ cursor: "pointer", fontSize: "18px" }}
          />
        </Tooltip>
      </Popconfirm>
    </>
  );
};
export default PopDeleteOrder;
