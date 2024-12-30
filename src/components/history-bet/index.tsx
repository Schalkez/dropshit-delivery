import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  ProDescriptions,
} from '@ant-design/pro-components';
import { BreadcrumbProps, Button, Modal, Spin, Tag, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiRoutes } from '../../routes/api';
import { webRoutes } from '../../routes/web';
import { handleErrorResponse } from '../../utils';
import http from '../../utils/http';
import BasePageContainer from '../layout/PageContainer';

import Icon, { CheckOutlined } from '@ant-design/icons';
import { formatNumber } from '../../utils/helpers';
import LoadingScreen from '../common/LoadingScreen';
import clsx from 'clsx';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.users,
      title: <Link to={webRoutes.history_bet}>Histories Bet</Link>,
    },
  ],
};

const HistoriesBet = () => {
  const actionRef = useRef<ActionType>();
  const [totalWithdraw, setTotalWithdraw] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getTotalWithdraw = async () => {
    try {
      const res = await http.get(apiRoutes.getStatisticsPayment);
      if (res && res.data) {
        setTotalWithdraw(res.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTotalWithdraw();
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Tài khoản',

      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col gap-1 ">
          <div className="flex items-center justify-between gap-1">
            <div>ID:</div>
            <div>{row?.user?._id}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Tên tài khoản:</div>
            <div>{row?.user?.email}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Nickname:</div>
            <div>{row?.user?.user_name || "-"} </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Cược',

      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <div>Token Id:</div>
            <div>{row?.token_id || "-"}</div>
          </div>
          <div>
            {
              row?.token_id ?
                <img src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${row?.token_id}.png`} width={24} className='rounded-full' />
                : "-"
            }

          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Loại cược:</div>
            <div>
              {row?.transaction_type === 'buy_token' ? (
                <Tag color="green-inverse">Mua</Tag>
              ) : (
                <Tag color="red-inverse">Bán</Tag>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Số lượng (USDT):</div>
            <div>{formatNumber(row?.bet_value)}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Số lượng Coin:</div>
            <div>{formatNumber(formatNumber(row?.value?.toFixed(5)))}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col justify-center items-center gap-1">
          {' '}
          <div className="flex items-center justify-between gap-1">
            {row?.transaction_status === 'pending' ? (
              <Tag color='warning'>Limit</Tag>
            ) : (
              <Tag color={'green-inverse'}>
                Đã khớp
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày cược',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div>{new Date(row?.createdAt).toLocaleString()}</div>
      ),
    },
  ];

  const handleWithdraw = async (transId: string, isResolve: boolean) => {
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.handleWithdraw, {
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

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <LoadingScreen spinning={loading} />

      <div className="flex lg:gap-10 gap-3 items-center flex-wrap">
        <div className="flex items-center text-lg font-bold text-red-500 lg:my-6 gap-2">
          <p>Tổng usdt rút: </p>
          <p> {formatNumber(-totalWithdraw?.totalValueWithdraw)} USDT</p>
        </div>
        <div className="flex items-center text-lg font-bold text-green-500 lg:my-6 gap-2">
          <p>Tổng tiền rút: </p>
          <p> {formatNumber(totalWithdraw?.totalValueFiatWithdraw)} VNĐ</p>
        </div>
      </div>

      <ProTable
        columns={columns}
        cardBordered={false}
        cardProps={{
          subTitle: 'Rút tiền',
          tooltip: {
            className: 'opacity-60',
            title: 'Rút tiền',
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
            .get(apiRoutes.historyBet, {
              params: {
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const data: any = response.data.data.histories;

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
    </BasePageContainer>
  );
};

export default HistoriesBet;
