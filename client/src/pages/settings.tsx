
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Moon, Sun } from "lucide-react";
import {
  Settings2,
  Building,
  Database,
  User,
  Palette
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: localStorage.getItem('companyName') || "ERP Pro",
    subname: localStorage.getItem('companySubname') || "نظام إدارة متطور",
    address: "الرياض، المملكة العربية السعودية",
    phone: "+966 11 123 4567",
    email: "info@company.com",
    taxNumber: "123456789012345",
    website: "www.company.com",
  });

  const [userProfile, setUserProfile] = useState({
    fullName: localStorage.getItem('userFullName') || user?.name || "Eymen Admin",
    email: user?.email || "user@example.com",
    phone: "+966 50 123 4567",
    position: "مدير النظام",
    language: "ar",
    timezone: "Asia/Riyadh",
    profileImage: localStorage.getItem('userProfileImage') || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
  });

  const handleCompanyInfoSave = () => {
    localStorage.setItem('companyName', companyInfo.name);
    localStorage.setItem('companySubname', companyInfo.subname);
    toast({
      title: "تم حفظ معلومات الشركة",
      description: "تم تحديث معلومات الشركة بنجاح",
    });
  };

  const handleUserProfileSave = () => {
    localStorage.setItem('userFullName', userProfile.fullName);
    localStorage.setItem('userProfileImage', userProfile.profileImage);
    toast({
      title: "تم حفظ البيانات الشخصية",
      description: "تم تحديث بياناتك الشخصية بنجاح",
    });
  };

  const handleDeleteAllData = async () => {
    if (confirmationCode !== "eymen") {
      toast({
        title: "خطأ في رمز التأكيد",
        description: "رمز التأكيد غير صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-all-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في حذف البيانات");
      }

      toast({
        title: "تم حذف البيانات بنجاح",
        description: "تم حذف جميع بيانات النظام بنجاح",
      });

      setShowDeleteDialog(false);
      setConfirmationCode("");
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "خطأ في حذف البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // تطبيق المود المظلم على كامل النظام
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    
    // تطبيق المود على الخلفية الرئيسية
    const body = document.body;
    if (newDarkMode) {
      body.style.backgroundColor = 'hsl(222, 84%, 5%)';
      body.style.color = 'hsl(210, 40%, 98%)';
    } else {
      body.style.backgroundColor = 'hsl(0, 0%, 100%)';
      body.style.color = 'hsl(218, 11%, 15%)';
    }
    
    toast({
      title: newDarkMode ? "تم تفعيل الوضع المظلم" : "تم تفعيل الوضع العادي",
      description: "تم تغيير مظهر النظام بنجاح",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="الإعدادات" subtitle="إدارة إعدادات النظام والحساب" />
        <main className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                معلومات الشركة
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                الحساب الشخصي
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                المظهر
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                النظام
              </TabsTrigger>
            </TabsList>

            {/* تبويب معلومات الشركة */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    معلومات الشركة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اسم الشركة</Label>
                      <Input
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        className="text-right"
                        placeholder="ERP Pro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>وصف الشركة</Label>
                      <Input
                        value={companyInfo.subname}
                        onChange={(e) => setCompanyInfo({...companyInfo, subname: e.target.value})}
                        className="text-right"
                        placeholder="نظام إدارة متطور"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={companyInfo.phone}
                        onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الموقع الإلكتروني</Label>
                      <Input
                        value={companyInfo.website}
                        onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الرقم الضريبي</Label>
                      <Input
                        value={companyInfo.taxNumber}
                        onChange={(e) => setCompanyInfo({...companyInfo, taxNumber: e.target.value})}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleCompanyInfoSave}>
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* تبويب الحساب الشخصي */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلومات الحساب الشخصي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={userProfile.profileImage} 
                        alt="صورة المستخدم" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" 
                      />
                      <div className="flex-1 space-y-2">
                        <Label>صورة المستخدم</Label>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  setUserProfile({...userProfile, profileImage: result});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-right"
                          />
                          <Input
                            value={userProfile.profileImage}
                            onChange={(e) => setUserProfile({...userProfile, profileImage: e.target.value})}
                            className="text-right"
                            placeholder="أو أدخل رابط الصورة"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>الاسم الكامل</Label>
                      <Input
                        value={userProfile.fullName}
                        onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المنصب</Label>
                      <Input
                        value={userProfile.position}
                        onChange={(e) => setUserProfile({...userProfile, position: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>اللغة</Label>
                      <select
                        value={userProfile.language}
                        onChange={(e) => setUserProfile({...userProfile, language: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-right"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>المنطقة الزمنية</Label>
                      <select
                        value={userProfile.timezone}
                        onChange={(e) => setUserProfile({...userProfile, timezone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-right"
                      >
                        <option value="Asia/Riyadh">آسيا/الرياض</option>
                        <option value="Asia/Dubai">آسيا/دبي</option>
                        <option value="Asia/Kuwait">آسيا/الكويت</option>
                        <option value="Europe/Istanbul">أوروبا/إسطنبول (تركيا)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleUserProfileSave}>
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* تبويب المظهر */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    إعدادات المظهر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* المود المظلم */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                          {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          الوضع المظلم
                        </h4>
                        <p className="text-sm text-slate-600">
                          تفعيل المظهر المظلم لراحة العينين
                        </p>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleDarkMode}
                      />
                    </div>

                    <Separator />

                    {/* اختيار العملة */}
                    <div>
                      <h4 className="font-medium mb-2">العملة</h4>
                      <div className="space-y-2">
                        <Label>اختر العملة</Label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SAR">ريال سعودي (ر.س)</option>
                          <option value="USD">دولار أمريكي ($)</option>
                          <option value="TRY">ليرة تركية (₺)</option>
                          <option value="AED">درهم إماراتي (د.إ)</option>
                          <option value="EUR">يورو (€)</option>
                        </select>
                      </div>
                    </div>

                    <Separator />

                    {/* حجم الخط */}
                    <div>
                      <h4 className="font-medium mb-2">حجم الخط</h4>
                      <div className="space-y-2">
                        <Label>اختر حجم الخط</Label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-right">
                          <option value="small">صغير</option>
                          <option value="medium" selected>متوسط</option>
                          <option value="large">كبير</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* تبويب النظام */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    إعدادات النظام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* اللغة والمنطقة */}
                    <div>
                      <h4 className="font-medium mb-2">اللغة والمنطقة</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اللغة</Label>
                          <Input value="العربية" readOnly className="text-right" />
                        </div>
                        <div className="space-y-2">
                          <Label>المنطقة الزمنية</Label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-right dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            defaultValue="Asia/Riyadh"
                          >
                            <option value="Asia/Riyadh">آسيا/الرياض</option>
                            <option value="Asia/Dubai">آسيا/دبي</option>
                            <option value="Asia/Kuwait">آسيا/الكويت</option>
                            <option value="Europe/Istanbul">أوروبا/إسطنبول (تركيا)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* النسخ الاحتياطي */}
                    <div>
                      <h4 className="font-medium mb-2">النسخ الاحتياطي</h4>
                      <p className="text-sm text-slate-600 mb-3">آخر نسخة احتياطية: اليوم 12:00 ص</p>
                      <div className="flex gap-3">
                        <Button variant="outline">إنشاء نسخة احتياطية الآن</Button>
                        <Button variant="outline">استعادة من نسخة احتياطية</Button>
                      </div>
                    </div>

                    <Separator />

                    {/* المنطقة الخطرة */}
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">المنطقة الخطرة</h4>
                      <p className="text-sm text-slate-600 mb-3">إعادة تعيين النظام أو حذف جميع البيانات</p>
                      <div className="flex gap-3">
                        <Button variant="outline" className="text-red-600 hover:text-red-700">
                          إعادة تعيين النظام
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          حذف جميع البيانات
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* نافذة تأكيد حذف البيانات */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              تأكيد حذف جميع البيانات
            </DialogTitle>
            <DialogDescription className="text-right">
              هذا الإجراء سيحذف جميع البيانات نهائياً ولا يمكن التراجع عنه!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 text-right">
                ⚠️ سيتم حذف جميع البيانات التالية نهائياً:
              </p>
              <ul className="text-sm text-red-700 mt-2 text-right list-disc list-inside">
                <li>جميع المنتجات والمخزون</li>
                <li>جميع العملاء والموردين</li>
                <li>جميع الفواتير والمعاملات</li>
                <li>جميع التقارير والإحصائيات</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-right block">
                لتأكيد العملية، أدخل رمز التأكيد:
              </Label>
              <Input
                id="confirmation"
                type="password"
                placeholder="أدخل رمز التأكيد..."
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="text-right"
                disabled={isDeleting}
              />
              <p className="text-xs text-slate-500 text-right">
                تلميح: الرمز مكون من 5 أحرف
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmationCode("");
                }}
                className="flex-1"
                disabled={isDeleting}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllData}
                className="flex-1"
                disabled={isDeleting || confirmationCode.length === 0}
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {isDeleting ? "جاري الحذف..." : "حذف جميع البيانات"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
