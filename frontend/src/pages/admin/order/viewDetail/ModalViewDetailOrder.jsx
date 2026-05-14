import { Modal, Divider } from "antd";
import OrderTab from "./OrderTab";

const ModalViewDetailOrder = (props) => {
  const { openModalViewDetail, orderDataDetail, setOpenModalViewDetail } =
    props;

  return (
    <Modal
      width={1000}
      title={`Order Details`}
      open={openModalViewDetail}
      onCancel={() => setOpenModalViewDetail(false)}
      footer={false}
    >
      <Divider />
      <OrderTab orderDataDetail={orderDataDetail} />
    </Modal>
  );
};

export default ModalViewDetailOrder;
