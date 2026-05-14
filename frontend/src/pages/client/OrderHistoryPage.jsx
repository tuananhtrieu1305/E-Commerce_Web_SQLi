import React, { useEffect, useState } from 'react';
import { Table, Button, message, Spin } from 'antd';
import { EyeOutlined, CreditCardOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getOrderHistory, createVnpayPayment } from '../../services/OrderAPI';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await getOrderHistory(userId);
        setOrders(res);
      } catch (error) {
        message.error("Lỗi không tải được lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const handleRepay = async (orderId) => {
    try {
      message.loading({ content: "Đang chuyển hướng...", key: "pay_loading" });
      const res = await createVnpayPayment(orderId);
      const paymentUrl = res.paymentUrl || res.data?.paymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        message.error({ content: "Không lấy được link thanh toán", key: "pay_loading" });
      }
    } catch (error) {
      console.error(error);
      message.error({ content: "Lỗi tạo link thanh toán", key: "pay_loading" });
    }
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      align: 'center',
      render: (text) => <span className="font-semibold text-gray-900">#{text}</span>,
    },
    {
      title: 'Sản phẩm',
      key: 'products',
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          {record.order_items?.map((item, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-gray-900">{item.product_name}</span>
              <span className="text-gray-500 ml-2">x{item.item_quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      align: 'center',
      render: (date) => date ? (
        <div className="text-gray-700">
          {new Date(date).toLocaleString('vi-VN', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
      ) : '',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 150,
      align: 'right',
      render: (val) => (
        <span className="text-gray-900 font-semibold text-base">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 160,
      align: 'center',
      render: (status) => {
        if (status === 'PAID') {
          return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Đã thanh toán</span>
            </div>
          );
        }
        if (status === 'FAILED') {
          return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Thất bại</span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Chờ thanh toán</span>
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => {
        if (record.payment_status === 'PAID') {
          return (
            <Link to={`/order-detail/${record.id}`}>
              <Button 
                icon={<EyeOutlined />}
                className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
              >
                Chi tiết
              </Button>
            </Link>
          );
        }
        return (
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={() => handleRepay(record.id)}
            className="bg-gray-900 hover:bg-gray-800 border-0"
          >
            Thanh toán
          </Button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2.5 bg-gray-50/50 backdrop-blur-sm rounded-xl hover:bg-gray-100/50 transition-all">
              <ArrowLeftOutlined className="text-xl text-gray-700" />
            </Link>
            <div className="p-2.5 bg-gray-50/50 backdrop-blur-sm rounded-xl">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Lịch sử đơn hàng
              </h1>
              <p className="text-sm text-gray-500">Quản lý và theo dõi đơn hàng của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={orders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                position: ['bottomCenter'],
                showTotal: (total) => (
                  <span className="text-gray-600">
                    Tổng <span className="font-semibold text-gray-900">{total}</span> đơn hàng
                  </span>
                ),
                className: "py-4"
              }}
              locale={{
                emptyText: (
                  <div className="py-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có đơn hàng nào</p>
                  </div>
                )
              }}
              className="modern-table"
            />
          </div>
        )}
      </div>

      <style>{`
        .modern-table .ant-table {
          background: transparent;
        }
        
        .modern-table .ant-table-thead > tr > th {
          background: transparent;
          border-bottom: 1px solid #f0f0f0;
          font-weight: 600;
          color: #374151;
          padding: 16px;
        }
        
        .modern-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f9fafb;
          padding: 16px;
        }
        
        .modern-table .ant-table-tbody > tr:hover > td {
          background: rgba(249, 250, 251, 0.5);
        }
        
        .modern-table .ant-pagination {
          margin: 24px 0;
        }
        
        .modern-table .ant-pagination-item {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .modern-table .ant-pagination-item-active {
          background: #111827;
          border-color: #111827;
        }
        
        .modern-table .ant-pagination-item-active a {
          color: white;
        }
        
        .modern-table .ant-empty-description {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}