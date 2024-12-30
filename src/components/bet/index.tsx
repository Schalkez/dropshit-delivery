import {
  BreadcrumbProps,
  Button,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Tag,
  message,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import BasePageContainer from '../layout/PageContainer';
import { DataContext } from '../../context/SocketProvider';
import http from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import clsx from 'clsx';
import { formatNumber } from '../../utils/helpers';
import LoadingScreen from '../common/LoadingScreen';
const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.bet,
      title: <Link to={webRoutes.deposit}>Bet</Link>,
    },
  ],
};

const Bet = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [memberTransactions, setMemberTransactions] = useState<any>();
  const [checkedBet, setCheckedBet] = useState('');
  const { socket } = useContext(DataContext);

  useEffect(() => {
    if (socket) {
      socket.on('WE_PRICE', (we_price: any) => {
        const { second, isBet } = we_price;
        setData({
          second,
          isBet,
        });
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket)
      socket.on('analytic', (data: any) => {
        setMemberTransactions(data);
        setCheckedBet(data?.override_result || '');
      });
  }, [socket]);

  const handleUpdateBet = async ({
    condition,
    member_win_percent,
  }: {
    condition: string;
    member_win_percent: number | null;
  }) => {
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.updateBet, {
        condition,
        member_win_percent,
      });
      if (res && res.data) {
        message.success(res?.data?.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const onChange = (e: RadioChangeEvent) => {
    setCheckedBet(e.target.value);
    handleUpdateBet({
      condition: e.target.value,
      member_win_percent: null,
    });
  };

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <LoadingScreen spinning={loading} />

      <div className="flex items-center gap-[20px] mb-4">
        <h3 className="text-[16px] font-[700]">
          Thời gian còn lại :{' '}
          <span className="text-yellow-700">{data?.second}s </span>
        </h3>
        <h3 className="text-[16px] font-[700]">
          Trạng thái đặt cược :{' '}
          <span
            className={clsx({
              'text-green-700': data?.isBet,
              'text-red-700': !data?.isBet,
            })}
          >
            {data?.isBet ? 'Đang chờ đặt lệnh' : 'Đang chờ kết quả'}
          </span>
        </h3>
      </div>
      <div className="flex gap-4 items-center mb-3">
        <h3 className="text-[14px] font-bold">
          Tổng số cược:{' '}
          <span className="text-green-800">
            {memberTransactions?.totalUserBets}
          </span>{' '}
        </h3>
      </div>
      <div className="flex gap-4 items-center mb-3">
        <h3 className="text-[14px] font-bold">
          Tổng tiền cược:{' '}
          <span className="text-yellow-700">
            {formatNumber(memberTransactions?.moneyTotal)}$
          </span>{' '}
        </h3>
      </div>
      <div className="flex gap-4 items-center mb-3">
        <h3 className="text-[14px] font-bold">
          Tổng tiền mua:{' '}
          <span className="text-green-700">
            {formatNumber(memberTransactions?.moneyUpTotal)}$
          </span>{' '}
        </h3>
        <h3 className="text-[14px] font-bold">
          Tổng tiền bán:{' '}
          <span className="text-red-700">
            {formatNumber(memberTransactions?.moneyDownTotal)}$
          </span>{' '}
        </h3>
      </div>
      <div className="flex gap-10 flex-wrap">
        <div className="mb-3">
          <h3 className="text-[14px] font-bold mb-2">
            {' '}
            *** Chức năng chỉnh cược :
          </h3>
          <Radio.Group
            name="bet"
            defaultValue={memberTransactions?.override_result}
            className="mb-3"
            onChange={onChange}
            value={checkedBet}
          >
            <Radio value={'up'}>Mua</Radio>
            <Radio value={'down'}>Bán</Radio>
            <Radio value={''}>Tắt</Radio>
          </Radio.Group>
          <h3 className="text-[14px] font-bold mb-2">
            Chú ý : Nếu chọn Mua hoặc Bán thì kết thúc phiên sẽ nhảy về mua hoặc
            bán trên biểu đồ
          </h3>
          <h3 className="text-[14px] font-bold mb-2">
            (Tắt nếu muốn kết quả về mặc định. Sau khi hết phiên cược sẽ trở về
            mặc định)
          </h3>
        </div>
        <div className="mb-3">
          <h3 className="text-[14px] font-bold mb-2">
            {' '}
            *** Chức năng chỉnh tỉ lệ thắng (
            {memberTransactions?.member_win_percent})%:
          </h3>
          <div className="max-w-[200px] mb-3">
            <Form
              className="flex gap-2 items-center"
              onFinish={({ member_win_percent }) => {
                if (memberTransactions > 100)
                  return message.error('Tỉ lệ nhỏ hơn 100');
                if (memberTransactions < 10)
                  return message.error('Tỉ lệ lớn hơn 10');
                handleUpdateBet({
                  condition: '',
                  member_win_percent: member_win_percent,
                });
              }}
              initialValues={{
                member_win_percent: memberTransactions?.member_win_percent,
              }}
            >
              <Form.Item className="mb-1" name={'member_win_percent'}>
                <Input
                  placeholder="0"
                  addonAfter="%"
                  type="number"
                  min={0}
                  max={100}
                />
              </Form.Item>
              <Button htmlType="submit">Chỉnh</Button>
            </Form>
          </div>
          <h3 className="text-[14px] font-bold mb-2">
           (Lưu ý: Chỉ áp dụng khi có só cược 1)
          </h3>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Người chơi
              </th>

              <th scope="col" className="px-6 py-3">
                Mua/Bán
              </th>
              <th scope="col" className="px-6 py-3">
                Số tiền cược
              </th>
            </tr>
          </thead>
          <tbody>
            {!!memberTransactions?.userBets?.length &&
              memberTransactions?.userBets?.map((i: any, index: number) => (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={index}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="flex gap-2 items-center">
                      <p>Tên tài khoản: </p>
                      <p>{i?.user?.email}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>ID: </p>
                      <p>{i?.user?._id}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p>Số dư: </p>
                      <p>{formatNumber(i?.user?.real_balance)}$</p>
                    </div>
                  </th>

                  <td className="px-6 py-4">
                    <Tag color={i?.bet_condition === 'up' ? 'green' : 'red'}>
                      {i?.bet_condition === 'up' ? 'Mua' : 'Bán'}
                    </Tag>
                  </td>
                  <td className="px-6 py-4">{formatNumber(i?.bet_value)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </BasePageContainer>
  );
};

export default Bet;
