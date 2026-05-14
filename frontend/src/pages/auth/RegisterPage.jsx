import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Auth_Cover from "./Auth_Cover";

import { Button, Checkbox, Form, Input, message } from "antd";
import { register as registerApi } from "../../services/AuthAPI";

const RegisterPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const payload = {
      ...values,
      role: "USER",
    };
    console.log(payload);
    const res = await registerApi(payload);
    if (res?.status === 200 && res.data?.token) {
      messageApi.open({
        type: "success",
        content: `${res.message} Automatically logging you in...`,
        duration: 2,
      });

      const token = res.data.token;
      localStorage.setItem("access_token", token);
      console.log("Token stored, navigating home.");

      form.resetFields();
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      messageApi.open({
        type: "error",
        content: res.message,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <section className="relative w-screen h-screen">
        <Auth_Cover />

        <div className="absolute top-0 right-0 bottom-0 left-0 px-[20px] lg:px-0 lg:left-1/2 flex items-center justify-center flex-col">
          <div className="max-w-[460px]">
            <div
              className="text-2xl font-bold text-center whitespace-nowrap cursor-pointer"
              onClick={() => navigate("/")}
            >
              NEXTPICK
            </div>
            <h1 className="mt-[50px] poppins-medium text-3xl text-center">
              Sign Up
            </h1>
            <div className="mt-[10px] mb-[60px] poppins-medium text-[15px] leading-[22px] text-[#9E9DA8] text-center">
              Let’s create your account and Shop like a pro and save money.
            </div>
            <Form
              initialValues={{ remember: true }}
              onFinish={onFinish}
              autoComplete="off"
              form={form}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input
                  placeholder="Email"
                  className="h-[50px] poppins-medium text-[18px] leading-[26px]"
                />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input
                  placeholder="Username"
                  className="h-[50px] poppins-medium text-[18px] leading-[26px]"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  placeholder="Password"
                  className="h-[50px] poppins-medium text-[18px] leading-[26px]"
                />
              </Form.Item>

              <Form.Item label={null}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-transparent! border-[1px]! border-[#000]! text-[#1A162E]! h-[50px]! rounded-[10px] poppins-medium text-[18px] leading-[26px] w-full hover:bg-[#da9e08]!"
                >
                  Sign up
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-[110px] poppins-regular text-[#9E9DA8] text-[18px] text-center">
              You have an account yet?{" "}
              <Link
                to={"/login"}
                className="text-[#0071DC] poppins-semibold cursor-pointer hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterPage;
