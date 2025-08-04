import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Package,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import type { Transaction, Product, Customer } from "@shared/schema";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ar } from "date-fns/locale";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: format(startOfDay(new Date()), "yyyy-MM-dd"),
    to: format(endOfDay(new Date()), "yyyy-MM-dd"),
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    retry: false,
  });

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt || "");
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    return transactionDate >= fromDate && transactionDate <= toDate;
  });

  // Calculate metrics
  const totalSales = filteredTransactions.reduce((sum, t) => sum + Number(t.total), 0);
  const totalOrders = filteredTransactions.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  // Compare with previous period
  const previousPeriodStart = subDays(new Date(dateRange.from), 
    Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24))
  );
  const previousTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt || "");
    return transactionDate >= previousPeriodStart && transactionDate < new Date(dateRange.from);
  });
  
  const previousSales = previousTransactions.reduce((sum, t) => sum + Number(t.total), 0);
  const salesGrowth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

  // Top products by sales
  const productSales = filteredTransactions.reduce((acc, transaction) => {
    // Since we don't have transaction items in this simplified version,
    // we'll use customer name as a proxy for product analysis
    const key = transaction.customerName;
    acc[key] = (acc[key] || 0) + Number(transaction.total);
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Sales by status
  const salesByStatus = filteredTransactions.reduce((acc, transaction) => {
    const status = transaction.status || "pending";
    acc[status] = (acc[status] || 0) + Number(transaction.total);
    return acc;
  }, {} as Record<string, number>);

  const setQuickDateRange = (days: number) => {
    const today = new Date();
    const startDate = subDays(today, days);
    setDateRange({
      from: format(startDate, "yyyy-MM-dd"),
      to: format(today, "yyyy-MM-dd"),
    });
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('ar-SA');
    const period = `${format(new Date(dateRange.from), "dd/MM/yyyy", { locale: ar })} - ${format(new Date(dateRange.to), "dd/MM/yyyy", { locale: ar })}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير المبيعات والإحصائيات - ${period}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              margin: 20px; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              text-align: right;
              color: #1e293b;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .report-title {
              font-size: 20px;
              color: #475569;
              margin-bottom: 5px;
            }
            .report-date {
              font-size: 16px;
              color: #64748b;
            }
            .summary-section {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              background: #f8fafc;
            }
            .summary-number {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .summary-label {
              font-size: 14px;
              color: #64748b;
            }
            .sales { color: #16a34a; }
            .orders { color: #2563eb; }
            .average { color: #7c3aed; }
            .customers { color: #ea580c; }
            .transactions-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .transactions-table th,
            .transactions-table td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: right;
            }
            .transactions-table th {
              background-color: #f1f5f9;
              font-weight: bold;
              color: #1e293b;
            }
            .status-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-completed {
              background: #dcfce7;
              color: #16a34a;
            }
            .status-pending {
              background: #fef3c7;
              color: #d97706;
            }
            .status-cancelled {
              background: #fef2f2;
              color: #dc2626;
            }
            .products-section {
              margin-top: 30px;
            }
            .products-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .product-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              background: #f8fafc;
            }
            .product-name {
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 5px;
            }
            .product-info {
              color: #64748b;
              font-size: 14px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">تقرير المبيعات والإحصائيات</div>
            <div class="report-title">تحليل شامل للأداء المالي</div>
            <div class="report-date">الفترة: ${period}</div>
            <div class="report-date">تاريخ الطباعة: ${today}</div>
          </div>

          <div class="summary-section">
            <div class="summary-card">
              <div class="summary-number sales">${totalSales.toFixed(2)} ₺</div>
              <div class="summary-label">إجمالي المبيعات</div>
            </div>
            <div class="summary-card">
              <div class="summary-number orders">${totalOrders}</div>
              <div class="summary-label">عدد الطلبات</div>
            </div>
            <div class="summary-card">
              <div class="summary-number average">${averageOrderValue.toFixed(2)} ₺</div>
              <div class="summary-label">متوسط قيمة الطلب</div>
            </div>
            <div class="summary-card">
              <div class="summary-number customers">${customers.length}</div>
              <div class="summary-label">عدد العملاء</div>
            </div>
          </div>

          <h3>تفاصيل المعاملات</h3>
          <table class="transactions-table">
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(transaction => `
                <tr>
                  <td>${transaction.transactionNumber}</td>
                  <td>${transaction.customerName}</td>
                  <td>${format(new Date(transaction.createdAt || ""), "dd/MM/yyyy", { locale: ar })}</td>
                  <td><strong>${Number(transaction.total).toFixed(2)} ₺</strong></td>
                  <td>
                    <span class="status-badge status-${transaction.status}">
                      ${transaction.status === "completed" ? "مكتملة" : 
                        transaction.status === "pending" ? "في الانتظار" : 
                        "ملغية"}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="products-section">
            <h3>معلومات المخزون</h3>
            <div class="products-grid">
              ${products.slice(0, 10).map(product => `
                <div class="product-card">
                  <div class="product-name">${product.name}</div>
                  <div class="product-info">الكود: ${product.sku}</div>
                  <div class="product-info">الكمية: ${product.quantity} قطعة</div>
                  <div class="product-info">السعر: ${Number(product.price).toFixed(2)} ₺</div>
                  <div class="product-info">الفئة: ${product.category}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً من نظام إدارة المخزون</p>
            <p>جميع الأسعار بالليرة التركية (₺)</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const exportReport = (type: 'pdf' | 'excel') => {
    if (type === 'pdf') {
      printReport();
    } else {
      // Excel export functionality
      console.log('Exporting Excel report');
      alert('سيتم تصدير التقرير كـ Excel قريباً');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="التقارير والإحصائيات"
          subtitle="تحليل شامل لأداء المبيعات والعمليات"
        />
        <main className="flex-1 overflow-auto p-6">
          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                فترة التقرير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* أزرار الفترات السريعة */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={dateRange.from === format(startOfDay(new Date()), "yyyy-MM-dd") && 
                             dateRange.to === format(endOfDay(new Date()), "yyyy-MM-dd") ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setQuickDateRange(0)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    اليوم
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuickDateRange(7)}
                    className="hover:bg-blue-50"
                  >
                    أسبوع
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuickDateRange(30)}
                    className="hover:bg-blue-50"
                  >
                    شهر
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const today = new Date();
                      const startOfCurrentMonth = startOfMonth(today);
                      setDateRange({
                        from: format(startOfCurrentMonth, "yyyy-MM-dd"),
                        to: format(endOfMonth(today), "yyyy-MM-dd"),
                      });
                    }}
                    className="hover:bg-blue-50"
                  >
                    هذا الشهر
                  </Button>
                </div>

                {/* تحديد فترة مخصصة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">من تاريخ</Label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">إلى تاريخ</Label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={() => printReport()} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 ml-1" />
                      طباعة التقرير
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('excel')} size="sm" className="flex-1">
                      <Download className="h-4 w-4 ml-1" />
                      Excel
                    </Button>
                  </div>
                </div>

                {/* عرض الفترة المحددة */}
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <span className="text-sm text-blue-700 font-medium">
                    الفترة المحددة: من {format(new Date(dateRange.from), "dd/MM/yyyy", { locale: ar })} 
                    إلى {format(new Date(dateRange.to), "dd/MM/yyyy", { locale: ar })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="sales">تحليل المبيعات</TabsTrigger>
              <TabsTrigger value="products">المنتجات</TabsTrigger>
              <TabsTrigger value="customers">العملاء</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-green-600">{totalSales.toFixed(2)} ₺</p>
                        <div className="flex items-center gap-1 mt-1">
                          {salesGrowth >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(salesGrowth).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">عدد الطلبات</p>
                        <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                        <p className="text-sm text-slate-500">طلب</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">متوسط قيمة الطلب</p>
                        <p className="text-2xl font-bold text-purple-600">{averageOrderValue.toFixed(2)} ₺</p>
                        <p className="text-sm text-slate-500">للطلب الواحد</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">عدد العملاء</p>
                        <p className="text-2xl font-bold text-orange-600">{customers.length}</p>
                        <p className="text-sm text-slate-500">عميل نشط</p>
                      </div>
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ملخص إضافي */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الفترة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700 font-medium">إجمالي المبيعات</span>
                        <span className="text-green-800 font-bold text-lg">{totalSales.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">عدد المعاملات</span>
                        <span className="text-blue-800 font-bold text-lg">{totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700 font-medium">متوسط قيمة المعاملة</span>
                        <span className="text-purple-800 font-bold text-lg">{averageOrderValue.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>مقارنة مع الفترة السابقة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">نمو المبيعات</p>
                        <div className="flex items-center justify-center gap-2">
                          {salesGrowth >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`text-2xl font-bold ${salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(salesGrowth).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {salesGrowth >= 0 ? 'زيادة' : 'انخفاض'} مقارنة بالفترة السابقة
                        </p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-slate-600">المبيعات في الفترة السابقة</p>
                        <p className="text-lg font-semibold text-slate-800">{previousSales.toFixed(2)} ₺</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sales Analysis Tab */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل المبيعات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-4 py-2 text-right">رقم الفاتورة</th>
                          <th className="border border-slate-300 px-4 py-2 text-right">العميل</th>
                          <th className="border border-slate-300 px-4 py-2 text-right">التاريخ</th>
                          <th className="border border-slate-300 px-4 py-2 text-right">المبلغ</th>
                          <th className="border border-slate-300 px-4 py-2 text-right">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-slate-50">
                            <td className="border border-slate-300 px-4 py-2">{transaction.transactionNumber}</td>
                            <td className="border border-slate-300 px-4 py-2">{transaction.customerName}</td>
                            <td className="border border-slate-300 px-4 py-2">
                              {format(new Date(transaction.createdAt || ""), "dd/MM/yyyy", { locale: ar })}
                            </td>
                            <td className="border border-slate-300 px-4 py-2 font-medium">
                              {Number(transaction.total).toFixed(2)} ₺
                            </td>
                            <td className="border border-slate-300 px-4 py-2">
                              <Badge variant={
                                transaction.status === "completed" ? "default" : 
                                transaction.status === "pending" ? "secondary" : 
                                "destructive"
                              }>
                                {transaction.status === "completed" ? "مكتملة" : 
                                 transaction.status === "pending" ? "في الانتظار" : 
                                 "ملغية"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>حالة المخزون</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {products.slice(0, 10).map((product) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-slate-600">{product.sku}</p>
                          </div>
                          <div className="text-left">
                            <Badge variant={Number(product.quantity) > Number(product.minQuantity) ? "default" : "destructive"}>
                              {product.quantity} قطعة
                            </Badge>
                            <p className="text-sm text-slate-600">{Number(product.price).toFixed(2)} ₺</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {products.slice(0, 5).map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-slate-600">{product.category}</p>
                            </div>
                          </div>
                          <span className="font-bold text-green-600">{Number(product.price).toFixed(2)} ₺</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>قائمة العملاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="border rounded-lg p-4">
                        <h4 className="font-medium">{customer.name}</h4>
                        {customer.email && <p className="text-sm text-slate-600">{customer.email}</p>}
                        {customer.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
                        <div className="mt-2">
                          <Badge variant="outline">
                            {customer.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}