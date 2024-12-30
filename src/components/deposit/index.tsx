import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { CheckOutlined } from '@ant-design/icons';
import {
  Avatar,
  BreadcrumbProps,
  Button,
  Modal,
  Space,
  Spin,
  Tag,
  notification,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiRoutes } from '../../routes/api';
import { webRoutes } from '../../routes/web';
import {
  handleErrorResponse,
  NotificationType,
  showNotification,
} from '../../utils';
import http from '../../utils/http';
import BasePageContainer from '../layout/PageContainer';
import tokens from '../../utils/tokens.json';
import Icon, {
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { formatNumber } from '../../utils/helpers';
import LoadingScreen from '../common/LoadingScreen';

enum ActionKey {
  DELETE = 'delete',
}

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.users,
      title: <Link to={webRoutes.deposit}>Deposit</Link>,
    },
  ],
};

const Deposit = () => {
  const actionRef = useRef<ActionType>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [totalDeposit, setTotalDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetToken = (tokenId: number) => {
    return tokens.find((i) => i.id === tokenId);
  };

  const handleWithdraw = async (transId: string, isResolve: boolean) => {
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.handleDeposit, {
        transId,
        isResolve,
      });
      if (res && res.data) {
        notification.success({
          message: res.data?.message,
          duration: 10,
        });

        actionRef?.current?.reload();
      }
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message,
        duration: 10,
      });
    }
    setLoading(false);
  };

  const getTotalDeposit = async () => {
    try {
      const res = await http.get(apiRoutes.getStatisticsPayment);
      if (res && res.data) {
        setTotalDeposit(res.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  function getCurrencyName(region: string) {
    switch (region) {
      case 'vi':
        return 'Vnd';
      case 'thai':
        return 'Baht';
      case 'cn':
        return 'CNY';
      case 'cam':
        return 'Riel';
      default:
        return 'Currency not found';
    }
  }
  useEffect(() => {
    getTotalDeposit();
  }, []);



  const columns: ProColumns[] = [

    {
      title: 'Nạp',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col gap-1">
          {' '}
          <div className="flex items-center justify-between gap-1">
            <div>Số tiền nạp:</div>
            <div className="text-yellow-700 font-bold">
              {formatNumber(+row?.moneyPayment)}
            </div>
          </div>



        </div>
      ),
    },
    {
      title: 'Ghi chú',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col gap-1 text-center">
          {row?.content ? row?.content : '-'}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col gap-1">
          {' '}
          <div className="flex items-center justify-between gap-1">
            {row?.isResolve === 'RESOLVE' ? (
              <Tag color="green-inverse">Hoàn thành</Tag>
            ) : row?.isResolve === 'PENDING' ? (
              <Tag color="orange-inverse">Đang chờ</Tag>
            ) : (
              <Tag color="red-inverse">Huỷ</Tag>
            )}
          </div>
        </div>
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
  ];
  const handleDeleteTran = async (transId: string) => {
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.handleDeleteTransaction, {
        transId,
      });
      if (res && res.data) {
        notification.success({
          message: res.data?.message,
          duration: 10,
        });

        actionRef?.current?.reload();
      }
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message,
        duration: 10,
      });
    }
    setLoading(false);
  };
  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <LoadingScreen spinning={loading} />
      <ProTable
        columns={columns}
        cardBordered={false}
        cardProps={{
          subTitle: 'Nạp tiền',
          tooltip: {
            className: 'opacity-60',
            title: 'Thông tin nạp tiền',
          },
          title: <FiUsers className="opacity-60" />,
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
            .get(apiRoutes.getDeposit, {
              params: {
                page: params.current,
                limit: params.pageSize,
              },
            })
            .then((response) => {
              const data: any = response.data.data.payment;

              return {
                data,
                success: true,
                total: response.data.data?.total,
              } as RequestData<User>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<User>;
            });
        }}
        dateFormatter="string"
        search={false}
        rowKey="id"
        options={{
          search: false,
        }}
      />
      {modalContextHolder}
    </BasePageContainer>
  );
};

export default Deposit;
