import { useRef, useState } from "react";
import { EditTwoTone, PlusOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Button, Tooltip } from "antd";
import { getOrder } from "../../../services/OrderAPI";
import formatVND from "../../../helpers/ConvertMoney";
import ModalViewDetailOrder from "./viewDetail/ModalViewDetailOrder";
import ModalUpdateOrder from "./updateOrder/ModalUpdateOrder";
import PopDeleteOrder from "./PopDeleteOrder";
import ModalCreateOrder from "./createOrder/ModalCreateOrder";

const OrderTable = () => {
  const actionRef = useRef();
  const [openModalCreateOrder, setOpenModalCreateOrder] = useState(false);
  const [openModalViewDetail, setOpenModalViewDetail] = useState(false);
  const [orderDataDetail, setOrderDataDetail] = useState([]);
  const [openModalUpdateOrder, setOpenModalUpdateOrder] = useState(false);

  const waitTimePromise = async (time = 20) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const waitTime = async (time = 20) => {
    await waitTimePromise(time);
  };

  const columns = [
    {
      title: "CUSTOMER",
      dataIndex: "customer_name",
      copyable: true,
      ellipsis: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return (
          <a
            href="#"
            onClick={() => {
              setOpenModalViewDetail(true);
              setOrderDataDetail(entity);
            }}
          >
            {entity.customer_name}
          </a>
        );
      },
    },
    {
      title: "ADDRESS",
      dataIndex: "address",
      filters: true,
      onFilter: true,
      ellipsis: true,
    },
    {
      title: "PHONE",
      dataIndex: "phone",
      search: true,
      copyable: true,
    },
    {
      title: "TOTAL COST",
      dataIndex: "total_cost",
      valueType: "money",
      hideInSearch: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return <span>{formatVND(entity.total_cost)}</span>;
      },
    },
    {
      title: "TOTAL COST",
      dataIndex: "total_cost",
      valueType: "digitRange",
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            minPrice: value[0],
            maxPrice: value[1],
          };
        },
      },
    },

    {
      title: "CREATED AT",
      key: "showTime",
      dataIndex: "created_at",
      valueType: "date",
      hideInSearch: true,
    },
    {
      title: "CREATED AT",
      dataIndex: "created_at",
      valueType: "dateRange",
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: "ACTION",
      hideInSearch: true,
      // eslint-disable-next-line no-unused-vars
      render(dom, entity, index, action, schema) {
        return (
          <>
            <Tooltip title="Edit">
              <EditTwoTone
                twoToneColor="#f57800"
                style={{
                  cursor: "pointer",
                  marginRight: 15,
                  padding: "5px",
                  fontSize: "18px",
                }}
                className="hover:translate-y-[-5px] hover:top-[5px] transition-all"
                onClick={() => {
                  setOpenModalUpdateOrder(true);
                  setOrderDataDetail(entity);
                }}
              />
            </Tooltip>
            <PopDeleteOrder
              orderDataDetail={entity}
              refreshTable={refreshTable}
            />
          </>
        );
      },
    },
  ];
  const refreshTable = () => {
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        // eslint-disable-next-line no-unused-vars
        request={async (params, sort, filter) => {
          let query = "?1=1";
          if (params?.address) {
            query += `&address=${params.address}`;
          }
          if (params?.phone) {
            query += `&phone=${params.phone}`;
          }
          if (params?.customer_name) {
            query += `&customer_name=${params.customer_name}`;
          }
          if (params?.startTime) {
            query += `&startTime=${params.startTime}`;
          }
          if (params?.endTime) {
            query += `&endTime=${params.endTime}`;
          }
          if (params?.minPrice) {
            query += `&min_cost=${params.minPrice}`;
          }
          if (params?.maxPrice) {
            query += `&max_cost=${params.maxPrice}`;
          }

          const res = await getOrder(query);
          await waitTime(80);
          return {
            data: res.data,
            page: 1,
            success: true,
            // "total": 30
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 5,
          onChange: (page) => console.log(page),
        }}
        headerTitle="MANAGE ORDERS"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setOpenModalCreateOrder(true);
            }}
          >
            Create
          </Button>,
        ]}
      />

      <ModalViewDetailOrder
        openModalViewDetail={openModalViewDetail}
        setOpenModalViewDetail={setOpenModalViewDetail}
        orderDataDetail={orderDataDetail}
      />

      <ModalUpdateOrder
        openModalUpdateOrder={openModalUpdateOrder}
        setOpenModalUpdateOrder={setOpenModalUpdateOrder}
        orderDataDetail={orderDataDetail}
        setOrderDataDetail={setOrderDataDetail}
        refreshTable={refreshTable}
      />

      <ModalCreateOrder
        openModalCreateOrder={openModalCreateOrder}
        setOpenModalCreateOrder={setOpenModalCreateOrder}
        refreshTable={refreshTable}
      />
    </>
  );
};

export default OrderTable;
