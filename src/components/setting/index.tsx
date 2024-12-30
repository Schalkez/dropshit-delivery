import React, { useEffect, useState } from 'react';
import BasePageContainer from '../layout/PageContainer';
import {
  BreadcrumbProps,
  Button,
  Form,
  Input,
  Popover,
  Select,
  Spin,
  Upload,
  message,
} from 'antd';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import http from '../../utils/http';
import { API_URL } from '../../utils';
import LoadingScreen from '../common/LoadingScreen';
import { UploadProps } from 'antd/lib/upload';
import { formatNumber } from '../../utils/helpers';
import FormItem from 'antd/es/form/FormItem';
import { FiDelete, FiEdit, FiUpload } from 'react-icons/fi';
import { apiRoutes } from '../../routes/api';
import { RiCloseCircleLine, RiCloseFill, RiEdit2Fill } from 'react-icons/ri';
import { Option } from 'antd/es/mentions';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.dashboard,
      title: <Link to={webRoutes.dashboard}>Dashboard</Link>,
    },
    {
      key: webRoutes.setting,
      title: <Link to={webRoutes.setting}>Cài đặt</Link>,
    },
  ],
};

const Setting = () => {
  const [configs, setConfigs] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<any>([]);
  const [qrImage, setqrImage] = useState('');
  const [rateInvests, setRateInvest] = useState<any>([])
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

  const getRateInvest = async () => {
    try {
      const res = await http.get(`${API_URL}/getInvest`)
      if (res && res.data) {
        setRateInvest(res?.data?.data)
      }
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }
  }

  useEffect(() => {
    getRateInvest()
  }, [])

  const getBanks = async () => {
    try {
      const res = await http.get(apiRoutes.getBanks);
      if (res && res.data) {
        setBanks(res?.data?.data);
      }
    } catch (error) { }
  };
  useEffect(() => {
    getConfigs();
    getBanks();
  }, []);

  const handleUpdateConfig = async (type: string, value: any, time?: any, configId?: any) => {
    setLoading(true);
    try {
      const res = await http.post(`${API_URL}/edit-config`, {
        type,
        value,
        time,
        configId
      });
      if (res && res.data) {
        message.success('Thành công');
        getConfigs();
      }
    } catch (error) {
      console.log(error);
      message.error('Thất bại');
    }
    setLoading(false);
  };

  const props: UploadProps = {
    name: 'file',
    action: `${import.meta.env.VITE_SOCKET_URL}/api/member/upload`,
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true);
      }
      if (info.file.status === 'done') {
        console.log(info.file.response);
        handleUpdateConfig('LOGO_APP', info.file.response?.url);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setLoading(false);
      }
    },
  };
  const props1: UploadProps = {
    name: 'file',
    action: `${import.meta.env.VITE_SOCKET_URL}/api/member/upload`,
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true);
      }
      if (info.file.status === 'done') {
        setqrImage(info.file.response?.url);
        setLoading(false);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setLoading(false);
      }
    },
  };
  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <LoadingScreen spinning={loading} />
      <div className="flex flex-col gap-2 my-4 p-5">
        <h3 className="font-[900]">Thông tin ngân hàng</h3>
        <Popover
          trigger={'click'}
          content={
            <Form
              onFinish={async (form) => {
                setLoading(true);
                try {
                  const res = await http.post(apiRoutes.addBank, {
                    ...form,
                    qrImage,
                    type: "bank"
                  });
                  if (res && res.data) {
                    message.success('Thành công');
                    getBanks();
                  }
                } catch (error: any) {
                  message.error(error?.respose?.data?.message);
                }
                setLoading(false);
              }}
            >
              <FormItem name="account_name">
                <Input placeholder="Tên tài khoản" />
              </FormItem>
              <FormItem name="name_bank">
                <Input placeholder="Tên ngân hàng" />
              </FormItem>
              <FormItem name="number_bank">
                <Input placeholder="Số tài khoản" />
              </FormItem>
              <FormItem name="region">
                <Select placeholder="Chọn quốc gia">
                  <Option value="vi" >Việt Nam</Option>
                  <Option value="cam" >Campuchia</Option>
                  <Option value="cn" >Trung Quốc</Option>
                  <Option value="thai" >Thái Lan</Option>
                </Select>
              </FormItem>
              <FormItem name="" className="border w-full px-2 rounded-md">
                <Upload {...props1} accept="image/*" showUploadList>
                  <div className="flex items-center gap-2 w-full">
                    <div>Ảnh QR</div>
                    <FiUpload />
                  </div>
                </Upload>
              </FormItem>
              <FormItem>
                <Button htmlType="submit">Thêm</Button>
              </FormItem>
            </Form>
          }
        >
          <Button size="small" className="max-w-[70px]">
            Thêm
          </Button>
        </Popover>
        {banks?.map((i: any, index: number) => {
          if (i?.type === 'bank') return (
            <div className="mb-3 flex gap-1 items-center">
              <div>{i?.name_bank}</div>-
              <div>{i?.region}</div>-
              <div>{i?.number_bank}</div>-<div>{i?.account_name}</div>
              <div>
                <RiCloseCircleLine
                  className="text-[20px] cursor-pointer"
                  onClick={async () => {
                    try {
                      await http.post(apiRoutes.deleteBank, {
                        bankId: i?._id,
                      });
                      await getBanks();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                />
              </div>
              <div>
                <Popover
                  trigger={'click'}
                  content={
                    <Form
                      initialValues={{ ...i }}
                      onFinish={async (form) => {
                        setLoading(true);
                        try {
                          const res = await http.post(apiRoutes.updateBank, {
                            ...form,
                            bankId: i?._id,
                            qrImage,
                            type: "bank"
                          });
                          if (res && res.data) {
                            message.success('Thành công');
                            getBanks();
                          }
                        } catch (error: any) {
                          message.error(error?.respose?.data?.message);
                        }
                        setLoading(false);
                      }}
                    >
                      <FormItem name="account_name">
                        <Input placeholder="Tên tài khoản" />
                      </FormItem>
                      <FormItem name="name_bank">
                        <Input placeholder="Tên ngân hàng" />
                      </FormItem>
                      <FormItem name="number_bank">
                        <Input placeholder="Số tài khoản" />
                      </FormItem>
                      <FormItem name="region">
                        <Select >
                          <Option value="vi" >Việt Nam</Option>
                          <Option value="cam" >Campuchia</Option>
                          <Option value="cn" >Trung Quốc</Option>
                          <Option value="thai" >Thái Lan</Option>
                        </Select>
                      </FormItem>
                      <FormItem name="" className="border w-full px-2 rounded-md">
                        <Upload {...props1} accept="image/*" showUploadList>
                          <div className="flex items-center gap-2 w-full">
                            <div>Ảnh QR</div>
                            <FiUpload />
                          </div>
                        </Upload>
                      </FormItem>
                      <FormItem>
                        <Button htmlType="submit">Sửa</Button>
                      </FormItem>
                    </Form>
                  }
                >
                  <RiEdit2Fill className="text-[20px] cursor-pointer" />
                </Popover>
              </div>
            </div>
          )
        })}

      </div>
      <hr className="my-10" />

      <div className="flex flex-col gap-2 my-4 p-5">
        <h3 className="font-[900]">Thông tin nạp tiền mã hoá</h3>
        <Popover
          trigger={'click'}
          content={
            <Form
              onFinish={async (form) => {
                setLoading(true);
                try {
                  const res = await http.post(apiRoutes.addBank, {
                    ...form,
                    account_name: "Crypto",
                    qrImage,
                    type: "crypto"
                  });
                  if (res && res.data) {
                    message.success('Thành công');
                    getBanks();
                  }
                } catch (error: any) {
                  message.error(error?.respose?.data?.message);
                }
                setLoading(false);
              }}
            >

              <FormItem name="name_bank">
                <Input placeholder="Tên mạng giao dịch" />
              </FormItem>
              <FormItem name="number_bank">
                <Input placeholder="Địa chỉ ví" />
              </FormItem>

              <FormItem name="" className="border w-full px-2 rounded-md">
                <Upload {...props1} accept="image/*" showUploadList>
                  <div className="flex items-center gap-2 w-full">
                    <div>Ảnh QR</div>
                    <FiUpload />
                  </div>
                </Upload>
              </FormItem>
              <FormItem>
                <Button htmlType="submit">Thêm</Button>
              </FormItem>
            </Form>
          }
        >
          <Button size="small" className="max-w-[70px]">
            Thêm
          </Button>
        </Popover>
        {banks?.map((i: any, index: number) => {
          if (i?.type === 'crypto') return (
            <div className="mb-3 flex gap-1 items-center">
              <div>{i?.name_bank}</div>-

              <div>{i?.number_bank}</div>
              <div>
                <RiCloseCircleLine
                  className="text-[20px] cursor-pointer"
                  onClick={async () => {
                    try {
                      await http.post(apiRoutes.deleteBank, {
                        bankId: i?._id,
                      });
                      await getBanks();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                />
              </div>
              <div>
                <Popover
                  trigger={'click'}
                  content={
                    <Form
                      initialValues={{ ...i }}
                      onFinish={async (form) => {
                        setLoading(true);
                        try {
                          const res = await http.post(apiRoutes.updateBank, {
                            ...form,
                            bankId: i?._id,
                            qrImage,
                            type: "crypto"
                          });
                          if (res && res.data) {
                            message.success('Thành công');
                            getBanks();
                          }
                        } catch (error: any) {
                          message.error(error?.respose?.data?.message);
                        }
                        setLoading(false);
                      }}
                    >

                      <FormItem name="name_bank">
                        <Input placeholder="Tên ngân hàng" />
                      </FormItem>
                      <FormItem name="number_bank">
                        <Input placeholder="Số tài khoản" />
                      </FormItem>

                      <FormItem name="" className="border w-full px-2 rounded-md">
                        <Upload {...props1} accept="image/*" showUploadList>
                          <div className="flex items-center gap-2 w-full">
                            <div>Ảnh QR</div>
                            <FiUpload />
                          </div>
                        </Upload>
                      </FormItem>
                      <FormItem>
                        <Button htmlType="submit">Sửa</Button>
                      </FormItem>
                    </Form>
                  }
                >
                  <RiEdit2Fill className="text-[20px] cursor-pointer" />
                </Popover>
              </div>
            </div>
          )
        })}

      </div>
      <hr className="my-10" />
      <div className="flex flex-col gap-2 my-4 p-5">
        <h3 className="font-[900]">Gói đầu tư</h3>

        <div className="grid grid-cols-4 gap-3">
          <div className="font-medium">Gói Đầu tư</div>
          <div className="font-medium">Thời gian</div>
          <div className="font-medium">Lợi nhuận</div>
          <div className="font-medium">Action</div>
        </div>
        {configs?.PACKAGE?.map((i: any, index: number) => (
          <div className="grid grid-cols-4 gap-3">
            <div>{index + 1}</div>
            <div>{i?.time}</div>
            <div>{i?.value}%</div>
            <div className="flex gap-2 items-center">
              <Popover
                trigger={'click'}
                content={
                  <Form
                    onFinish={async (form: any) => {
                      handleUpdateConfig('PACKAGE', form?.value, form?.time, i?._id);
                    }}

                    initialValues={{ ...i }}
                  >
                    <FormItem name="time">
                      <Input placeholder="Nhập thời gian" />
                    </FormItem>
                    <FormItem name="value">
                      <Input placeholder="Nhập % lợi nhuận" />
                    </FormItem>
                    <FormItem>
                      <Button htmlType="submit">Update</Button>
                    </FormItem>
                  </Form>
                }
              >
                <FiEdit />
              </Popover>
            </div>
          </div>
        ))}
      </div>
      <hr className="my-10" />
      <div className="flex flex-col gap-2 my-4 p-5">
        <h3 className="font-[900]">Gói đầu tư</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="font-medium">Gói Đầu tư</div>
          <div className="font-medium">Tỉ lệ</div>
          <div className="font-medium">Action</div>
        </div>
        {
          rateInvests?.map((i: any) => (
            <div className="grid grid-cols-3 gap-3">
              <div className="font-medium">Gói {i?.id}</div>
              <div className="font-medium">
                <p>7 Ngày - {i?.rate?.['7d']}%</p>
                <p>30 Ngày - {i?.rate?.['30d']}%</p>
                <p>90 Ngày - {i?.rate?.['90d']}%</p>
                <p>180 Ngày - {i?.rate?.['180d']}%</p>
                <p>360 Ngày - {i?.rate?.['360d']}%</p>
              </div>
              <div className="font-medium">
                <Popover trigger={'click'} content={
                  <Form
                    onFinish={async (form) => {
                      const formattedForm = Object.keys(form).reduce((acc: any, key) => {
                        // Replace comma with a dot and then parse the string to a float
                        acc[key] = parseFloat(form[key]);
                        return acc;
                      }, {});
                      const res = await http.post(`${API_URL}/handleUpdateInvest`, {
                        investId: i?.id, rate: { ...formattedForm }
                      })
                      if (res && res.data) {
                        message.success("Success")
                        getRateInvest()
                      }
                    }}
                    initialValues={{ ...i?.rate }}>
                    <Form.Item name='7d' label={"Nhập tỉ lệ 7 Ngày"}>
                      <Input placeholder='Nhập tỉ lệ 7 Ngày' type='number' />
                    </Form.Item>
                    <Form.Item name='30d' label={"Nhập tỉ lệ 30 Ngày"}>
                      <Input placeholder='Nhập tỉ lệ 30 Ngày' type='number' />
                    </Form.Item>
                    <Form.Item name='90d' label={"Nhập tỉ lệ 90 Ngày"}>
                      <Input placeholder='Nhập tỉ lệ 90 Ngày' type='number' />
                    </Form.Item>
                    <Form.Item name='180d' label={"Nhập tỉ lệ 180 Ngày"}>
                      <Input placeholder='Nhập tỉ lệ 180 Ngày' type='number' />
                    </Form.Item>
                    <Form.Item name='360d' label={"Nhập tỉ lệ 360 Ngày"}>
                      <Input placeholder='Nhập tỉ lệ 360 Ngày' type='number' />
                    </Form.Item>
                    <Form.Item >
                      <Button htmlType='submit'

                      >Cập nhật</Button>
                    </Form.Item>
                  </Form>
                }>
                  <FiEdit />
                </Popover>
              </div>
            </div>
          ))
        }
      </div>
      <hr className="my-10" />
      <h3 className="font-bold">Cài đặt tỉ giá 1 USD:</h3>
      <div className='mb-3 flex gap-2 items-center'>
        Tỉ giá Việt Nam : {configs?.vi?.value} VNĐ
        <Popover trigger={'click'} content={
          <Form
            onFinish={(form: any) => handleUpdateConfig('vi', form?.value)}
            initialValues={{
              value: configs?.vn?.value
            }}>
            <Form.Item name="value">
              <Input />
            </Form.Item>
            <Form.Item><Button htmlType='submit'>Cập nhật</Button></Form.Item>
          </Form>
        }>
          <FiEdit />
        </Popover>

      </div>
      <div className='mb-3 flex gap-2 items-center'>
        Tỉ giá Trung Quốc : {configs?.cn?.value}CNY
        <Popover trigger={'click'} content={
          <Form
            onFinish={(form: any) => handleUpdateConfig('cn', form?.value)}
            initialValues={{
              value: configs?.vn?.value
            }}>
            <Form.Item name="value">
              <Input />
            </Form.Item>
            <Form.Item><Button htmlType='submit'>Cập nhật</Button></Form.Item>
          </Form>
        }>
          <FiEdit />
        </Popover>

      </div>
      <div className='mb-3 flex gap-2 items-center'>
        Tỉ giá Campuchia : {configs?.cam?.value} Riel
        <Popover trigger={'click'} content={
          <Form
            onFinish={(form: any) => handleUpdateConfig('cam', form?.value)}
            initialValues={{
              value: configs?.vn?.value
            }}>
            <Form.Item name="value">
              <Input />
            </Form.Item>
            <Form.Item><Button htmlType='submit'>Cập nhật</Button></Form.Item>
          </Form>
        }>
          <FiEdit />
        </Popover>

      </div>
      <div className='mb-3 flex gap-2 items-center'>
        Tỉ giá Thái Lan : {configs?.thai?.value} Batd
        <Popover trigger={'click'} content={
          <Form
            onFinish={(form: any) => handleUpdateConfig('thai', form?.value)}
            initialValues={{
              value: configs?.vn?.value
            }}>
            <Form.Item name="value">
              <Input />
            </Form.Item>
            <Form.Item><Button htmlType='submit'>Cập nhật</Button></Form.Item>
          </Form>
        }>
          <FiEdit />
        </Popover>

      </div>
      <hr className="my-10" />
      <div className="flex flex-col gap-2 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <h3 className="font-bold">Số GOM airdrop:</h3>
              <div>
                {(configs && formatNumber(configs?.GOM_AIRDROP?.value)) || 0}
              </div>
              <Popover
                trigger={'click'}
                content={
                  <Form
                    layout="vertical"
                    initialValues={{
                      value: configs?.GOM_AIRDROP?.value || 0,
                    }}
                    onFinish={(form: any) =>
                      handleUpdateConfig('GOM_AIRDROP', form?.value || 0)
                    }
                  >
                    <Form.Item name={'value'}>
                      <Input type="number" placeholder="Nhập số GOM airdrop" />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">Submit</Button>
                    </Form.Item>
                  </Form>
                }
              >
                <Button size="small">Thay đổi</Button>
              </Popover>
            </div>
            <div className="flex gap-2 items-center">
              <h3 className="font-bold">Giá GOM hiện tại:</h3>
              <div>{(configs && configs?.PRICE_GOM?.value) || 0}$</div>
              <Popover
                trigger={'click'}
                content={
                  <Form
                    layout="vertical"
                    initialValues={{
                      value: configs?.PRICE_GOM?.value || 0,
                    }}
                    onFinish={(form: any) =>
                      handleUpdateConfig('PRICE_GOM', form?.value || 0)
                    }
                  >
                    <Form.Item name={'value'}>
                      <Input type="number" placeholder="Nhập số GOM airdrop" />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">Submit</Button>
                    </Form.Item>
                  </Form>
                }
              >
                <Button size="small">Thay đổi</Button>
              </Popover>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <h3 className="font-bold">Phí Giao Dịch:</h3>
              <div>{(configs && configs?.FEE_TRADING?.value) || 0}%</div>
              <Popover
                trigger={'click'}
                content={
                  <Form
                    layout="vertical"
                    onFinish={(form: any) =>
                      handleUpdateConfig('FEE_TRADING', form?.value || 0)
                    }
                  >
                    <Form.Item name={'value'}>
                      <Input type="number" placeholder="Nhập phí giao dịch" />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">Submit</Button>
                    </Form.Item>
                  </Form>
                }
              >
                <Button size="small">Thay đổi</Button>
              </Popover>
            </div>
            <div className="flex flex-col justify-start gap-2 items-start">
              <h3 className="font-bold">Logo App:</h3>
              <Upload {...props} accept="image/*">
                <div className="relative">
                  <img
                    src={configs?.LOGO_APP?.value}
                    width={100}
                    className="rounded-md"
                  />
                </div>
              </Upload>
            </div>
          </div>
        </div>
      </div>
    </BasePageContainer>
  );
};

export default Setting;
