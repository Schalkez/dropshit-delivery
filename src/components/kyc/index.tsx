import { BreadcrumbProps, Button, message, notification } from 'antd';
import React, { useRef, useState } from 'react';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import BasePageContainer from '../layout/PageContainer';
import {
  ActionType,
  ProColumns,
  ProTable,
  RequestData,
} from '@ant-design/pro-components';
import { FiCheckCircle, FiUsers } from 'react-icons/fi';
import http from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import { handleErrorResponse } from '../../utils';
import { CiCircleCheck } from 'react-icons/ci';
import { RiCloseCircleLine } from 'react-icons/ri';
import LoadingScreen from '../common/LoadingScreen';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.users,
      title: <Link to={webRoutes.kyc}>Xác minh</Link>,
    },
  ],
};

const UserKyc = () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);

  const handleKycUser = async (isKyc: 'success' | 'no_kyc', userId: string) => {
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.handleKyc, {
        isKyc,
        userId,
      });
      if (res && res.data) {
        notification.success({
          message: res.data.message,
          duration: 5,
        });
        actionRef.current?.reload();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message);
    }
    setLoading(false);
  };
  const columns: ProColumns[] = [
    {
      title: 'Tài khoản',

      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <div>Tên tài khoản:</div>
            <div>{row?.email}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Nickname:</div>
            <div>{row.user_name}</div>
          </div>
        </div>
      ),
    },

    {
      title: 'Thông tin',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <>
          <div className="flex items-center justify-between gap-1">
            <div>Số Chứng minh thư/ Hộ chiếu:</div>
            <div className=" font-bold">{row?.identity_number}</div>
          </div>
          <div className="flex flex-col items-start justify-start gap-1 mb-1">
            <div>Ảnh mặt trươc:</div>
            <a href={row?.before_identity_card} target="_blank">
              <img src={row?.before_identity_card} width={100} />
            </a>
          </div>
          <div className="flex flex-col items-start justify-start gap-1 mb-1">
            <div>Ảnh mặt sau:</div>
            <a href={row?.after_identity_card} target="_blank">
              <img src={row?.after_identity_card} width={100} />
            </a>
          </div>
        </>
      ),
    },

    {
      title: 'Ngày tạo',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div>{new Date(row?.createdAt).toLocaleString()}</div>
      ),
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: any) => (
        <div className="flex items-center gap-1">
          <Button
            className="!bg-green-600 text-[#fff] font-[700]"
            onClick={() => handleKycUser('success', row?._id)}
          >
            <CiCircleCheck />
          </Button>
          <Button
            className="!bg-red-600 text-[#fff] font-[700]"
            onClick={() => handleKycUser('no_kyc', row?._id)}
          >
            <RiCloseCircleLine />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <LoadingScreen spinning={loading} />
      <ProTable
        columns={columns}
        cardBordered={false}
        cardProps={{
          subTitle: 'Xác minh danh tính',
          tooltip: {
            className: 'opacity-60',
            title: 'Rút tiền',
          },
          title: <FiCheckCircle className="opacity-60" />,
        }}
        bordered={true}
        showSorterTooltip={false}
        scroll={{ x: true }}
        tableLayout={'fixed'}
        rowSelection={false}
        pagination={{
          showQuickJumper: true,
          pageSize: 20,
        }}
        actionRef={actionRef}
        request={(params) => {
          return http
            .get(apiRoutes.getUserKyc, {
              params: {
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const data: any = response.data.data?.users;

              return {
                data,
                success: true,
                total: response.data.data?.total,
              } as RequestData<any>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<any>;
            });
        }}
        dateFormatter="string"
        search={false}
        rowKey="id"
        options={{
          search: false,
        }}
      />
    </BasePageContainer>
  );
};

export default UserKyc;
