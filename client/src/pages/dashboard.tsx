import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import TransactionsTable from "@/components/dashboard/transactions-table";
import QuickStats from "@/components/dashboard/quick-stats";
import DailyShipmentsTable from "@/components/dashboard/daily-shipments-table";
import SalesChart from "@/components/dashboard/sales-chart";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { currency } = useCurrency(); // ✅ تم إضافة العملة

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "غير مصرح",
        description: "تم تسجيل خروجك. جارٍ تسجيل الدخول مرة أخرى...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="لوحة التحكم الرئيسية"
          subtitle={`مرحباً بك في نظام إدارة المؤسسات المتطور (${currency})`} // ✅ استخدام العملة هنا لو حابب
        />
        <main className="flex-1 overflow-auto p-6">
          <MetricsCards currency={currency} /> {/* ✅ تمرير العملة */}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <SalesChart currency={currency} />
            <QuickStats currency={currency} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <TransactionsTable />
            <DailyShipmentsTable currency={currency} />
          </div>
        </main>
      </div>
    </div>
  );
}
