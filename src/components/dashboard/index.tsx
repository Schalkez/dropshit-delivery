import React, { useEffect, useState } from "react";
import BasePageContainer from "../layout/PageContainer";
import { BreadcrumbProps, Card } from "antd";
import { webRoutes } from "../../routes/web";
import { Link } from "react-router-dom";
import http from "../../utils/http";
import { apiRoutes } from "../../routes/api";
import { RootState, store } from "../../store";

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
  ],
};

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const state: RootState = store.getState() as any;

  const getDataDashboard = async () => {
    try {
      const res = await http.get(apiRoutes.dashboardData);
      if (res && res.data) {
        setData(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDataDashboard();
  }, []);

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Card title="Số dư ví" className="shadow-md">
          <div className="flex gap-2 items-center">
            <div className="font-bold">
              ${state?.admin?.admin?.money?.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card title="Tổng số đơn hàng" className="shadow-md">
          <div className="flex gap-2 items-center">
            <div className="font-bold">${data?.allOrdersTotalPrice || "-"}</div>
          </div>
        </Card>
        <Card title="Tổng lợi nhuận" className="shadow-md">
          <div className="flex gap-2 items-center">
            <div className="font-bold">${data?.totalProfit || "-"}</div>
          </div>
        </Card>
        <Card title="Tiền hàng cần thanh toán" className="shadow-md">
          <div className="flex gap-2 items-center">
            <div className="font-bold">
              ${data?.needResolveOrdersTotalPrice || "-"}
            </div>
          </div>
        </Card>
      </div>
    </BasePageContainer>
  );
};

export default Dashboard;
