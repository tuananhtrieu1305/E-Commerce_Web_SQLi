import { Modal, Divider } from "antd";
import ProductTab from "./ProductTab";

const ModalViewDetailProduct = (props) => {
  const { openModalViewDetail, productDataDetail, setOpenModalViewDetail } =
    props;

  return (
    <Modal
      width={1000}
      title={`${productDataDetail?.title}'s Detail`}
      open={openModalViewDetail}
      onCancel={() => setOpenModalViewDetail(false)}
      footer={false}
    >
      <Divider />
      <ProductTab productDataDetail={productDataDetail} />
    </Modal>
  );
};
export default ModalViewDetailProduct;
