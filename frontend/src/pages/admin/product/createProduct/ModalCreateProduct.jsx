import { Tabs, Modal, message, Form } from "antd";
import { createProduct } from "../../../../services/ProductAPI";
import ProductForm from "../../../../components/product/ProductForm";
import FormCreateListProduct from "./FormCreateListProduct";

const ModalCreateProduct = (props) => {
  const { openModalCreateProduct, refreshTable, setOpenModalCreateProduct } =
    props;
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleCreateFinish = async (payload) => {
    const res = await createProduct(payload);

    if (res?.status === 200) {
      messageApi.open({ type: "success", content: res.message, duration: 2 });
      handleCancel();
      refreshTable();
    } else {
      messageApi.open({ type: "error", content: res.message });
    }
  };
  const handleCancel = () => {
    form.resetFields();
    setOpenModalCreateProduct(false);
  };

  const items = [
    {
      label: "Create One Product",
      key: "1",
      children: <ProductForm form={form} handleFinish={handleCreateFinish} />,
    },
    {
      label: "Create List of Products",
      key: "2",
      children: (
        <FormCreateListProduct
          refreshTable={refreshTable}
          setOpenModalCreateProduct={setOpenModalCreateProduct}
          messageApi={messageApi}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Modal
        title="Create Product(s)"
        closable={{ "aria-label": "Custom Close Button" }}
        open={openModalCreateProduct}
        width={800}
        footer={false}
        onCancel={() => setOpenModalCreateProduct(false)}
        destroyOnHidden={true}
      >
        <Tabs defaultActiveKey="1" centered items={items} />
      </Modal>
    </>
  );
};
export default ModalCreateProduct;
