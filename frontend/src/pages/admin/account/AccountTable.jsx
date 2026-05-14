import { EditTwoTone, PlusOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Button, Space, Tooltip } from "antd";
import { useRef, useState } from "react";
import { getAccount } from "../../../services/AccountAPI";
import ModalViewDetailAccount from "./viewDetail/ModalViewDetailAccount";
import ModalUpdateAccount from "./updateAccount/ModalUpdateAccount";
import PopDeleteAccount from "./PopDeleteAccount";
import ModalCreateAccount from "./createAccount/ModalCreateAccount";

const AccountTable = (props) => {
  const { role, headerTitle } = props;
  const actionRef = useRef();

  const [openAccountDetail, setOpenAccountDetail] = useState(false);
  const [accountDataDetail, setAccountDataDetail] = useState(null);
  const [openAccountUpdate, setOpenAccountUpdate] = useState(false);
  const [openAccountCreate, setOpenAccountCreate] = useState(false);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      hideInSearch: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            setOpenAccountDetail(true);
            setAccountDataDetail(entity);
          }}
        >
          {entity.id}
        </a>
      ),
    },
    {
      title: "USERNAME",
      dataIndex: "username",
      copyable: true,
      ellipsis: true,
    },
    {
      title: "FULL NAME",
      dataIndex: ["profile", "fullname"],
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      search: true,
      copyable: true,
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
      width: 100,
      render: (dom, entity) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", fontSize: "18px" }}
              className="hover:translate-y-[-5px] hover:top-[5px] transition-all"
              onClick={() => {
                setOpenAccountUpdate(true);
                setAccountDataDetail(entity);
              }}
            />
          </Tooltip>
          <PopDeleteAccount
            accountDataDetail={entity}
            refreshTable={refreshTable}
          />
        </Space>
      ),
    },
  ];

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        // eslint-disable-next-line no-unused-vars
        request={async (params, sort, filter) => {
          let query = `?role=${role}`;
          if (params?.email) {
            query += `&email=${params.email}`;
          }
          if (params?.username) {
            query += `&username=${params.username}`;
          }
          if (params?.profile?.fullname) {
            query += `&fullname=${params.profile.fullname}`;
          }
          if (params?.startTime) {
            query += `&startTime=${params.startTime}`;
          }
          if (params?.endTime) {
            query += `&endTime=${params.endTime}`;
          }

          const res = await getAccount(query);
          return {
            data: res.data,
            success: true,
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
        headerTitle={headerTitle}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setOpenAccountCreate(true)}
            type="primary"
          >
            Create
          </Button>,
        ]}
        search={{
          labelWidth: "auto",
        }}
      />

      <ModalViewDetailAccount
        openAccountDetail={openAccountDetail}
        accountDataDetail={accountDataDetail}
        setOpenAccountDetail={setOpenAccountDetail}
      />

      <ModalUpdateAccount
        openAccountUpdate={openAccountUpdate}
        setOpenAccountUpdate={setOpenAccountUpdate}
        accountDataDetail={accountDataDetail}
        setAccountDataDetail={setAccountDataDetail}
        refreshTable={refreshTable}
      />

      <ModalCreateAccount
        openAccountCreate={openAccountCreate}
        setOpenAccountCreate={setOpenAccountCreate}
        refreshTable={refreshTable}
        role={role}
      />
    </div>
  );
};

export default AccountTable;
