
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/hooks/useCurrency";

interface SalesData {
  month: string;
  sales: number;
  monthName: string;
}

interface SalesChartProps {
  currency?: string;
}

const chartConfig = {
  sales: {
    label: "المبيعات",
    color: "hsl(221, 83%, 53%)",
  },
};

export default function SalesChart({ currency: propCurrency }: SalesChartProps) {
  const { currency: hookCurrency } = useCurrency();
  const currency = propCurrency || hookCurrency;

  const { data: salesData, isLoading } = useQuery<SalesData[]>({
    queryKey: ["/api/dashboard/monthly-sales"],
    retry: false,
  });

  const getCurrencySymbol = () => {
    switch (currency) {
      case "USD":
        return "$";
      case "TRY":
        return "₺";
      case "AED":
        return "د.إ";
      case "EUR":
        return "€";
      case "SAR":
      default:
        return "ر.س";
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>تحليل المبيعات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center animate-pulse">
            <div className="text-center">
              <div className="text-4xl text-slate-300 mb-2">📊</div>
              <p className="text-slate-500">جاري تحميل البيانات...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          تحليل المبيعات الشهرية
          <select className="bg-slate-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            <option>آخر 12 شهر</option>
            <option>آخر 6 أشهر</option>
            <option>آخر 3 أشهر</option>
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!salesData || salesData.length === 0 ? (
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-slate-300 mb-2">📊</div>
              <p className="text-slate-500">لا توجد بيانات مبيعات</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="monthName" 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()} ${getCurrencySymbol()}`,
                      "المبيعات"
                    ]}
                  />
                } 
              />
              <Bar 
                dataKey="sales" 
                fill="var(--color-sales)" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
