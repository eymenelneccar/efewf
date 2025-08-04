import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, DollarSign, TrendingDown, User } from "lucide-react";
import type { Customer } from "@shared/schema";

type Props = {
  currency: string;
};

export default function QuickStats({ currency }: Props) {
  const [sortOrder, setSortOrder] = useState<"newest" | "highest">("highest");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    retry: false,
  });

  // فلترة العملاء الذين عليهم ديون
  const debtorCustomers = customers
    .filter((customer) => customer.totalDebt && parseFloat(customer.totalDebt) > 0)
    .sort((a, b) => {
      if (sortOrder === "highest") {
        return parseFloat(b.totalDebt ?? "0") - parseFloat(a.totalDebt ?? "0");
      } else {
        // newest - حسب تاريخ الإنشاء
        return new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime();
      }
    });

  

  const formatDebt = (debt: string | null | undefined): string => {
    if (!debt) return "0.00";
    const debtNumber = parseFloat(debt);
    if (isNaN(debtNumber)) return "0.00";
    return debtNumber.toFixed(2);
  };

  const getDebtColor = (debt: string | null | undefined): string => {
    if (!debt) return "text-slate-500";
    const debtNumber = parseFloat(debt);
    if (debtNumber >= 5000) return "text-red-600";
    if (debtNumber >= 1000) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <>
      <Card className="shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              قائمة الديون
            </CardTitle>
            <Select value={sortOrder} onValueChange={(value: "newest" | "highest") => setSortOrder(value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="ترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highest">الأكثر ديناً</SelectItem>
                <SelectItem value="newest">الأحدث</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : debtorCustomers.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                لا توجد ديون
              </h3>
              <p className="text-slate-600">
                جميع العملاء سددوا ديونهم
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {debtorCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <User className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {customer.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        ID: {customer.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${getDebtColor(customer.totalDebt)}`}>
                      {formatDebt(customer.totalDebt)} {currency}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      دين
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {debtorCustomers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">إجمالي العملاء المدينين:</span>
                <Badge variant="secondary">{debtorCustomers.length}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-600">إجمالي الديون:</span>
                <span className="font-semibold text-red-600">
                  {debtorCustomers
                    .reduce((sum, customer) => sum + parseFloat(customer.totalDebt ?? "0"), 0)
                    .toFixed(2)} {currency}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      
    </>
  );
}