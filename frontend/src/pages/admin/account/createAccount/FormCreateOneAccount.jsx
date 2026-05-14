import { Button, Col, Form, Input, Row, Select } from "antd";
import { createAccount } from "../../../../services/AccountAPI";

const FormCreateOneAccount = (props) => {
  const { role, refreshTable, setOpenAccountCreate, messageApi } = props;
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { username, email, role, password } = values;
    const res = await createAccount({ username, email, role, password });
    console.log(res);
    if (res?.status === 200) {
      form.resetFields();
      setOpenAccountCreate(false);
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

  return (
    <>
      <Form
        layout="vertical"
        name="basic"
        initialValues={{ remember: true, role: role }}
        onFinish={onFinish}
        autoComplete="off"
        form={form}
      >
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Role" name="role">
              <Select>
                <Select.Option value="USER">USER</Select.Option>
                <Select.Option value="ADMIN">ADMIN</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={null} className="float-end">
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default FormCreateOneAccount;
