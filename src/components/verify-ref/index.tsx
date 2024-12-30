import { BreadcrumbProps, Button, message, notification } from 'antd';
import React, { useRef, useState } from 'react';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import BasePageContainer from '../layout/PageContainer';
import Icon, { CheckOutlined, CloseOutlined } from '@ant-design/icons';
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
import { formatNumber } from '../../utils/helpers';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.users,
      title: <Link to={webRoutes.kyc}>Xác nhận</Link>,
    },
  ],
};

const UserRef = () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);

  const handleKycUser = async (
    isCheck: boolean,
    transId: string,
    isMember: boolean
  ) => {
    setLoading(true);
    try { 
      const res = await http.post(apiRoutes.handleVerifyCTV, {
        isCheck,
        transId,
        isMember
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
            <div>{row?.user?.email}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Nickname:</div>
            <div>{row?.user?.last_name}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>UID :</div>
            <div>{row?.user?._id}</div>
          </div>
          <div className="flex items-center justify-between gap-1 text-yellow-800 font-bold">
            <div>Mã giới thiệu :</div>
            <div>{row?.user?.user_name}</div>
          </div>
          <div className="flex items-center justify-between gap-1 font-bold text-green-800">
            <div>Đã nhập mã :</div>
            <div>{row?.user?.ref_code}</div>
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
          {' '}
          <div className="flex items-center justify-between gap-1">
            <div>Yêu cầu :</div>
            <div className=" font-bold text-yellow-600">
              {row?.transaction_type === 'ref' && 'Cộng tiền hoa hồng'}
              {row?.transaction_type === 'verify_ref' && 'Xác nhận nhiệm vụ'}
            </div>
          </div>
          {row?.transaction_type === 'verify_ref' && (
            <div className="flex items-center justify-between gap-1">
              <div>UID đã gửi :</div>
              <div className=" font-bold">{row?.note}</div>
            </div>
          )}
          {row?.transaction_type === 'ref' && (
            <div className="flex items-center justify-between gap-1">
              <div>Số tiền hoa hồng :</div>
              <div className=" font-bold">{formatNumber(row?.value)}$</div>
            </div>
          )}
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
        <div className="flex items-center gap-1 justify-center">
          <>
            {row?.transaction_status === 'pending' ? (
              <>
                <Button
                  className="!bg-green-600 text-[#fff] font-[700]"
                  onClick={() => handleKycUser(true, row?._id, true)}
                >
                  <CiCircleCheck />
                </Button>
                <Button
                  className="!bg-gray-50-600 text-[#fff] font-[700]"
                  onClick={() => handleKycUser(true, row?._id, false)}
                >
                  <CiCircleCheck className='text-[#aaa]' />
                </Button>
                <Button
                  className="!bg-red-600 text-[#fff] font-[700]"
                  onClick={() => handleKycUser(false, row?._id, false)}
                >
                  <RiCloseCircleLine />
                </Button>
              </>
            ) : (
              <div className="font-bold text-center">
                {row?.transaction_status === 'finish' ? (
                  <CheckOutlined className="text-green-700" />
                ) : (
                  <CloseOutlined className="text-red-700" />
                )}
              </div>
            )}
          </>
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
            .get(apiRoutes.getUserJoin, {
              params: {
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const data: any = response.data.data?.deposits;

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

export default UserRef;
