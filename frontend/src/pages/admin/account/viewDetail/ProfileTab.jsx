import { Descriptions } from "antd";
import moment from "moment";

const ProfileTab = ({ accountDataDetail }) => {
  const items = [
    { key: "1", label: "ID", children: accountDataDetail?.id },
    {
      key: "2",
      label: "Username",
      children: accountDataDetail?.username,
      span: 2,
    },
    { key: "3", label: "Email", children: accountDataDetail?.email, span: 3 },
    {
      key: "4",
      label: "Fullname",
      children: accountDataDetail?.profile?.fullname || "No Data",
      span: 3,
    },
    {
      key: "5",
      label: "Address",
      children: accountDataDetail?.profile?.address || "No Data",
      span: 3,
    },
    {
      key: "6",
      label: "Created At",
      children: moment(accountDataDetail?.created_at).format(
        "DD/MM/YYYY HH:mm:ss"
      ),
    },
    {
      key: "7",
      label: "Updated At",
      children: accountDataDetail?.updated_at
        ? moment(accountDataDetail.updated_at).format("DD/MM/YYYY HH:mm:ss")
        : "No Data",
    },
  ];

  return <Descriptions bordered column={3} items={items} size="large" />;
};
export default ProfileTab;
