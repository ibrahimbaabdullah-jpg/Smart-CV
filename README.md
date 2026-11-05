# Smart CV

سيرة ذاتية ذكية: الزائر يسأل، ومساعد ذكاء اصطناعي يجاوب من بياناتك فقط.

## التشغيل محليًا

```bash
npm install
cp .env.example .env.local   # حط مفاتيحك المجانية
npm run dev
```

- مفتاح Gemini المجاني: https://aistudio.google.com/apikey
- مفتاح Groq المجاني (احتياطي): https://console.groq.com/keys

## تعديل بياناتك

كل بياناتك في مجلد `content/`، ملف لكل قسم (الخبرات، المهارات، المشاريع...).
أي عنصر فيه `"is_public": false` ما يشوفه المساعد.
املأ `grammatical_gender` في `content/profile.json` بـ `"masculine"` أو `"feminine"` عشان يكون كلام المساعد عنك صحيح بالعربي.

المستودع عام، فكل اللي في `content/` مكشوف للناس. لا تحط فيه أي معلومة خاصة.

## النشر على Vercel (مجاني)

1. سجل في https://vercel.com بحساب GitHub واختر Import على هذا المستودع.
2. أضف متغيرات البيئة من `.env.example` في إعدادات المشروع.
3. اضغط Deploy.
