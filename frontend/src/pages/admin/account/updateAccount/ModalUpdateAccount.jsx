import {
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Upload,
  Image,
} from "antd";
import { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { updateAccount } from "../../../../services/AccountAPI";
import { BACKEND_URL } from "../../../../utils/config";

const ModalUpdateAccount = (props) => {
  const {
    openAccountUpdate,
    accountDataDetail,
    setOpenAccountUpdate,
    setAccountDataDetail,
    refreshTable,
  } = props;
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (accountDataDetail) {
      form.setFieldsValue({
        username: accountDataDetail.username,
        email: accountDataDetail.email,
        role: accountDataDetail.role,
        fullname: accountDataDetail?.profile?.fullname,
        address: accountDataDetail?.profile?.address,
      });

      if (accountDataDetail?.profile?.avatar) {
        setFileList([
          {
            uid: "-1",
            name: accountDataDetail.profile.image,
            status: "done",
            url: `${BACKEND_URL}/uploads/${
              accountDataDetail.profile.image
            }`,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [accountDataDetail]);

  const onFinish = async (values) => {
    setIsSubmit(true);
    const { username, email, role, fullname, address } = values;

    let imageBase64 = undefined;

    if (fileList.length > 0 && fileList[0]?.originFileObj) {
      imageBase64 = await getBase64(fileList[0].originFileObj);
    }

    const payload = {
      username,
      email,
      role,
      fullname,
      address,
      ...(imageBase64 && { image: imageBase64 }),
    };

    const res = await updateAccount(accountDataDetail.id, payload);
    console.log(res);
    if (res?.status === 200) {
      messageApi.open({
        type: "success",
        content: res.message,
      });
      form.resetFields();
      setFileList([]);
      setAccountDataDetail(null);
      setOpenAccountUpdate(false);
      refreshTable();
    } else {
      messageApi.open({
        type: "error",
        content: res.message,
      });
    }
    setIsSubmit(false);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <>
      {contextHolder}
      <Modal
        onOk={() => {
          form.submit();
        }}
        width={800}
        title={`${
          accountDataDetail?.profile?.fullname || accountDataDetail?.username
        }'s Profile`}
        open={openAccountUpdate}
        onCancel={() => {
          form.resetFields();
          setAccountDataDetail(null);
          setFileList([]);
          setOpenAccountUpdate(false);
        }}
        destroyOnHidden={true}
        okButtonProps={{ loading: isSubmit }}
        okText={"Update"}
        cancelText={"Cancel"}
        confirmLoading={isSubmit}
        maskClosable={false}
      >
        <Divider className="bg-gray-300" />
        <Form
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          form={form}
        >
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item label="Username" name="username">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input disabled={true} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Role" name="role">
                <Input disabled={true} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Fullname" name="fullname">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Avatar"
                name="image"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  onPreview={handlePreview}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default ModalUpdateAccount;
