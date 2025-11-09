# =================================================================
# المرحلة الأولى: مرحلة الاعتماديات (Dependencies Stage)
# =================================================================
FROM node:20-slim AS deps

# استخدم نسخة "slim" من Node.js، فهي أصغر حجمًا
WORKDIR /app

# انسخ ملفات الاعتماديات فقط
COPY package*.json ./

# قم بتثبيت اعتماديات الإنتاج فقط (يتجاهل devDependencies)
RUN npm install --omit=dev


# =================================================================
# المرحلة الثانية: مرحلة البناء (Builder Stage)
# =================================================================
FROM node:20-bookworm AS builder

WORKDIR /app

# انسخ الاعتماديات من المرحلة السابقة
COPY --from=deps /app/node_modules ./node_modules
# انسخ باقي ملفات المشروع
COPY . .

# قم بتثبيت اعتماديات النظام لـ Playwright
RUN apt-get update && apt-get install -y libgbm-dev libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0

# ✅ [التحسين الحاسم] قم بتثبيت متصفح واحد فقط (Chromium)
RUN npx playwright install --with-deps chromium


# =================================================================
# المرحلة النهائية: مرحلة الإنتاج (Production Stage)
# =================================================================
FROM node:20-slim AS runner

WORKDIR /app

# اضبط متغيرات البيئة للإنتاج
ENV NODE_ENV=production
ENV PORT=10000

# انسخ فقط الملفات الضرورية من مرحلة البناء
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
# انسخ متصفحات Playwright التي تم تنزيلها
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# عرّف المنفذ
EXPOSE 10000

# الأمر النهائي لتشغيل الخادم
CMD ["npm", "start"]
