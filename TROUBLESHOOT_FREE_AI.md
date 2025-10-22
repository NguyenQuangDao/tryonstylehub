# 🔧 Troubleshooting: Không Tạo Được Ảnh Free

## 🎯 Các Bước Kiểm Tra

### **Bước 1: Kiểm Tra Server Logs**

1. Mở terminal đang chạy `npm run dev`
2. Tìm dòng log khi bạn click "Tạo Ảnh Miễn Phí"
3. Xem có dòng nào sau đây không:

```bash
# ✅ Good signs:
[Free Image API] Request received
[Free Image API] Prompt length: 245
[Free Image API] Preferred model: sdxl
[Free Image API] Trying model: stabilityai/stable-diffusion-xl-base-1.0
[Free Image API] ✅ Success with sdxl

# ⚠️ Warning signs (Normal, needs retry):
[Free Image API] Model sdxl error: {...estimated_time...}
# → Model đang khởi động (cold start)
# → Đợi 30s và thử lại
# → Lần sau sẽ nhanh hơn!

# ❌ Bad signs:
[Free Image API] Model sdxl timeout
[Free Image API] API error: 429
[Free Image API] Unhandled error: ...
```

---

### **Bước 2: Test API Trực Tiếp**

Chạy script test:

```bash
cd /Users/macbook/Projects/AIStyleHub_Project/tryonstylehub
node test-free-api.js
```

**Kết quả mong đợi:**
```
✅ SUCCESS!
📸 Image generated successfully
```

**Nếu lỗi:** Xem error message và follow hướng dẫn trong output.

---

### **Bước 3: Kiểm Tra Browser Console**

1. Mở DevTools (F12)
2. Tab Console
3. Tìm errors màu đỏ
4. Xem có lỗi fetch/network không

**Common errors:**
- `Failed to fetch` → Server không chạy hoặc network blocked
- `500 Internal Server Error` → Check server logs
- `503 Service Unavailable` → Model loading (đợi 30s)

---

## 🔍 Common Issues & Solutions

### **Issue 1: "Model đang khởi động" (PHỔ BIẾN NHẤT!)**

**Triệu chứng:**
```
⏳ Model đang khởi động. Ước tính: 20-25s
Thử lại sau 25s... (Lần 1/3)
```

**Nguyên nhân:**
- Đây là **COLD START** - hoàn toàn bình thường!
- Hugging Face models "ngủ" khi không dùng
- Request đầu tiên "đánh thức" model
- Mất 20-60 giây để model khởi động

**Giải pháp:**
✅ **KHÔNG CẦN LÀM GÌ!** App tự động retry!
- Đợi 30 giây
- App sẽ tự động thử lại 3 lần
- Sau lần đầu thành công, các lần sau chỉ mất 15-20s!

**Prevention:**
- Thêm `HUGGINGFACE_API_TOKEN` vào `.env.local`
- Models sẽ "warm" lâu hơn
- See: `FREE_AI_SETUP.md`

---

### **Issue 2: Generic Error "Không thể tạo ảnh miễn phí"**

**Server logs show:**
```bash
[Free Image API] Model sdxl error: API error: 400 - Bad request
# hoặc
[Free Image API] Model sdxl exception: FetchError: request to https://...
```

**Possible causes:**

#### **A) Network/Firewall Issue**

Test connectivity:
```bash
# Test if you can reach Hugging Face
curl https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0
```

If it hangs or fails:
- ✅ Check firewall settings
- ✅ Check VPN (disable if on)
- ✅ Try different network
- ✅ Check corporate firewall

#### **B) Hugging Face API Down**

Check status:
- Go to: https://status.huggingface.co/
- Check if "Inference API" has issues

If down:
- ✅ Wait for HF to fix
- ✅ Or use Premium mode

#### **C) Invalid Model Name**

Check API code:
```typescript
// In route.ts, verify models exist:
const FREE_MODELS = {
  'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
  // ...
};
```

Test model URL manually:
```bash
curl -X POST \
  https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0 \
  -H "Content-Type: application/json" \
  -d '{"inputs":"test"}' \
  --max-time 10
```

Expected:
- 503 with `estimated_time` → Model loading (OK)
- 200 with image blob → Working!
- 404 → Model not found (BAD)

---

### **Issue 3: Prompt Too Long/Invalid**

**Triệu chứng:**
```
API error: 400 - Prompt exceeds maximum length
```

**Giải pháp:**
- ✅ Shorten prompt (keep under 300 chars)
- ✅ Remove special characters
- ✅ Simplify description

**Good prompt (works):**
```
A professional portrait photo of a young Asian male, 
age 25, short black hair, wearing white t-shirt, 
studio lighting, realistic, high quality
```

**Bad prompt (may fail):**
```
[Very long description with 500+ characters and lots of 
special characters like @#$%^&*()...]
```

---

### **Issue 4: Rate Limiting**

**Triệu chứng:**
```
Quá nhiều requests. Vui lòng thử lại sau.
```

**Nguyên nhân:**
- Too many requests in short time
- Free tier has limits

**Giải pháp:**
1. **Đợi 1-2 phút**
2. **Add API token:**
   ```bash
   # .env.local
   HUGGINGFACE_API_TOKEN=hf_your_token_here
   ```
   Higher limits với token!
3. **Use Premium:**
   - Uncheck "Free AI"
   - Use DALL-E 3 (~$0.08)
   - No rate limits

---

## 🛠️ Debug Workflow

