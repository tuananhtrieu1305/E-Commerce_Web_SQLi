import { Modal, Tabs, Image, Divider, Tag } from "antd";
import ProfileTab from "./ProfileTab";
import Anonymous from "../../../../assets/profilePics/Anonymous.png";
import OrderTab from "./OrderTab";
import { STATIC_URL } from "../../../../utils/config";

const ModalViewDetailAccount = (props) => {
  const { openAccountDetail, accountDataDetail, setOpenAccountDetail } = props;
  const avatar_url = `${STATIC_URL}${
    accountDataDetail?.profile?.image
  }`;

  const items = [
    {
      key: "1",
      label: "Account's Information",
      children: <ProfileTab accountDataDetail={accountDataDetail} />,
    },
    ...(accountDataDetail?.role === "USER"
      ? [
          {
            key: "2",
            label: "Order History",
            children: <OrderTab accountDataDetail={accountDataDetail} />,
          },
        ]
      : []),
  ];

  return (
    <Modal
      width={1000}
      title="Account Details"
      open={openAccountDetail}
      onCancel={() => setOpenAccountDetail(false)}
      footer={null}
    >
      <Divider />
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center">
          <figure className="overflow-hidden rounded-full w-[150px] h-[150px]">
            <Image
              width={150}
              height={150}
              className="rounded-full object-cover border-4 border-gray-200 shadow-md"
              src={accountDataDetail?.profile?.image ? avatar_url : Anonymous}
            />
          </figure>
          <h3 className="text-lg font-semibold mt-4">
            {accountDataDetail?.profile?.fullname ||
              accountDataDetail?.username}
          </h3>
          <Tag color={accountDataDetail?.role === "ADMIN" ? "magenta" : "blue"}>
            {accountDataDetail?.role}
          </Tag>
        </div>
        <div className="w-full">
          <Tabs defaultActiveKey="1" items={items} centered />
        </div>
      </div>
    </Modal>
  );
};
export default ModalViewDetailAccount;
