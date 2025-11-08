// src/app/components/dashboard/tabs/BotSettingsTab.tsx - الإصدار المعاد بناؤه
"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Save, Check } from "lucide-react";
import SettingsSkeleton from "./SettingsSkeleton"; // <-- 1. استيراد المكون الجديد
import toast from "react-hot-toast";

// تعريف الألوان المتاحة
const colorOptions = [
  { name: "أزرق", value: "#3b82f6" },
  { name: "أرجواني", value: "#8b5cf6" },
  { name: "أسود", value: "#1f2937" },
];

export default function BotSettingsTab({ projectId }: { projectId: string }) {
  // حالات لتخزين البيانات الحالية
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [botName, setBotName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [chatColor, setChatColor] = useState(colorOptions[0].value);

  // حالة لتخزين البيانات الأصلية للمقارنة
  const [initialData, setInitialData] = useState({});

  // حالات واجهة المستخدم
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSync, setLastSync] = useState("لم تتم المزامنة بعد");
  const [hasChanges, setHasChanges] = useState(false);
  const SALLA_CLIENT_ID = process.env.SALLA_CLIENT_ID;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/integrations/salla/callback`;

  const sallaAuthUrl = `https://accounts.salla.sa/oauth2/auth?client_id=${SALLA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI )}&response_type=code&scope=orders.read`;


  // جلب الإعدادات عند تحميل المكون
  useEffect(() => {
    if (!projectId) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/settings?projectId=${projectId}`);
        if (!res.ok) throw new Error("فشل في جلب الإعدادات");

        const data = await res.json();

        const currentData = {
          storeName: data.store_name || "",
          botName: data.bot_name || "",
          storeUrl: data.store_url || "",
          welcomeMessage:
            data.settings?.welcomeMessage ||
            "أهلاً بك في متجرنا كيف يمكننا مساعدتك؟",
          chatColor: data.settings?.chatColor || colorOptions[0].value,
        };

        // تعيين الحالات
        setStoreName(currentData.storeName);
        setStoreUrl(currentData.storeUrl);
        setBotName(currentData.botName);
        setWelcomeMessage(currentData.welcomeMessage);
        setChatColor(currentData.chatColor);

        // حفظ البيانات الأصلية
        setInitialData(currentData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [projectId]);

  // التحقق من وجود تغييرات
  useEffect(() => {
    const currentData = {
      storeName,
      botName,
      storeUrl,
      welcomeMessage,
      chatColor,
    };
    setHasChanges(JSON.stringify(currentData) !== JSON.stringify(initialData));
  }, [storeName, botName, storeUrl, welcomeMessage, chatColor, initialData]);

  // حفظ جميع الإعدادات
  const handleSaveSettings = async () => {
    if (!hasChanges) return;

    const toastId = toast.loading("جاري الحفظ"); // <-- إظهار إشعار التحميل

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        projectId,
        store_name: storeName,
        bot_name: botName,
        store_url: storeUrl,
        settings: {
          welcomeMessage,
          chatColor,
        },
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok)
        throw new Error(responseData.message || "فشل في حفظ الإعدادات");

      const updatedData = {
        storeName: responseData.project.store_name,
        botName: responseData.project.bot_name,
        storeUrl: responseData.project.store_url,
        welcomeMessage: responseData.project.settings.welcomeMessage,
        chatColor: responseData.project.settings.chatColor,
      };

      setInitialData(updatedData); // تحديث البيانات الأصلية

      toast.success("تم الحفظ", { id: toastId });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحفظ", { id: toastId }); // <-- إظهار إشعار الخطأ
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. دالة لإعادة المزامنة (الزحف) ---
  const handleSync = async () => {
    if (!storeUrl || storeUrl.trim() === "") {
      toast.error("ادخل رابط متجرك اولاً");
      return; // إيقاف تنفيذ الدالة هنا
    }
    setIsSyncing(true);
    const toastId = toast.loading("جاري بدء عملية الزحف...");
    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, url: storeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "فشلت عملية المزامنة");
      }

      setLastSync(new Date().toLocaleString("ar-EG"));
      toast.success("بدأت المزامنة في الخلفية بنجاح.", { id: toastId });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "حدث خطأ غير متوقع", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <SettingsSkeleton />;
  if (error)
    return <div className="text-center p-10 text-red-500">خطأ: {error}</div>;

  return (
    <div className=" space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        {hasChanges && (
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ"}
          </button>
        )}
      </div>
      {/* الحاوية الرئيسية الجديدة لكل الإعدادات */}
      <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-8">
        {/* قسم المظهر */}
        <div>
          <h2 className="text-xl font-semibold mb-6">الواجهة</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                الرسالة الترحيبية
              </label>
              <input
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-[#FCFCFC] focus:outline-none focus:ring-0 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-4">
                لون نافذة الدردشة
              </label>
              <div className="flex items-center gap-4">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setChatColor(option.value)}
                    className={`w-10 h-10 rounded-full transition-all duration-200 ${
                      chatColor === option.value
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    style={{ backgroundColor: option.value }}
                    title={option.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* فاصل بين الأقسام */}
        <hr className="border-gray-200" />

        {/* قسم الإعدادات العامة */}
        <div>
          <h2 className="text-xl font-semibold mb-6">معلومات</h2>
          <div className="space-y-6">
            <p className="text-gray-700">
              يستخدم اسم المتجر في تخصيص تجربة المستخدم داخل نافذة الدردشة
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم المتجر
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-[#FCFCFC] focus:outline-none focus:ring-0 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم البوت
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg bg-[#FCFCFC] focus:outline-none focus:ring-0 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* فاصل بين الأقسام */}
        <hr className="border-gray-200" />

        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            التكامل مع المنصات
          </h2>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-700">متجر سلة</h3>
              <p className="text-sm text-gray-500">
                اربط متجرك على سلة للسماح للبوت بتتبع حالة الطلبات.
              </p>
            </div>
            {/* 
      هنا سنضيف منطقًا لاحقًا للتحقق مما إذا كان الربط قد تم بالفعل.
      إذا تم الربط، سنعرض زر "إلغاء الربط".
      إذا لم يتم، سنعرض زر "ربط".
    */}
            <a
              href={sallaAuthUrl}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
            >
              ربط
            </a>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* بطاقة المزامنة */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">الزاحف</h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700">
              اضغط هنا للزحف وجمع المعلومات من متجرك
            </p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
            >
              <RefreshCw
                className={`inline ml-2 h-4 w-4 ${
                  isSyncing ? "animate-spin" : ""
                }`}
              />
              {isSyncing ? "جاري الزحف..." : "زحف"}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              رابط المتجر
            </label>
            <input
              type="url"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-[#FCFCFC] focus:outline-none focus:ring-0 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>
        </div>
      </div>{" "}
      {/* نهاية الحاوية الرئيسية */}
    </div>
  );
}
