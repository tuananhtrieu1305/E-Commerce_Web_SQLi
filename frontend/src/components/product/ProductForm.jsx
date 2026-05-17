import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  InputNumber,
  Image,
  Upload,
  Divider,
  Space,
  message,
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useProductDropdowns } from "../../hooks/product/useProductDropdowns";
import { STATIC_URL } from "../../utils/config";

const ProductForm = (props) => {
  const { form, handleFinish, initialData } = props;

  const isUpdate = initialData ? true : false;

  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const {
    itemsSeller,
    sellerName,
    sellerInputRef,
    onSellerNameChange,
    addItemSeller,
    itemsCate,
    cateName,
    cateInputRef,
    onCateNameChange,
    addItemCate,
  } = useProductDropdowns();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        product_info: initialData.productInfo,
        seller_name: initialData.seller?.seller_name,
        cate_name: initialData.category?.cate_name,
      });

      if (initialData.imagePaths) {
        const oldImages = initialData.imagePaths.map((img) => ({
          uid: img.id,
          name: img.image_path.split("/").pop(),
          status: "done",
          url: `${STATIC_URL}${img.image_path}`,
        }));
        setFileList(oldImages);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [initialData, form]);

  const formatter = (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const parser = (value) => value?.replace(/\$\s?|(,*)/g, "");

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
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined /> <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const onFinish = async (values) => {
    const imagePromises = fileList.map(async (file) => {
      if (file.originFileObj) {
        return await getBase64(file.originFileObj);
      } else if (file.url) {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch image: ${file.url} Status: ${response.status}`
            );
          }
          const blob = await response.blob();
          return await getBase64(blob);
        } catch (error) {
          console.error("Error fetching or converting old image:", error);
          message.error(
            `Failed to process existing image: ${file.name || file.uid}`
          );
          return null;
        }
      }
      return null;
    });

    try {
      const imagesBase64 = (await Promise.all(imagePromises)).filter(
        (img) => img !== null
      );

      if (imagesBase64.length !== fileList.length) {
        message.warning("Some images could not be processed and were skipped.");
      }

      const payload = {
        ...values,
        images: imagesBase64,
      };

      console.log("Payload with all base64 images:", payload);

      handleFinish(payload);
    } catch (error) {
      console.error("Error processing images:", error);
      message.error("An error occurred while processing images.");
    }
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item
              label="Seller Name"
              name="seller_name"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select a seller"
                disabled={isUpdate}
                popupRender={(menu) => (
                  <>
                    {" "}
                    {menu} <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <Input
                        placeholder="New seller name"
                        ref={sellerInputRef}
                        value={sellerName}
                        onChange={onSellerNameChange}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={addItemSeller}
                      >
                        {" "}
                        Add seller{" "}
                      </Button>
                    </Space>
                  </>
                )}
                options={itemsSeller.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Category Name"
              name="cate_name"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select category"
                disabled={isUpdate}
                popupRender={(menu) => (
                  <>
                    {" "}
                    {menu} <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <Input
                        placeholder="New category"
                        ref={cateInputRef}
                        value={cateName}
                        onChange={onCateNameChange}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={addItemCate}
                      >
                        {" "}
                        Add Category{" "}
                      </Button>
                    </Space>
                  </>
                )}
                options={itemsCate.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "Please input product's title!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Product Info"
              name="product_info"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter product's description..."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Price" name="price" rules={[{ required: true }]}>
              <InputNumber
                defaultValue={0}
                suffix="₫"
                style={{ width: "100%" }}
                formatter={formatter}
                parser={parser}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
              <InputNumber
                defaultValue={0}
                style={{ width: "100%" }}
                formatter={formatter}
                parser={parser}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Images" name="images">
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                onPreview={handlePreview}
                multiple
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={null} className="flex justify-end w-full mb-0!">
          <Button type="primary" htmlType="submit">
            {isUpdate ? "Update" : "Create"}
          </Button>
        </Form.Item>
      </Form>

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

export default ProductForm;
