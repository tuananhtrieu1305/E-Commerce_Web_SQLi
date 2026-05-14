import { Tabs, Modal, message } from "antd";
import FormCreateOneAccount from "./FormCreateOneAccount";
import FormCreateManyAccounts from "./FormCreateManyAccounts";

const ModalCreateAccount = (props) => {
  const { openAccountCreate, refreshTable, setOpenAccountCreate, role } = props;
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <Modal
        title="Create Account(s)"
        closable={{ "aria-label": "Custom Close Button" }}
        open={openAccountCreate}
        width={800}
        footer={false}
        onCancel={() => setOpenAccountCreate(false)}
        destroyOnHidden={true}
      >
        <Tabs
          defaultActiveKey="1"
          centered
          items={Array.from({ length: 2 }).map((_, i) => {
            const id = String(i + 1);
            return id == "1"
              ? {
                  label: "Create One Account",
                  key: id,
                  children: (
                    <FormCreateOneAccount
                      role={role}
                      refreshTable={refreshTable}
                      setOpenAccountCreate={setOpenAccountCreate}
                      messageApi={messageApi}
                    />
                  ),
                }
              : {
                  label: "Create List of Accounts",
                  key: id,
                  children: (
                    <FormCreateManyAccounts
                      setOpenAccountCreate={setOpenAccountCreate}
                      refreshTable={refreshTable}
                      messageApi={messageApi}
                    />
                  ),
                };
          })}
        />
      </Modal>
    </>
  );
};
export default ModalCreateAccount;
