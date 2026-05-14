import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Typography, Spin, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getOrderDetail } from '../../services/OrderAPI';

const { Title, Text } = Typography;

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await getOrderDetail(id);
        if (res.data && res.data.length > 0) setOrder(res.data[0]);
      } catch (error) {
        console.error("Lỗi tải đơn hàng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
  if (!order) return <div style={{ textAlign: 'center', marginTop: 50 }}><Text type="danger">Không tìm thấy đơn hàng</Text></div>;

  const columns = [
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'product_name', 
      key: 'name',
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: 'Đơn giá',
      dataIndex: 'item_price',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Số lượng',
      dataIndex: 'item_quantity',
      align: 'center',
    },
    {
      title: 'Thành tiền',
      render: (_, record) => (
        <span style={{ fontWeight: 'bold' }}>
           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.item_price * record.item_quantity)}
        </span>
      ),
    },
  ];

  let statusColor = order.payment_status === 'PAID' ? 'success' : order.payment_status === 'FAILED' ? 'error' : 'warning';
  let statusText = order.payment_status === 'PAID' ? 'Đã thanh toán' : order.payment_status === 'FAILED' ? 'Thất bại' : 'Chưa thanh toán';

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/profile/orders">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 20 }}>Quay lại danh sách</Button>
      </Link>

      <Card title={<Title level={4}>Chi tiết đơn hàng #{order.id}</Title>}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Ngày đặt">{new Date(order.created_at).toLocaleString('vi-VN')}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={statusColor}>{statusText}</Tag></Descriptions.Item>
          <Descriptions.Item label="Người nhận">{order.customer_name} </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{order.phone}</Descriptions.Item>

          <Descriptions.Item label="Địa chỉ">{order.address}</Descriptions.Item>
          <Descriptions.Item label="Ghi chú">{order.note || "Không có"}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Danh sách sản phẩm</Divider>

        <Table dataSource={order.order_items} columns={columns} rowKey="id" pagination={false} bordered />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Title level={4} type="danger">
            Tổng cộng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_cost)}
          </Title>
        </div>
      </Card>
    </div>
  );
}