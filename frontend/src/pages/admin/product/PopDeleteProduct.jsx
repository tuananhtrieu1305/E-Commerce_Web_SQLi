import { DeleteTwoTone } from "@ant-design/icons";
import { message, Popconfirm, Tooltip } from "antd";
import { deleteProduct } from "../../../services/ProductAPI";

const PopDeleteProduct = (props) => {
  const { productDataDetail, refreshTable } = props;
  const [messageApi, contextHolder] = message.useMessage();

  const confirm = async () => {
    const res = await deleteProduct(productDataDetail.id);

    if (res?.status === 200) {
      messageApi.open({ type: "success", content: res.message });
      refreshTable();
    } else {
      messageApi.open({
        type: "error",
        content: res.message,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Popconfirm
        title={`Delete "${productDataDetail.title}"?`}
        description="Are you sure to delete this product?"
        onConfirm={confirm}
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
export default PopDeleteProduct;
