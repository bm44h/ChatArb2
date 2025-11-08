// src/app/api/knowledge/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
//import { CloudClient } from "chromadb";
// لا حاجة لـ noStore الآن، لنجرب بدونه أولاً

export async function GET(request: Request) {
  // try {
  //   // --- [تم التغيير هنا] ---
  //   // إنشاء العميل داخل كتلة try
  //   const supabase = createRouteHandlerClient({ cookies });
  //   // --- [نهاية التغيير] ---

  //   // 1. التحقق من جلسة المستخدم
  //   const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  //   if (sessionError || !session) {
  //     return NextResponse.json({ message: 'غير مصرح به' }, { status: 401 });
  //   }
  //   const userId = session.user.id;

  //   const { searchParams } = new URL(request.url);
  //   const projectId = searchParams.get('projectId');

  //   if (!projectId) {
  //     return NextResponse.json({ message: 'معرف المشروع مطلوب' }, { status: 400 });
  //   }

  //   // 2. التحقق من الملكية
  //   const { data: project, error: projectError } = await supabase
  //     .from('projects')
  //     .select('id')
  //     .eq('id', projectId)
  //     .eq('user_id', userId)
  //     .single();

  //   if (projectError || !project) {
  //       return NextResponse.json({ message: 'الوصول مرفوض' }, { status: 403 });
  //   }

  //   // 3. الاتصال بـ ChromaDB
  //   const collectionName = `project-${projectId}`;
  //   const chromaClient = new CloudClient();
    
  //   let collection;
  //   try {
  //       collection = await chromaClient.getCollection({ name: collectionName });
  //   } catch (error) {
  //       return NextResponse.json({ knowledge: { documents: [], metadatas: [] } }, { status: 200 });
  //   }

  //   // 4. جلب البيانات
  //   const allData = await collection.get({
  //       include: ["documents", "metadatas"]
  //   });

  //   // 5. إرجاع البيانات
  //   return NextResponse.json({ knowledge: allData }, { status: 200 });

  // } catch (error) {
  //   // هذا سيلتقط الآن أخطاء `cookies()` أيضًا
  //   if (error instanceof Error && error.message.includes('should be awaited')) {
  //       console.error("Dynamic API usage error:", error.message);
  //       return NextResponse.json({ message: 'خطأ في الخادم يتعلق بالوصول الديناميكي للبيانات. حاول مرة أخرى.' }, { status: 500 });
  //   }
  //   console.error('API GET /knowledge error:', error);
  //   return NextResponse.json({ message: 'حدث خطأ داخلي في الخادم' }, { status: 500 });
  // }
}
 