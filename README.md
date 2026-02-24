## اختصرلى - مشروع اختصار روابط شخصى (React + Firebase)

مشروع **اختصرلى** هو موقع شخصى بسيط لاختصار الروابط مخصص للمدير **بدر** فقط، مع لوحة تحكم صغيرة لمتابعة عدد الضغطات وبعض إحصائيات الدول.

المشروع مبنى باستخدام:

- **React** (مكوّنات داليّة + Hooks)
- **Vite** لتشغيل وبناء التطبيق
- **Firebase Auth** لتسجيل الدخول (بريد + كلمة مرور)
- **Firebase Firestore** لتخزين الروابط والإحصائيات

جميع واجهات المستخدم باللغة العربية وباتجاه **من اليمين لليسار (RTL)**.

---

## 1. المتطلبات المسبقة

- Node.js إصدار 18 أو أعلى
- حساب Firebase
- مدير الحزم `npm` (يأتى مع Node)

---

## 2. تثبيت المشروع وتشغيله محلياً

1. افتح مجلد المشروع داخل الطرفية:

   ```bash
   cd e:/shortLinks/my-app
   ```

2. ثبّت الاعتمادات:

   ```bash
   npm install
   ```

3. أنشئ ملف متغيرات بيئية فى جذر المشروع (نفس مستوى `package.json`) باسم:

   ```bash
   .env.local
   ```

   وضع بداخله الإعدادات التالية (استبدل القيم الحقيقية من إعدادات Firebase):

   ```bash
   VITE_FIREBASE_API_KEY=YOUR_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID

   # بريد المدير الوحيد المسموح له بالدخول
   VITE_ADMIN_EMAIL=bader@example.com
   ```

4. شغّل السيرفر التطويرى:

   ```bash
   npm run dev
   ```

5. افتح المتصفح على العنوان الذى يظهر لك (عادةً `http://localhost:5173`).

---

## 3. إعداد Firebase

### 3.1 إنشاء مشروع وتطبيق ويب

1. ادخل إلى [لوحة Firebase](https://console.firebase.google.com/).
2. أنشئ مشروع جديد أو استخدم مشروعاً موجوداً.
3. من قسم **Build → Authentication**، اضغط "Get started".
4. من تبويب **Sign-in method**:
   - فعّل **Email/Password**.
5. من القائمة الجانبية، ادخل إلى **Build → Firestore Database**، واضغط:
   - Create database
   - اختر وضع الإنتاج أو الاختبار حسب احتياجك.

6. من صفحة مشروعك اضغط على أيقونة الويب `</>` لإنشاء تطبيق ويب جديد:
   - انسخ إعدادات Firebase (apiKey, authDomain, …) وضعها فى `.env.local` كما بالأعلى.

### 3.2 إنشاء مستخدم المدير (بدر)

1. من قسم **Authentication → Users** اضغط **Add user**.
2. ضع البريد نفسه الموجود فى `VITE_ADMIN_EMAIL`، مثلاً:

   - Email: `bader@example.com`
   - Password: `Bader518`

3. احفظ المستخدم.

> **مهم:**  
> واجهة الدخول تطلب **اسم مستخدم** و **كلمة مرور**:
>
> - اسم المستخدم المقبول الوحيد هو: **`Bader`**  
> - كلمة المرور يجب أن تكون نفس كلمة مرور المستخدم فى Firebase (مثال: `Bader518`).

### 3.3 ضبط قواعد Firestore (اختيارى لكن موصى به)

من تبويب **Rules** فى Firestore، يمكنك استخدام قواعد أساسية مثل:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /urls/{document} {
      allow read: if true;              // أى شخص يمكنه الوصول للرابط المختصر
      allow write, update, delete: if
        request.auth != null            // فقط مستخدم مسجّل
        && request.auth.token.email == '<ADMIN_EMAIL>';
    }
  }
}
```

استبدل `<ADMIN_EMAIL>` بنفس القيمة المستخدمة فى `VITE_ADMIN_EMAIL`.

---

## 4. هيكل المجلدات

أهم الملفات والمجلدات:

- `index.html` : ملف HTML الرئيسى مع ضبط اللغة للـعربية و direction إلى RTL.
- `src/main.jsx` : نقطة الدخول لتطبيق React.
- `src/App.jsx` : تعريف المسارات (Routing) وصفحة البداية.
- `src/firebase.js` : تهيئة Firebase (Auth + Firestore).
- `src/context/AuthContext.jsx` : سياق (Context) لإدارة حالة تسجيل الدخول.
- `src/components/Layout.jsx` : الهيكل العام (هيدر، فوتر، محتوى).
- `src/components/ProtectedRoute.jsx` : حماية الصفحات الداخلية (Home + Dashboard).
- `src/pages/LoginPage.jsx` : صفحة تسجيل الدخول للمدير بدر فقط.
- `src/pages/HomePage.jsx` : إنشاء الروابط المختصرة + اسم مخصص اختيارى.
- `src/pages/DashboardPage.jsx` : لوحة تحكم تعرض كل الروابط والإحصائيات.
- `src/pages/RedirectPage.jsx` : مسئول عن إعادة التوجيه من الكود القصير إلى الرابط الأصلى مع تسجيل الضغطات والدول.
- `src/index.css` : تصميم واجهة عربية حديثة، مع ألوان لطيفة وحركات بسيطة.

---

## 5. طريقة عمل النظام

### 5.1 تسجيل الدخول

- يتم استخدام Firebase Auth بنمط **Email/Password**.
- واجهة الدخول تطلب:
  - **اسم المستخدم** (يجب أن يكون `"Bader"`)
  - **كلمة المرور** (يتم التحقق منها عن طريق Firebase).
- إذا حاول أى مستخدم آخر الدخول ببريد مختلف، يتم طرده تلقائياً.

### 5.2 إنشاء رابط مختصر

من الصفحة الرئيسية (بعد تسجيل الدخول):

1. أدخل **الرابط الأصلى** (يتم إضافة `https://` تلقائياً إذا نسيتها).
2. يمكنك إدخال **اسم مخصص** للكود القصير (اختيارى) مثل: `bader-link`.
3. عند الضغط على زر **"اختصر اللينك"**:
   - يتم التحقق من صحة الاسم المخصص (حروف/أرقام/`-`/`_` فقط).
   - إذا لم يتم إدخال اسم مخصص، يتم توليد كود عشوائى آمن.
   - يتم حفظ البيانات فى Firestore داخل مجموعة `urls` مع الحقول:
     - `originalUrl`
     - `shortCode`
     - `clicks`
     - `createdAt`
     - `countryStats` (خريطة للدول وعدد الزيارات).
