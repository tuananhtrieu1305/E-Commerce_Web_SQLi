import { Col, Divider, Form, Input, Modal, Row, message } from "antd";
import { useEffect, useState } from "react";
import { updateOrder } from "../../../../services/OrderAPI";
import ProductTransfer from "../../../../components/order/ProductTransfer";
import { useProductTree } from "../../../../hooks/order/useProductTree";

const ModalUpdateOrder = (props) => {
  const {
    openModalUpdateOrder,
    setOpenModalUpdateOrder,
    orderDataDetail,
    setOrderDataDetail,
    refreshTable,
  } = props;

  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const [targetKeys, setTargetKeys] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  const { treeData, fetchTreeData, setTreeData } = useProductTree();

  useEffect(() => {
    if (openModalUpdateOrder) {
      fetchTreeData();
    }
  }, [openModalUpdateOrder, fetchTreeData]);

  useEffect(() => {
    if (orderDataDetail) {
      form.setFieldsValue({
        customer_id: orderDataDetail.customer_id,
        customer_name: orderDataDetail.customer_name,
        address: orderDataDetail.address,
        phone: orderDataDetail.phone,
        note: orderDataDetail.note,
      });

      if (orderDataDetail.order_items) {
        const orderedProductKeys = orderDataDetail.order_items.map(
          (item) => `product-${item.prod_id}`
        );
        setTargetKeys(orderedProductKeys);

        const initialQuantities = {};
        orderDataDetail.order_items.forEach((item) => {
          initialQuantities[`product-${item.prod_id}`] = item.item_quantity;
        });
        setQuantities(initialQuantities);
      }
    }
  }, [orderDataDetail, form]);

  const onFinish = async (values) => {
    setIsSubmit(true);
    const payload = {
      customer_id: values.customer_id,
      address: values.address,
      phone: values.phone,
      note: values.note,
      order_items: targetKeys.map((key) => ({
        prod_id: parseInt(key.replace("product-", "")),
        quantity: quantities[key] || 1,
      })),
    };

    const res = await updateOrder(orderDataDetail.id, payload);

    if (res?.status === 200) {
      messageApi.open({ type: "success", content: res.message });
      handleCancel();
      refreshTable();
    } else {
      messageApi.open({ type: "error", content: res.message });
    }
    setIsSubmit(false);
  };

  const handleTransferChange = (keys) => {
    setTargetKeys(keys);
    const newQuantities = { ...quantities };
    keys.forEach((key) => {
      if (!newQuantities[key]) newQuantities[key] = 1;
    });
    Object.keys(newQuantities).forEach((key) => {
      if (!keys.includes(key)) delete newQuantities[key];
    });
    setQuantities(newQuantities);
  };

  const handleCancel = () => {
    form.resetFields();
    setTargetKeys([]);
    setTreeData([]);
    setQuantities({});
    setOrderDataDetail(null);
    setOpenModalUpdateOrder(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        onOk={() => form.submit()}
        width={900}
        title={`Update order of: ${orderDataDetail?.customer_name}`}
        open={openModalUpdateOrder}
        onCancel={handleCancel}
        destroyOnHidden={true}
        okButtonProps={{ loading: isSubmit }}
        okText={"Update"}
        cancelText={"Cancel"}
        confirmLoading={isSubmit}
        maskClosable={false}
      >
        <Divider className="my-4" />
        <Form onFinish={onFinish} layout="vertical" form={form}>
          <Form.Item label="Customer ID" name="customer_id" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Customer Name" name="customer_name">
                <Input disabled={true} className="!bg-gray-100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Note" name="note">
                <Input.TextArea rows={2} placeholder="Enter order notes..." />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="🛍️ Products" name="order_items">
                <ProductTransfer
                  dataSource={treeData}
                  targetKeys={targetKeys}
                  onChange={handleTransferChange}
                  quantities={quantities}
                  setQuantities={setQuantities}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUpdateOrder;
