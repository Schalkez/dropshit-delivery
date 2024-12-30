import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  ProDescriptions,
} from '@ant-design/pro-components';
import {
  BreadcrumbProps,
  Button,
  Modal,
  Spin,
  Tag,
  message,
  notification,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiRoutes } from '../../routes/api';
import { webRoutes } from '../../routes/web';
import { API_URL, handleErrorResponse } from '../../utils';
import http from '../../utils/http';
import BasePageContainer from '../layout/PageContainer';

import Icon, { CheckOutlined } from '@ant-design/icons';
import { formatNumber } from '../../utils/helpers';
import LoadingScreen from '../common/LoadingScreen';
import clsx from 'clsx';
import { RiCloseFill } from 'react-icons/ri';
import Countdown from './Coundown';

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

const HistoriesBetFutrue = () => {
  const actionRef = useRef<ActionType>();
  const [totalWithdraw, setTotalWithdraw] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any>();

  const getConfigs = async () => {
    try {
      const res = await http.get(`${API_URL}/configs`);
      if (res && res.data) {
        const result = res.data.data.reduce((acc: any, item: any) => {
          const { type, ...rest } = item;

          // Check if the type already exists in the accumulator
          if (!acc[type]) {
            // If type doesn't exist, assign the rest as an object
            acc[type] = rest;
          } else if (Array.isArray(acc[type])) {
            // If type exists and is already an array, push the current item
            acc[type].push(rest);
          } else {
            // If type exists but is not an array, convert it to an array
            acc[type] = [acc[type], rest];
          }

          return acc;
        }, {});

        setConfigs(result);
      }
    } catch (error) {
      // Optionally handle the error
      console.error(error);
    }
  };

  const handleUpdateBet = async (idBet: any, isWin?: boolean, row?: any) => {

    if (new Date().getTime() >= new Date(row?.createdAt).getTime() + parseInt(getPackge(row?.bet_id)?.time) * 1000) {
      message.error('Đã hết thời gian cược')
      return actionRef.current?.reload()
    }
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.updateBetFuture, {
        isWin,
        id: idBet,
      });
      if (res && res.data) {
        message.success('Đã sửa cược');
        actionRef.current?.reload();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getConfigs();
  }, []);

  const getPackge = (betId: any) => {
    if (configs?.PACKAGE?.length > 0) {
      const data = configs?.PACKAGE?.find((i: any) => betId === i?._id);
      return data;
    }
  };
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
            <div>{row?.user?.user_name || '-'} </div>
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
            <div>{row?.token_id || '-'}</div>
          </div>
          <div>
            {row?.token_id ? (
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${row?.token_id}.png`}
                width={24}
                className="rounded-full"
              />
            ) : (
              '-'
            )}
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Loại cược:</div>
            <div>
              {row?.bet_condition === 'buy' ? (
                <Tag color="green-inverse">Mua</Tag>
              ) : (
                <Tag color="red-inverse">Bán</Tag>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Gói:</div>
            <div>
              {getPackge(row?.bet_id)?.time}s - {getPackge(row?.bet_id)?.value}%
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Giá vào (USDT):</div>
            <div>{formatNumber(row?.open_price.toFixed(2))}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Giá kết thúc (USDT):</div>
            <div>
              {row?.close_price
                ? formatNumber(row?.close_price.toFixed(2))
                : '-'}
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Số lượng cược (USDT):</div>
            <div>{formatNumber(row?.bet_value?.toFixed(2))}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>Số lượng thắng (USDT):</div>
            <div>{formatNumber(row?.value?.toFixed(2))}</div>
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
          <Countdown date={new Date(new Date(row?.createdAt).getTime() + parseInt(getPackge(row?.bet_id)?.time) * 1000)} />
          {row?.transaction_status !== 'pending' && (
            <div className="flex items-center justify-between gap-1 mb-4">
              {row?.value > 0 ? (
                <Tag color={'green-inverse'}>Thắng</Tag>
              ) : (
                <Tag color={'red-inverse'}>Thua</Tag>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-1">
            {row?.transaction_status === 'pending' ? (
              <Tag color="warning">Đang chờ</Tag>
            ) : row?.transaction_status === 'finish' ? (
              <Tag color={'green-inverse'}>Đã xử lý</Tag>
            ) : (
              <Tag color={'red-inverse'}>Đã hủy</Tag>
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
    {
      title: 'Action',
      sorter: false,
      align: 'center',
      ellipsis: true,
      render: (_, row: any) => (
        <div className="flex flex-col justify-center items-center gap-1">
          {' '}
          {row?.transaction_status === 'pending' && (
            <div className="flex items-center justify-between gap-1 mb-4">
              <Button onClick={() => handleUpdateBet(row?._id, true, row)}>
                <CheckOutlined className="text-green-500" />
              </Button>
              <Button onClick={() => handleUpdateBet(row?._id, false, row)}>
                <RiCloseFill className="text-red-500" />
              </Button>
            </div>
          )}
          {row?.transaction_status !== 'pending' && (
            <div className="flex items-center justify-between gap-1 mb-4">
              {row?.value > 0 ? (
                <Button>
                  <CheckOutlined className="text-green-500" />
                </Button>
              ) : (
                <Button>
                  <RiCloseFill className="text-red-500" />
                </Button>
              )}
            </div>
          )}
        </div>
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
            .get(apiRoutes.historyBetFuture, {
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

export default HistoriesBetFutrue;