### **Step-by-Step Debugging:**

1. **Click "Tạo Ảnh Miễn Phí"**

2. **Immediately check server terminal:**
   ```
   [Free Image API] Request received ✅
   [Free Image API] Trying model: ... ✅
   ```
   
   If you DON'T see these logs:
   - ❌ Request not reaching server
   - Check if API route file exists
   - Check Next.js routing

3. **Wait for API response:**
   
   **If you see:**
   ```
   [Free Image API] Model sdxl error: {...estimated_time: 20}
   ```
   → COLD START (normal!)
   → Wait 30s, auto-retry will handle it
   
   **If you see:**
   ```
   [Free Image API] Model sdxl error: API error: 404
   ```
   → Model not found
   → Check model name in FREE_MODELS
   
   **If you see:**
   ```
   [Free Image API] ✅ Success with sdxl
   ```
   → SUCCESS!
   → Check browser, image should appear

4. **Check browser console:**
   
   **If you see:**
   ```
   [RealisticBodyPreview] ✅ Image generated successfully
   ```
   → Working!
   
   **If you see:**
   ```
   [RealisticBodyPreview] API response: { ok: false, status: 503, ... }
   ```
   → Cold start (auto-retry will handle)
   
   **If you see:**
   ```
   Failed to fetch
   ```
   → Network issue or server not running

---

## 🚀 Quick Fixes

### **Fix 1: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

Sometimes helps clear stuck states.

### **Fix 2: Clear Browser Cache**

```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

Clears cached errors.

### **Fix 3: Use Different Model**

Edit `RealisticBodyPreview.tsx`:
```typescript
// Change from:
model: 'sdxl',

// To:
model: 'realistic-vision',
```

Try different model as fallback.

### **Fix 4: Increase Timeout**

Edit `route.ts`:
```typescript
// Change from:
setTimeout(() => controller.abort(), 60000);

// To:
setTimeout(() => controller.abort(), 120000); // 2 minutes
```

For slow networks.

### **Fix 5: Add Hugging Face Token**

1. Get token: https://huggingface.co/settings/tokens
2. Create `.env.local`:
   ```
   HUGGINGFACE_API_TOKEN=hf_your_token_here
   ```
3. Restart server
4. Try again → Should be faster & more reliable

---

## 📋 Checklist Before Asking for Help

Before reporting issue, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] No errors in server terminal before clicking
- [ ] Filled all required fields (*) in form
- [ ] Switched to AI mode (clicked "AI Photo")
- [ ] Checked "Free AI" checkbox
- [ ] Waited full 60 seconds on first try
- [ ] Checked server logs (copy last 20 lines)
- [ ] Checked browser console (copy errors)
- [ ] Tested with script: `node test-free-api.js`
- [ ] Tried with Premium to rule out local issues

---

## 🆘 Emergency Fallback

**If FREE absolutely won't work:**

### **Option 1: Use Premium (Recommended for urgent)**
```
1. Uncheck "🆓 Dùng AI Miễn Phí"
2. Checkbox disappears, button turns purple
3. Click "💎 Tạo Ảnh Premium"
4. Works 99.9% of time
5. Cost: ~$0.08 (very cheap)
6. Quality: HD (1024x1792)
7. Speed: Always 15-20s
```

### **Option 2: Use SVG Mode (100% Free, Instant)**
```
1. Click "⚡ SVG Preview" card
2. See instant preview
3. No AI, no cost, no wait
4. Good for testing layouts
5. Can export/download
6. Not photorealistic but usable
```

### **Option 3: External Services**
```
While we fix the free AI, you can use:
• Stable Diffusion Online: https://stablediffusionweb.com
• DreamStudio: https://beta.dreamstudio.ai (free credits)
• Leonardo.ai: https://leonardo.ai (free tier)

Generate there, upload back to app
```

---

## 📞 Get More Help

**Collect this info:**

1. **Server logs** (last 50 lines):
   ```bash
   # Copy from terminal running npm run dev
   ```

2. **Test script output**:
   ```bash
   node test-free-api.js > test-output.txt
   ```

3. **Browser console** (F12 → Console → Screenshot)

4. **Your setup**:
   - OS: Mac/Windows/Linux?
   - Node version: `node --version`
   - Network: Corporate/Home/VPN?
   - Firewall: Any?

5. **What you tried** (from checklist above)

Then create issue or ask with all this info!

---

## 🎯 Expected Behavior

**First time using Free AI:**
```
1. Click "🆓 Tạo Ảnh Miễn Phí"
   ↓
2. See loading screen (rotating icon)
   ↓
3. See error: "Model đang khởi động. Ước tính: 25s"
   ↓  [THIS IS NORMAL!]
4. Wait ~30 seconds
   ↓
5. App auto-retries (you don't do anything)
   ↓
6. Loading screen again
   ↓
7. Wait ~20 seconds
   ↓
8. ✅ SUCCESS! Image appears!
   ↓
9. Next generations: Only 15-20s, no cold start!
```

**NOT normal:**
- Error persists after 3 auto-retries
- Timeout errors
- Network errors
- 404/400 errors

---

## ✅ Success Criteria

You'll know it's working when:

✅ Server logs show: `[Free Image API] ✅ Success with sdxl`
✅ Browser shows: Photorealistic human image
✅ No error messages displayed
✅ Can download image
✅ Can regenerate and get new image in 15-20s

---

**🎊 Good luck! Free AI works for 95% of users. If you're in the 5%, we'll figure it out!** 🚀


