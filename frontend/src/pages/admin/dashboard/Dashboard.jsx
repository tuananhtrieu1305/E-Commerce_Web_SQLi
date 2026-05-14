import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Tag, Spin, Alert, message } from "antd";
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import moment from "moment";
import formatVND from "../../../helpers/ConvertMoney";

import { getOrder } from "../../../services/OrderAPI";
import { getAccount } from "../../../services/AccountAPI";
import { getProduct } from "../../../services/ProductAPI";

const KpiCard = ({
  title,
  value,
  icon,
  changeType,
  prefix,
  suffix,
  isLoading,
}) => (
  <Card
    bordered={false}
    className="shadow-sm hover:shadow-md transition-shadow h-full"
  >
    {isLoading ? (
      <div className="flex justify-center items-center h-full min-h-[80px]">
        <Spin />
      </div>
    ) : (
      <Statistic
        title={title}
        value={value ?? 0}
        precision={0}
        valueStyle={{
          color:
            changeType === "increase"
              ? "#3f8600"
              : changeType === "decrease"
              ? "#cf1322"
              : "#333",
          fontSize: "1.75rem",
          fontWeight: 600,
        }}
        prefix={
          <>
            {icon}
            {prefix}
          </>
        }
        suffix={<>{suffix}</>}
      />
    )}
  </Card>
);

const Dashboard = () => {
  const [kpiData, setKpiData] = useState({
    revenue: null,
    orders: null,
    customers: null,
    lowStock: null,
  });
  // State for Charts
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  // Loading and Error States
  const [isLoadingKpi, setIsLoadingKpi] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  // Removed isLoadingTable state
  const [error, setError] = useState(null);

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4D4F"];

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingKpi(true);
      setIsLoadingCharts(true);
      // Removed setIsLoadingTable(true);
      setError(null);

      try {
        // --- Fetch data for KPIs and Charts (Current Month) ---
        const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
        const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

        // 1. Orders (Month)
        const orderQueryMonth = `?startTime=${startOfMonth}&endTime=${endOfMonth}`;
        const orderResMonth = await getOrder(orderQueryMonth);
        const monthlyOrders = orderResMonth.data || [];

        // Calculate KPIs
        const totalRevenueMonth = monthlyOrders.reduce(
          (sum, order) => sum + order.total_cost,
          0
        );
        const totalOrdersMonth = monthlyOrders.length;

        // Process for Order Status Chart
        const statusCounts = monthlyOrders.reduce((acc, order) => {
          const status = order.payment_status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        const statusChartData = Object.keys(statusCounts).map((name) => ({
          name,
          value: statusCounts[name],
        }));
        setOrderStatusData(statusChartData);

        // Process for Sales Trend Chart (Last 7 days from monthly data)
        const salesTrend = Array(7)
          .fill(null)
          .map((_, i) => {
            const date = moment().subtract(6 - i, "days");
            return {
              name: date.format("ddd"),
              fullDate: date.format("YYYY-MM-DD"),
              revenue: 0,
            };
          });
        monthlyOrders.forEach((order) => {
          const orderDateStr = moment(order.created_at).format("YYYY-MM-DD");
          const dayData = salesTrend.find((d) => d.fullDate === orderDateStr);
          if (dayData) dayData.revenue += order.total_cost;
        });
        setSalesData(salesTrend);
        setIsLoadingCharts(false);

        // 2. New Customers (Month)
        const accountQueryMonth = `?role=USER&startTime=${startOfMonth}&endTime=${endOfMonth}`;
        const accountResMonth = await getAccount(accountQueryMonth);
        const totalNewCustomersMonth = (accountResMonth.data || []).length;

        // 3. Low Stock Products
        const lowStockQuery = `?max_stock=10`;
        const productResLowStock = await getProduct(lowStockQuery);
        const lowStockCount = (productResLowStock.data || []).length;

        // Update KPI State
        setKpiData({
          revenue: totalRevenueMonth,
          orders: totalOrdersMonth,
          customers: totalNewCustomersMonth,
          lowStock: lowStockCount,
        });
        setIsLoadingKpi(false);

        // --- Removed fetching recent orders ---
      } catch (err) {
        console.error("Dashboard data fetching error:", err);
        setError("Failed to load dashboard data. Please try again later.");
        message.error("Failed to load dashboard data.");
        setIsLoadingKpi(false);
        setIsLoadingCharts(false);
        // Removed setIsLoadingTable(false);
      }
    };

    fetchData();
  }, []); // Run only once on mount

  // --- Removed recentOrderColumns definition ---

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
        />
      )}

      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Total Revenue (Month)"
            value={kpiData.revenue}
            isLoading={isLoadingKpi}
            icon={<DollarCircleOutlined className="mr-2 text-blue-500" />}
            suffix="₫"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Total Orders (Month)"
            value={kpiData.orders}
            isLoading={isLoadingKpi}
            icon={<ShoppingCartOutlined className="mr-2 text-green-500" />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="New Customers (Month)"
            value={kpiData.customers}
            isLoading={isLoadingKpi}
            icon={<UserOutlined className="mr-2 text-purple-500" />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Low Stock Items"
            value={kpiData.lowStock}
            isLoading={isLoadingKpi}
            icon={<WarningOutlined className="mr-2 text-red-500" />}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Sales Trend (Last 7 Days)"
            bordered={false}
            className="shadow-sm"
          >
            {isLoadingCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <Spin />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip formatter={(value) => formatVND(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Order Status (Month)"
            bordered={false}
            className="shadow-sm"
          >
            {isLoadingCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <Spin />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%" // Center X
                    cy="50%" // Center Y
                    labelLine={false} // Keep this false if you like the direct label
                    // --- ADJUST THIS ---
                    outerRadius={70} // Try reducing from 80 to 70 or 65
                    // -------------------
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    // --- Optionally adjust label position ---
                    label={({
                      cx,
                      cy,
                      midAngle,
                      outerRadius,
                      percent,
                      index,
                      name,
                      value,
                    }) => {
                      const radius = outerRadius + 15; // Position label slightly further out
                      const x =
                        cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y =
                        cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      const textAnchor = x > cx ? "start" : "end"; // Align text based on position

                      // Only render label if data exists
                      if (!name || value === 0) return null;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          textAnchor={textAnchor}
                          dominantBaseline="central"
                          fontSize={12}
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
