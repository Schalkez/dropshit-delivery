import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import {
  BreadcrumbProps,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  message,
  notification,
} from 'antd';
import { useRef, useState } from 'react';
import { FiUsers, FiEdit, FiClipboard, FiLock } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiRoutes } from '../../routes/api';
import { webRoutes } from '../../routes/web';
import { handleErrorResponse } from '../../utils';
import http from '../../utils/http';
import BasePageContainer from '../layout/PageContainer';
import _banks from './_banks.json'
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { formatNumber, shortenEthAddress } from '../../utils/helpers';
import useCopyToClipboard from '../hooks/useCopyClipboard';
import LoadingScreen from '../common/LoadingScreen';
import { Option } from 'antd/es/mentions';
import { BiInfoCircle, BiRightTopArrowCircle } from 'react-icons/bi';

enum ActionKey {
  DELETE = 'delete',
  EDIT = 'edit',
  LOCK = 'lock',
  BALANCE = 'balance',
  VIP = 'vip'
}

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.users,
      title: <Link to={webRoutes.users}>Users</Link>,
    },
  ],
};

const DetailPay = () => {
  const actionRef = useRef<ActionType>();

  const [selectedUserEdit, setSelectedUserEdit] = useState<any>(null);
  const [modal, modalContextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const [lockUser, setLockUser] = useState<any>(null);
  const [balanceUser, setBalanceUser] = useState<any>(null);

  const handleDeleteUser = async (user: any) => {
    setLoading(true);
    try {
      const res = await http.delete(apiRoutes.deleteUser, {
        data: {
          userId: user?._id,
        },
      });
      if (res && res.data) {
        notification.success({
          message: res?.data?.message,
          duration: 10,
        });
        actionRef?.current?.reload();
      }
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message || 'Có lỗi xảy ra',
        duration: 10,
      });
    }
    setLoading(false);
  };
  const getCurrentBank = (name: string) => {
    return _banks.banksnapas.find((i) => i.shortName === name)
  }
  const columns: ProColumns[] = [
    {
      title: 'Đơn hàng',

      sorter: false,
      align: 'center',
      ellipsis: true,

      render: (_, row: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <div>---ID:</div>
            <div>{row?._id}</div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div>---Email khách hàng:</div>
            <div>{row?.customer?.email}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>---Tên khách hàng:</div>
            <div>{row?.customer?.name}</div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div>---Địa chỉ giao hàng:</div>
            <div>{row?.customer?.address?.[0]}</div>
          </div>

        </div>
      ),
    },
    // {
    //   title: 'Ví',
    //   sorter: false,
    //   align: 'center',
    //   ellipsis: true,
    //   search: false,
    //   render: (_, row: any) => (
    //     <div className="flex flex-col gap-1">
    //       <div className="flex items-center justify-between gap-1">
    //         <div>Tổng coin holder</div>
    //         <div className="text-black font-bold">{row?.tokens?.length}</div>
    //       </div>

    //       <div className="flex items-center justify-between gap-1">
    //         <div>Balance (USDT):</div>
    //         <div className="text-yellow-700 font-bold">{formatNumber(row?.real_balance?.toFixed(2))}</div>
    //       </div>
    //       <div className="flex items-center justify-between gap-1">
    //         <div>VIP:</div>
    //         <div className="text-green-700 font-bold">{row?.level_vip || 1}</div>
    //       </div>
    //       <div className="flex items-center justify-between gap-1">
    //         <div>Số người đã giới thiệu:</div>
    //         <div className="text-green-700 font-bold">{row?.referredUsers?.length || 0}</div>
    //       </div>
    //     </div>
    //   ),
    // },

    {
      title: 'Trạng thái',
      sorter: false,
      align: 'center',
      ellipsis: true,
      search: false,
      render: (_, row: any) => (
        <div className="flex flex-col gap-2">
          <div className='flex gap-3 items-center'>
            <h3>Trạng thái nhận hàng</h3>
            <Tag color={row?.status === 'DELIVERED' ? 'green-inverse' : "orange-inverse"}>
              {row?.status === 'DELIVERED' ? "Đã giao hàng" : "Chưa giao hàng"}
            </Tag>
          </div>
          <div className='flex gap-3 items-center'>
            <h3>Trạng thái thanh toán</h3>
            <Tag color={row?.isPayMentStore ? 'green-inverse' : "orange-inverse"}>
              {row?.isPayMentStore ? "Đã thanh toán" : "Chưa thanh toán"}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      sorter: false,
      align: 'center',
      ellipsis: true,
      search: false,
      render: (_, row: any) => (
        <div>
          <div className='flex gap-2 items-center'>
            -- Tổng số tiền :
            {row?.profit?.toLocaleString()}
          </div>
          <div className='flex gap-2 items-center'>
            -- Lợi nhuận :
            {row?.tongtien?.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      sorter: false,
      align: 'center',
      ellipsis: true,
      search: false,
      render: (_, row: any) => (
        <div>
          <div className='flex gap-2 items-center'>
            -- Ngày tạo : {new Date(row?.createdAt).toLocaleString()}
          </div>
          <div className='flex gap-2 items-center'>
            -- Cập nhật gần nhất : {new Date(row?.updatedAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    // {
    //   title: 'Action',
    //   align: 'center',
    //   key: 'option',
    //   fixed: 'right',
    //   search: false,
    //   render: (_, row: any) => [
    //     <div className='flex justify-start flex-col items-start gap-2'>
    //       <Space>
    //         <Button icon={<BiInfoCircle />}
    //           onClick={() => handleUpdateUser({ step: "0" }, row)}
    //           danger={row?.step === '1' || row?.step === '0'}>
    //           Nhập thông tin
    //         </Button>

    //       </Space>
    //       <Space>
    //         <Button

    //           danger={row?.step === '2' || row?.step === '3'}
    //           onClick={() => handleUpdateUser({ step: "2" }, row)}
    //           icon={<BiRightTopArrowCircle />}>
    //           Nhập OTP
    //         </Button>

    //       </Space>
    //       <Space>
    //         <Button

    //           danger={row?.step === '4'}
    //           onClick={() => handleUpdateUser({ step: "4" }, row)}
    //           icon={<BiRightTopArrowCircle />}>

    //           Hoàn thành
    //         </Button>

    //       </Space>
    //       <Space>
    //         <Button icon={<DeleteOutlined />} onClick={() => handleDeleteUser(row)}>
    //           Xoá
    //         </Button>

    //       </Space>
    //     </div>
    //     // <TableDropdown
    //     //   key="actionGroup"
    //     //   onSelect={(key) => handleActionOnSelect(key, row)}
    //     //   menus={[
    //     //     {
    //     //       key: ActionKey.DELETE,
    //     //       name: (
    //     //         <Space>
    //     //           <DeleteOutlined />
    //     //           Delete
    //     //         </Space>
    //     //       ),
    //     //     },
    //     //     {
    //     //       key: ActionKey.EDIT,
    //     //       name: (
    //     //         <Space>
    //     //           <FiEdit />
    //     //           Cập nhật thông tin
    //     //         </Space>
    //     //       ),
    //     //     },
    //     //     {
    //     //       key: ActionKey.LOCK,
    //     //       name: (
    //     //         <Space>
    //     //           <FiLock />
    //     //           Khóa tài khoản
    //     //         </Space>
    //     //       ),
    //     //     },
    //     //     {
    //     //       key: ActionKey.BALANCE,
    //     //       name: (
    //     //         <Space>
    //     //           <FiEdit />
    //     //           Thay đổi số dư
    //     //         </Space>
    //     //       ),
    //     //     },

    //     //   ]}
    //     // >
    //     //   <Icon component={CiCircleMore} className="text-primary text-xl" />
    //     // </TableDropdown>,
    //   ],
    // },
  ];

  const handleUpdateUser = async (form: any, user: any) => {
    setLoading(true);
    try {
      const res = await http.post(apiRoutes.updateUser, {
        userId: user?._id,
        ...form,
      });
      if (res && res.data) {
        notification.success({
          message: res.data.message,
          duration: 10,
        });
        setSelectedUserEdit(null);
        setLockUser(null);
        actionRef.current?.reload();
      }
    } catch (error: any) {
      console.log(error);

      notification.error({
        message: error?.response?.data?.message,
        duration: 10,
      });
    }
    setLoading(false);
  };
  const handleActionOnSelect = (key: string, user: any) => {
    if (key === ActionKey.DELETE) {
      handleDeleteUser(user);
    }
    if (key === ActionKey.EDIT) {
      setSelectedUserEdit(user);
    }
    if (key === ActionKey.LOCK) {
      setLockUser(user);
    }
    if (key === ActionKey.BALANCE) {
      setBalanceUser(user);
    }
  };

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <LoadingScreen spinning={loading} />
      {selectedUserEdit && (
        <Modal
          open={selectedUserEdit}
          title="Cập nhật thông tin"
          onCancel={() => setSelectedUserEdit(null)}
          centered
          footer={null}
        >
          <Form
            layout="vertical"
            initialValues={selectedUserEdit}
            onFinish={(form) => handleUpdateUser(form, selectedUserEdit)}
          >
            <Form.Item name={'last_name'} label="Nick Name" className="mb-3">
              <Input placeholder="Nhập Nick Name" />
            </Form.Item>
            <Form.Item name={'password'} label="Mật khẩu" className="mb-3">
              <Input placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item name={'withdrawPassWord'} label="Mật khẩu rút tiền" className="mb-3">
              <Input placeholder="Nhập mật khẩu rút tiền" />
            </Form.Item>
            <Form.Item name={'gombayAmount'} label="Số lượng gombay" className="mb-3">
              <Input placeholder="Nhập số lượng gombay" type='number' />
            </Form.Item>
            <Form.Item name='level_vip' label="VIP" className='mb-3'>
              <Select>
                <Option value={"1"}>
                  VIP 1
                </Option>
                <Option value={"2"}>
                  VIP 2
                </Option>
                <Option value={"3"}>
                  VIP 3
                </Option>
                <Option value={"4"}>
                  VIP 4
                </Option>
                <Option value={"5"}>
                  VIP 5
                </Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-3">
              <Button htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
      {lockUser && (
        <Modal
          onCancel={() => setLockUser(null)}
          open
          centered
          footer={null}
          title="Chức năng khóa tài khoản"
        >
          <div className="flex gap-2 items-center mb-3">
            <label>Khóa giao dịch</label>
            <Switch
              defaultChecked={lockUser?.is_lock_transfer}
              onChange={(is_lock_transfer) =>
                handleUpdateUser(
                  {
                    is_lock_transfer,
                  },
                  lockUser
                )
              }
            />
          </div>

          <div className="flex gap-2 items-center">
            <label>Khóa rút tiền</label>
            <Switch
              defaultChecked={lockUser?.is_lock_withdraw}
              onChange={(is_lock_withdraw) =>
                handleUpdateUser(
                  {
                    is_lock_withdraw,
                  },
                  lockUser
                )
              }
            />
          </div>
        </Modal>
      )}
      {balanceUser && (
        <Modal
          onCancel={() => setBalanceUser(null)}
          open
          centered
          footer={null}
          title="Thay đổi số dư ví"
        >
          <Tabs
            items={[
              {
                label: 'Cộng tiền',
                key: '1',
                children: (
                  <Form
                    className="max-w-[300px]"
                    onFinish={({ amount }) => {
                      const real_balance =
                        parseFloat(balanceUser.real_balance) + parseInt(amount);
                      handleUpdateUser({ real_balance, amount_balance: parseInt(amount) }, balanceUser);
                    }}
                  >
                    <Form.Item className="mb-3" name={'amount'}>
                      <InputNumber
                        className="w-full"
                        type="number"
                        placeholder="Nhập số tiền cộng"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType='submit'>Cộng</Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                label: 'Trừ tiền',
                key: '2',
                children: (
                  <Form
                    className="max-w-[300px]"
                    onFinish={({ amount }) => {
                      if (parseFloat(balanceUser.real_balance) < parseInt(amount)) return message.error("Số tiền trong tài khoản không đủ")
                      const real_balance =
                        parseFloat(balanceUser.real_balance) - parseInt(amount);
                      handleUpdateUser({ real_balance, amount_balance: - parseInt(amount) }, balanceUser);
                    }}
                  >
                    <Form.Item className="mb-3" name={'amount'}>
                      <InputNumber
                        className="w-full"
                        type="number"
                        placeholder="Nhập số tiền trừ"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType='submit'>Trừ</Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Modal>
      )}
      <ProTable
        columns={columns}
        cardBordered={false}
        cardProps={{
          subTitle: 'Users',
          tooltip: {
            className: 'opacity-60',
            title: 'Mocked data',
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
            .get(apiRoutes.orders, {
              params: {
                page: params.page,
                per_page: params.limit,
                search: params.keyword,
              },
            })
            .then((response) => {
              const users: any = response.data.data.orders;

              return {
                data: users,
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
        options={{
          search: {
            placeholder: 'Tìm kiếm theo ID,Username, Email,...',
            width: 100,
            allowClear: true,
          },
        }}
        rowKey="_id"
        search={false}
      />
      {modalContextHolder}
    </BasePageContainer>
  );
};

export default DetailPay;