4. تظهر لك رسالة نجاح مع الرابط المختصر الكامل، مع زر لنسخه.

### 5.3 إعادة التوجيه وتتبع الضغطات والدول

- أى زيارة للرابط مثل:  
  `https://your-domain.com/ABC123`
- تقوم بتحميل صفحة `RedirectPage` التى:
  - تبحث عن الوثيقة فى Firestore باستخدام `shortCode`.
  - تستدعى خدمة GeoIP (مثلاً `https://ipapi.co/json/`) لمحاولة تحديد الدولة.
  - تزيد عدّاد `clicks`، وتزيد القيمة فى `countryStats[اسم_الدولة]`.
  - تعيد توجيه الزائر للرابط الأصلى.

> **ملحوظة:**  
> بعض خدمات GeoIP المجانية قد تحتاج مفتاح API أو قد تعمل بحدود استخدام، يمكنك تغيير عنوان الخدمة أو طريقة استخدامها بسهولة داخل `RedirectPage`.

### 5.4 لوحة التحكم

من صفحة **Dashboard** يمكنك:

- رؤية قائمة بكل الروابط المختصرة.
- مشاهدة:
  - الرابط الأصلى
  - الرابط المختصر
  - عدد الضغطات
- نسخ أى رابط مختصر بزر واحد.
- حذف أى رابط (بعد تأكيد بسيط).
- فى أعلى الصفحة توجد كروت إحصائية:
  - إجمالى عدد الروابط.
  - إجمالى عدد الضغطات.
  - أشهر الدول التى ضغطت على روابطك.

---

## 6. بناء المشروع ونشره (Deployment)

### 6.1 بناء نسخة الإنتاج

لبناء نسخة جاهزة للنشر:

```bash
npm run build
```

سيتم إنشاء مجلد `dist` يحتوى على ملفات الإنتاج الجاهزة.

### 6.2 النشر باستخدام Firebase Hosting

1. ثبّت أداة Firebase CLI (مرة واحدة فقط):

   ```bash
   npm install -g firebase-tools
   ```

2. سجّل الدخول:

   ```bash
   firebase login
   ```

3. من داخل مجلد المشروع:

   ```bash
   firebase init hosting
   ```

   - اختر المشروع الذى أنشأته.
   - ضع `dist` كـ public directory.
   - اختر "Single-page app" = Yes (حتى تعمل مسارات React بشكل صحيح).

4. بعد كل تعديل:

   ```bash
   npm run build
   firebase deploy
   ```

### 6.3 النشر على خدمات أخرى (Vercel / Netlify إلخ)

- جميع الخدمات التى تدعم تطبيقات Vite ستعمل بدون مشاكل تقريباً:
  - اختر إطار العمل: **Vite / React**.
  - أمر البناء: `npm run build`
  - مجلد الإخراج: `dist`
  - تأكد من إضافة نفس متغيرات البيئة (`VITE_FIREBASE_...` + `VITE_ADMIN_EMAIL`) فى إعدادات المنصة.

---

## 7. تخصيصات واقتراحات مستقبلية

- إضافة صفحة إحصائيات مفصلة لكل رابط على حدة.
- تفعيل Google Analytics لتتبع أعمق للزيارات.
- إضافة حماية إضافية مثل 2FA لحساب المدير.
- دعم أكثر من مستخدم (لو أحببت فى المستقبل) عبر أدوار مختلفة فى Firebase.

> الكود منظم وبسيط بحيث يسهل تعديله والتوسع فيه لاحقاً، مع تعليقات توضيحية فى الملفات الأساسية لتسهيل القراءة والصيانة.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
#   s h o r t L i n k s  
 