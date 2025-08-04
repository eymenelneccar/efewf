import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  Truck,
  Plus,
  Search,
  Trash2,
  Package,
  Calendar,
  Printer,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface Shipment {
  id: string;
  customerName: string;
  address: string;
  phone?: string;
  status: "paid" | "unpaid";
  createdAt: string;
}

interface DailyShipmentsTableProps {
  currency: string;
}

export default function DailyShipmentsTable({ currency }: DailyShipmentsTableProps) {
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"paid" | "unpaid">("unpaid");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  // جلب قائمة العملاء
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async (): Promise<Customer[]> => {
      try {
        const response = await apiRequest("GET", "/api/customers");
        const data = await response.json();
        return data as Customer[];
      } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
    },
    retry: false,
  });

  // بيانات الشحنات
  const { data: shipments = [], isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments", search],
    queryFn: async (): Promise<Shipment[]> => {
      try {
        const response = await apiRequest("GET", "/api/shipments");
        const data = await response.json();
        let shipmentsData = data as Shipment[];

        // تصفية البحث
        if (search.trim()) {
          shipmentsData = shipmentsData.filter(item => 
            item.customerName.toLowerCase().includes(search.toLowerCase()) ||
            item.address.toLowerCase().includes(search.toLowerCase()) ||
            item.phone?.includes(search)
          );
        }

        return shipmentsData;
      } catch (error) {
        console.error("Error fetching shipments:", error);
        return [];
      }
    },
    retry: false,
  });

  const addShipmentMutation = useMutation({
    mutationFn: async (customerName: string) => {
      const shipmentData = {
        customerName,
        address: "عنوان تم الحصول عليه من الباركود",
        phone: null,
        status: "unpaid",
        createdAt: new Date().toISOString(),
      };

      const response = await apiRequest("POST", "/api/shipments", shipmentData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إضافة الشحنة");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setBarcodeInput("");
      setShowBarcodeScanner(false);
      toast({
        title: "تم إضافة الشحنة",
        description: "تم إضافة العميل إلى جدول الشحنات اليومية",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الشحنة",
        variant: "destructive",
      });
    },
  });

  const addManualShipmentMutation = useMutation({
    mutationFn: async ({ customerId, status, date }: { customerId: string, status: "paid" | "unpaid", date: string }) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) throw new Error("العميل غير موجود");

      const shipmentData = {
        customerName: customer.name,
        address: customer.address || "عنوان غير محدد",
        phone: customer.phone || null,
        status,
        createdAt: new Date(date).toISOString(),
      };

      const response = await apiRequest("POST", "/api/shipments", shipmentData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إضافة الشحنة");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setSelectedCustomer("");
      setSelectedStatus("unpaid");
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setShowManualForm(false);
      toast({
        title: "تم إضافة الشحنة",
        description: "تم إضافة الشحنة اليدوية بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الشحنة",
        variant: "destructive",
      });
    },
  });

  const updateShipmentStatusMutation = useMutation({
    mutationFn: async ({ shipmentId, status }: { shipmentId: string; status: "paid" | "unpaid" }) => {
      const response = await apiRequest("PATCH", `/api/shipments/${shipmentId}`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الدفع بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الدفع",
        variant: "destructive",
      });
    },
  });

  const handleBarcodeScan = () => {
    if (!barcodeInput.trim()) return;
    addShipmentMutation.mutate(barcodeInput.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBarcodeScan();
    }
  };

  const handleManualShipmentAdd = () => {
    if (!selectedCustomer) {
      toast({
        title: "خطأ",
        description: "يجب اختيار عميل",
        variant: "destructive",
      });
      return;
    }

    addManualShipmentMutation.mutate({
      customerId: selectedCustomer,
      status: selectedStatus,
      date: selectedDate,
    });
  };

  const handleStatusChange = (shipmentId: string, status: "paid" | "unpaid") => {
    updateShipmentStatusMutation.mutate({ shipmentId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "دفع";
      case "unpaid":
        return "لم يدفع بعد";
      default:
        return status;
    }
  };

  const printDailyReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('en-GB');
    const totalShipments = shipments.length;
    const paidShipments = shipments.filter(s => s.status === 'paid').length;
    const unpaidShipments = shipments.filter(s => s.status === 'unpaid').length;

    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير الشحنات اليومية - ${today}</title>
          <style>
            body { 
              margin: 20px; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              text-align: right;
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
              grid-template-columns: repeat(3, 1fr);
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
            .paid { color: #16a34a; }
            .unpaid { color: #dc2626; }
            .total { color: #2563eb; }
            .shipments-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .shipments-table th,
            .shipments-table td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: right;
            }
            .shipments-table th {
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
            .status-paid {
              background: #dcfce7;
              color: #16a34a;
            }
            .status-unpaid {
              background: #fef2f2;
              color: #dc2626;
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
            <div class="company-name">تقرير الشحنات اليومية</div>
            <div class="report-title">قائمة شحنات اليوم</div>
            <div class="report-date">التاريخ الميلادي: ${today}</div>
          </div>

          <div class="summary-section">
            <div class="summary-card">
              <div class="summary-number total">${totalShipments}</div>
              <div class="summary-label">إجمالي الشحنات</div>
            </div>
            <div class="summary-card">
              <div class="summary-number paid">${paidShipments}</div>
              <div class="summary-label">الشحنات المدفوعة</div>
            </div>
            <div class="summary-card">
              <div class="summary-number unpaid">${unpaidShipments}</div>
              <div class="summary-label">الشحنات غير المدفوعة</div>
            </div>
          </div>

          <table class="shipments-table">
            <thead>
              <tr>
                <th>رقم الشحنة</th>
                <th>اسم العميل</th>
                <th>العنوان</th>
                <th>الهاتف</th>
                <th>حالة الدفع</th>
                <th>وقت الإضافة</th>
              </tr>
            </thead>
            <tbody>
              ${shipments.map((shipment, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${shipment.customerName}</td>
                  <td>${shipment.address}</td>
                  <td>${shipment.phone || 'غير محدد'}</td>
                  <td>
                    <span class="status-badge status-${shipment.status}">
                      ${getStatusText(shipment.status)}
                    </span>
                  </td>
                  <td>${new Date(shipment.createdAt).toLocaleString('en-GB')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            تم إنشاء هذا التقرير بواسطة نظام إدارة المؤسسات - ${new Date().toLocaleString('en-GB')}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            جدول الشحنات اليومية
            <Badge variant="secondary">{shipments.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={printDailyReport}
              className="bg-purple-600 hover:bg-purple-700 text-xs px-2 py-1"
            >
              <Printer className="h-3 w-3 ml-1" />
              طباعة التقرير
            </Button>
            <Button
              size="sm"
              onClick={() => setShowManualForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1"
            >
              <Plus className="h-3 w-3 ml-1" />
              إضافة شحنة
            </Button>
            <Button
              size="sm"
              onClick={() => setShowBarcodeScanner(true)}
              className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
            >
              <QrCode className="h-3 w-3 ml-1" />
              مسح باركود
            </Button>
            <div className="relative max-w-xs">
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="البحث في الشحنات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 text-sm"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              لا توجد شحنات اليوم
            </h3>
            <p className="text-slate-600 mb-4">
              ابدأ بمسح باركود عنوان العميل لإضافة شحنة جديدة
            </p>
            <Button
              onClick={() => setShowBarcodeScanner(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <QrCode className="h-4 w-4 ml-2" />
              مسح باركود العنوان
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right font-semibold">اسم العميل</TableHead>
                  <TableHead className="text-right font-semibold">العنوان</TableHead>
                  <TableHead className="text-right font-semibold">الهاتف</TableHead>
                  <TableHead className="text-right font-semibold">حالة الدفع</TableHead>
                  <TableHead className="text-right font-semibold">وقت الإضافة</TableHead>
                 
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded">
                          <Truck className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="font-medium">{shipment.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 line-clamp-2 max-w-[200px]">
                        {shipment.address}
                      </span>
                    </TableCell>
                    <TableCell>
                      {shipment.phone ? (
                        <span className="text-sm">{shipment.phone}</span>
                      ) : (
                        <span className="text-sm text-slate-400">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={shipment.status}
                        onValueChange={(value: "paid" | "unpaid") => 
                          handleStatusChange(shipment.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge className={getStatusColor(shipment.status)}>
                              {getStatusText(shipment.status)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-green-600" />
                              دفع
                            </div>
                          </SelectItem>
                          <SelectItem value="unpaid">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              لم يدفع بعد
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(shipment.createdAt).toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

       {/* مودال إضافة شحنة يدوية */}
      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة شحنة يدوية
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">العميل *</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">حالة الدفع</label>
              <Select value={selectedStatus} onValueChange={(value: "paid" | "unpaid") => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      دفع
                    </div>
                  </SelectItem>
                  <SelectItem value="unpaid">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      لم يدفع بعد
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">التاريخ الميلادي</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-right"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowManualForm(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleManualShipmentAdd}
                disabled={!selectedCustomer || addManualShipmentMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {addManualShipmentMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                إضافة الشحنة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* مودال مسح الباركود */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              مسح باركود عنوان العميل
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم العميل من الباركود</label>
              <div className="flex gap-2">
                <Input
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="امسح باركود العنوان أو أدخل اسم العميل..."
                  className="text-right"
                  autoFocus
                />
                <Button 
                  onClick={handleBarcodeScan}
                  disabled={!barcodeInput.trim() || addShipmentMutation.isPending}
                  size="sm"
                >
                  {addShipmentMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <p>• امسح باركود العنوان المطبوع من جدول العملاء</p>
              <p>• أو أدخل اسم العميل يدوياً واضغط Enter</p>
              <p>• سيتم إضافة العميل إلى جدول الشحنات اليومية</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}