
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Đang xác thực thanh toán...');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId');
    
    setOrderId(orderIdParam);

    if (statusParam === 'success') {
      setStatus('success');
      setMessage(`Thanh toán thành công cho đơn hàng #${orderIdParam}! Cảm ơn bạn đã mua hàng.`);
    } else if (statusParam === 'failed') {
      setStatus('error');
      setMessage('Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
    } else {
      setStatus('error');
      setMessage('Không tìm thấy kết quả giao dịch.');
    }
  }, [searchParams]);

  if (status === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin tip={message} size="large" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Result
        status={status}
        title={status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        subTitle={message}
        extra={[
          <Button type="primary" key="home">
            <Link to="/">Quay về trang chủ</Link>
          </Button>,
          <Button key="order">
            <Link to="/profile/orders">Xem lịch sử đơn hàng</Link>
          </Button>,
        ]}
      />
    </div>
  );
}