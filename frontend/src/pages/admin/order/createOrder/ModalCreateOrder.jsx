import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { getUserList } from "../../../../services/AccountAPI";
import { createOrder } from "../../../../services/OrderAPI";
import ProductTransfer from "../../../../components/order/ProductTransfer";
import { useProductTree } from "../../../../hooks/order/useProductTree";

const ModalCreateOrder = (props) => {
  const { openModalCreateOrder, setOpenModalCreateOrder, refreshTable } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [userDataList, setUserDataList] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { treeData, fetchTreeData, setTreeData } = useProductTree();

  useEffect(() => {
    if (openModalCreateOrder) {
      fetchTreeData();
    }
  }, [openModalCreateOrder, fetchTreeData]);

  useEffect(() => {
    const fetchUserDataList = async () => {
      const res = await getUserList();
      console.log(res);

      setUserDataList(res.data);
    };
    fetchUserDataList();
  }, []);

  const handleUserChange = (userId) => {
    if (!userId) {
      form.setFieldsValue({
        address: "",
      });
      return;
    }

    const selectedUser = userDataList.find((user) => user.id === userId);

    if (selectedUser) {
      form.setFieldsValue({
        address: selectedUser.address || "",
      });
    }
  };

  const onFinish = async (values) => {
    setIsSubmit(true);
    const payload = {
      customer_id: values.customer_id,
      address: values.address,
      phone: values.phone,
      note: values.note,
      order_items: targetKeys.map((key) => {
        const prod_id = parseInt(key.replace("product-", ""));
        return {
          prod_id: prod_id,
          quantity: quantities[key] || 1,
        };
      }),
    };
    const res = await createOrder(payload);
    console.log(res);

    if (res?.status === 200) {
      messageApi.open({
        type: "success",
        content: res.message,
        duration: 2,
      });
      setTimeout(() => {
        setOpenModalCreateOrder(false);
        form.resetFields();
        setTargetKeys([]);
        setQuantities({});
        refreshTable();
      }, 1000);
    } else {
      messageApi.open({
        type: "error",
        content: res.message,
        duration: 2,
      });
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
    setQuantities({});
    setTreeData([]);
    setOpenModalCreateOrder(false);
  };

  return (
    <Modal
      title="Create Order"
      closable={{ "aria-label": "Custom Close Button" }}
      open={openModalCreateOrder}
      width={800}
      footer={false}
      onCancel={handleCancel}
      confirmLoading={isSubmit}
      destroyOnHidden={true}
    >
      {contextHolder}
      <Divider />
      <Form
        layout="vertical"
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        form={form}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              className="mb-0"
              label="Select User"
              name="customer_id"
              required
            >
              <Select
                placeholder="Select a user"
                onChange={handleUserChange}
                allowClear
              >
                {userDataList.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              className="mb-0"
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please input your phone!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              className="mb-0"
              label="Deliver To"
              name="address"
              rules={[
                { required: true, message: "Please input your address!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item className="mb-0" label="Note" name="note">
              <Input.TextArea rows={3} placeholder="Enter order notes..." />
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

        <Form.Item label={null} className="flex justify-end w-full mb-0!">
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCreateOrder;
