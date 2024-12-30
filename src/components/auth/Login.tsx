import { Button, Form, Input } from "antd";
import { Fragment, useEffect, useState } from "react";
import { apiRoutes } from "../../routes/api";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/adminSlice";
import { RootState } from "../../store";
import { useLocation, useNavigate } from "react-router-dom";
import { webRoutes } from "../../routes/web";
import { NotificationType, setPageTitle, showNotification } from "../../utils";
import { Admin } from "../../interfaces/models/admin";
import { defaultHttp } from "../../utils/http";

interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || webRoutes.dashboard;
  const admin = useSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setPageTitle("Admin Login");
  }, []);

  useEffect(() => {
    if (admin) {
      navigate(from, { replace: true });
    }
  }, [admin]);

  const onSubmit = (values: FormValues) => {
    setLoading(true);

    defaultHttp
      .post(apiRoutes.login, {
        email: values.email,
        password: values.password,
      })
      .then((response: any) => {
        if (response?.data?.data?.user?.roles?.[0]?.code === "SELLER") {
          const admin: Admin = {
            token: response.data?.data?.tokens.accessToken,
            admin: response.data?.data?.user,
          };
          dispatch(login(admin));
          return;
        }
        showNotification(
          "Vui lòng đăng nhập tài khoản bán hàng",
          NotificationType.ERROR
        );
        setLoading(false);
      })
      .catch((error: any) => {
        showNotification(
          error?.response?.data?.message,
          NotificationType.ERROR
        );
        setLoading(false);
      });
  };

  return (
    <Fragment>
      <img src="https://m.media-amazon.com/images/G/28/AS/AGS/images/website/ags-logo-brightbackground-1.png" />
      <Form
        className="space-y-4 md:space-y-6"
        form={form}
        name="login"
        onFinish={onSubmit}
        layout={"vertical"}
        requiredMark={false}
      >
        <div>
          <Form.Item
            name="email"
            label={
              <p className="block text-sm font-medium text-gray-900">Email</p>
            }
            rules={[
              {
                required: true,
                message: "Please enter your email",
              },
            ]}
          >
            <Input className="bg-gray-50 text-gray-900 sm:text-sm py-1.5" />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            name="password"
            label={
              <p className="block text-sm font-medium text-gray-900">
                Password
              </p>
            }
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              visibilityToggle={false}
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>

        <div className="text-center">
          <Button
            className="mt-4 bg-primary"
            block
            loading={loading}
            type="primary"
            size="large"
            htmlType={"submit"}
          >
            Login
          </Button>
        </div>
      </Form>
    </Fragment>
  );
};

export default Login;
