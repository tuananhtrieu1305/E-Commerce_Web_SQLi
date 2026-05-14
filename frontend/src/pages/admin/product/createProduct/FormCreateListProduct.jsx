import { InboxOutlined } from "@ant-design/icons";
import { Table, Upload, Button } from "antd";
import { useState } from "react";
import Exceljs from "exceljs";
import { Buffer } from "buffer";
import { createListProducts } from "../../../../services/ProductAPI";

const FormCreateListProduct = (props) => {
  const { setOpenModalCreateProduct, refreshTable, messageApi } = props;
  const { Dragger } = Upload;
  const [dataImport, setDataImport] = useState([]);

  const props_Upload = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept:
      ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // eslint-disable-next-line no-unused-vars
    customRequest({ file, onSuccess }) {
      setTimeout(() => {
        if (onSuccess) onSuccess("ok");
      }, 1000);
    },
    async onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        messageApi.open({
          type: "success",
          content: `${info.file.name} file uploaded successfully.`,
        });
        if (info?.fileList && info?.fileList.length > 0) {
          const file = info.fileList[0].originFileObj;

          //load file to buffer
          const workbook = new Exceljs.Workbook();
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await workbook.xlsx.load(buffer);

          //convert file to json
          let jsonData = [];
          workbook.worksheets.forEach(function (sheet) {
            // read first row as data keys
            let firstRow = sheet.getRow(1);
            if (!firstRow.cellCount) return;

            let keys = firstRow.values;

            sheet.eachRow((row, rowNumber) => {
              if (rowNumber == 1) return;
              let values = row.values;
              let obj = {};
              for (let i = 1; i < keys.length; i++) {
                obj[keys[i]] = values[i];
              }
              jsonData.push(obj);
            });
          });

          setDataImport(jsonData);
        }
      } else if (status === "error") {
        messageApi.open({
          type: "error",
          content: `${info.file.name} file upload failed.`,
        });
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const handleImportList = async () => {
    const payload = dataImport.map((item) => ({
      title: item.title,
      product_info: item.product_info,
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      seller_name: item.seller_name,
      cate_name: item.cate_name,
    }));
    console.log(payload);

    const res = await createListProducts(payload);
    console.log(res);

    if (res?.status === 200) {
      messageApi.open({
        type: "success",
        content: res.message,
      });
      setDataImport([]);
      setOpenModalCreateProduct(false);
      refreshTable();
    } else {
      messageApi.open({
        type: "error",
        content: res?.message,
      });
    }
  };

  const columns = [
    { dataIndex: "title", title: "Title" },
    { dataIndex: "product_info", title: "Product Info", ellipsis: true },
    { dataIndex: "price", title: "Price" },
    { dataIndex: "stock", title: "Stock" },
    { dataIndex: "seller_name", title: "Seller Name" },
    { dataIndex: "cate_name", title: "Category Name" },
  ];

  return (
    <>
      <Dragger {...props_Upload}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single upload. Only accept .csv, .xls, .xlsx
        </p>
      </Dragger>

      <div style={{ paddingTop: 20 }}>
        <Table
          title={() => <span>Preview Data ({dataImport.length} items):</span>}
          pagination={{ pageSize: 5 }}
          size="small"
          dataSource={dataImport}
          columns={columns}
          rowKey={(record, index) => `${record.title || "row"}-${index}`}
          scroll={{ x: 1500 }}
        />
      </div>
      <Button
        type="primary"
        className="float-right mt-4"
        onClick={() => {
          handleImportList();
        }}
        disabled={dataImport.length === 0}
      >
        Import
      </Button>
    </>
  );
};

export default FormCreateListProduct;
