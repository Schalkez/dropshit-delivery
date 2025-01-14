import { Button, Form, Input, message, Modal } from "antd";
import React, { useCallback } from "react";
import {
  handleErrorResponse,
  NotificationType,
  showNotification,
} from "../../utils";
import { apiRoutes } from "../../routes/api";
import http from "../../utils/http";

export const DepositModal = ({
  actionRef,
  depositModalOpen,
  setDepositModalOpen,
}: any) => {
  console.log(actionRef?.current);

  const createDepositReq = useCallback(
    async (form: any) => {
      console.log(form);
      if (!form.money || !form.message) {
        message.error("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      try {
        await http.post(apiRoutes.createDeposit, {
          moneyPayment: form.money,
          content: form.message,
        });

        showNotification(
          "Yêu cầu nạp tiền thành công",
          NotificationType.SUCCESS
        );
        actionRef?.current?.reload();
      } catch (error) {
        handleErrorResponse(error);
      } finally {
        setDepositModalOpen(false);
      }
    },
    [setDepositModalOpen, actionRef]
  );

  return (
    <Modal
      footer={null}
      title={"Yêu cầu nạp tiền cho ví giao hàng"}
      open={depositModalOpen}
      onCancel={() => setDepositModalOpen(false)}
    >
      <Form
        onFinish={createDepositReq} // Hàm xử lý submit
        layout="vertical"
      >
        <Form.Item
          name="money"
          label="Số tiền"
          rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
        >
          <Input placeholder="Số tiền" />
        </Form.Item>
        <Form.Item
          name="message"
          label="Thông điệp"
          rules={[{ required: true, message: "Vui lòng nhập thông điệp!" }]}
        >
          <Input placeholder="Thông điệp" />
        </Form.Item>
        <Form.Item className="flex flex-row justify-end">
          <Button
            htmlType="submit" // Quan trọng: Đặt kiểu này để kích hoạt onFinish
            className="bg-[#0a0c10]"
            type="primary"
          >
            Yêu cầu nạp tiền vào ví giao hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
