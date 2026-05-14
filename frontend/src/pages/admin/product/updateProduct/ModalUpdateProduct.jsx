import { Modal, message, Form, Divider } from "antd";
import ProductForm from "../../../../components/product/ProductForm";
import { updateProduct } from "../../../../services/ProductAPI";

const ModalUpdateProduct = (props) => {
  const {
    openModalUpdateProduct,
    setOpenModalUpdateProduct,
    productDataDetail,
    setProductDataDetail,
    refreshTable,
  } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleUpdateFinish = async (payload) => {
    console.log("Update Payload:", payload);
    const res = await updateProduct(productDataDetail.id, payload);

    if (res?.status === 200) {
      messageApi.open({ type: "success", content: res.message, duration: 2 });
      handleCancel();
      refreshTable();
    } else {
      messageApi.open({
        type: "error",
        content: res.message,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setProductDataDetail(null);
    setOpenModalUpdateProduct(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Update Product: ${productDataDetail?.title}`}
        closable
        open={openModalUpdateProduct}
        width={800}
        footer={null}
        onCancel={handleCancel}
        destroyOnHidden={true}
      >
        <Divider />
        <ProductForm
          form={form}
          handleFinish={handleUpdateFinish}
          initialData={productDataDetail}
        />
      </Modal>
    </>
  );
};

export default ModalUpdateProduct;
