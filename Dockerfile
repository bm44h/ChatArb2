# المرحلة 1: ابدأ من صورة Node.js الرسمية والمستقرة
# هذه الصورة مضمونة الوجود وتحتوي على Node.js و npm.
FROM node:20-bookworm

# المرحلة 2: حدد مجلد العمل
WORKDIR /app

# المرحلة 3: قم بتثبيت اعتماديات النظام التي يحتاجها Playwright
# هذا هو الجزء الأهم الذي كان يفشل في بيئة Render الأصلية.
# نحن نثبتها الآن بأنفسنا بصلاحيات كاملة داخل Docker.
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0

# المرحلة 4: انسخ ملفات الاعتماديات وقم بتثبيتها
# هذا يستفيد من التخزين المؤقت لتسريع عمليات البناء المستقبلية
COPY package*.json ./
RUN npm install

# المرحلة 5: الآن انسخ باقي كود مشروعك
COPY . .

# المرحلة 6: قم بتثبيت متصفحات Playwright
# نحن نطلب منه عدم تثبيت اعتماديات النظام (--no-deps) لأننا قمنا بذلك بالفعل في المرحلة 3.
RUN npx playwright install --with-deps

# المرحلة 7: قم ببناء تطبيق Next.js للإنتاج
RUN npm run build

# المرحلة 8: عرّف المنفذ
ENV PORT 10000
EXPOSE 10000

# المرحلة 9: الأمر النهائي لتشغيل الخادم
CMD ["npm", "start"]
