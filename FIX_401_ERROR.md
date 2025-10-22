# 🔧 FIX: Lỗi 401 - Invalid username or password

## 🎯 **NGUYÊN NHÂN:**

Lỗi **401** có nghĩa là:
- Hugging Face API đang yêu cầu authentication
- Token không hợp lệ hoặc không có
- Có thể có token cũ/sai trong environment

## ✅ **GIẢI PHÁP:**

### **Option 1: Xóa Token Cũ (Recommended)**

1. **Kiểm tra file `.env.local`:**
   ```bash
   cat .env.local
   ```

2. **Nếu có dòng `HUGGINGFACE_API_TOKEN=...`:**
   ```bash
   # Comment out hoặc xóa dòng này:
   # HUGGINGFACE_API_TOKEN=hf_old_token_here
   ```

3. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Test lại Free AI** - Sẽ work mà không cần token!

---

### **Option 2: Thêm Token Mới (Optional)**

1. **Get free token:**
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Name: "AIStyleHub"
   - Type: "Read"
   - Copy token (starts with `hf_`)

2. **Add to `.env.local`:**
   ```bash
   # Create file if not exists
   touch .env.local
   
   # Add token
   echo "HUGGINGFACE_API_TOKEN=hf_your_new_token_here" >> .env.local
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

---

## 🧪 **TEST NGAY:**

### **1. Check Server Logs:**

Khi click "Tạo Ảnh Miễn Phí", bạn sẽ thấy:

```bash
[Free Image API] Token status: hasToken=false, valid=false
[Free Image API] Trying model: stabilityai/stable-diffusion-xl-base-1.0
```

**Nếu thấy:**
- `hasToken=false` → ✅ Good! No token issues
- `hasToken=true, valid=false` → ❌ Bad token, remove it
- `hasToken=true, valid=true` → ✅ Good token

### **2. Test API:**

```bash
node test-free-api.js
```

**Expected output:**
```
✅ SUCCESS!
📸 Image generated successfully
```

**If still 401:**
- Check `.env.local` for old tokens
- Restart server completely
- Clear browser cache

---

## 🔍 **DEBUG STEPS:**

### **Step 1: Check Environment**

```bash
# Check if token exists
echo $HUGGINGFACE_API_TOKEN

# Should be empty or start with hf_
```

### **Step 2: Check .env.local**

```bash
# View file contents
cat .env.local

# Look for HUGGINGFACE_API_TOKEN line
# Comment out if exists: # HUGGINGFACE_API_TOKEN=...
```

### **Step 3: Restart Everything**

```bash
# Stop server
Ctrl+C

# Clear any cached env
unset HUGGINGFACE_API_TOKEN

# Start fresh
npm run dev
```

### **Step 4: Test**

```bash
# Test API directly
node test-free-api.js

# Should show: ✅ SUCCESS!
```

---

## 💡 **QUAN TRỌNG:**

### **Free AI KHÔNG CẦN TOKEN!**

- ✅ **Works without token** - Public models
- ✅ **No cost** - Completely free
- ✅ **No registration** - Just works
- ⚠️ **Rate limits** - Slower without token
- ⚠️ **Cold starts** - Models "sleep" longer

### **Token chỉ để:**
- 🚀 **Faster inference** - Higher priority
- 🔄 **Better rate limits** - More requests
- 🛡️ **More reliable** - Less cold starts

---

## 🚀 **QUICK FIX:**

**Nếu cần fix NGAY:**

1. **Remove token:**
   ```bash
   # Comment out in .env.local
   # HUGGINGFACE_API_TOKEN=hf_old_token
   ```

2. **Restart:**
   ```bash
   npm run dev
   ```

3. **Test:**
   ```bash
   node test-free-api.js
   ```

4. **Should work!** ✅

---

## 🆘 **Nếu Vẫn Lỗi:**

### **Emergency Option - Use Premium:**

```
1. Uncheck "🆓 Dùng AI Miễn Phí"
2. Click "💎 Tạo Ảnh Premium"  
3. Works 99.9% time
4. Cost: ~$0.08
5. Speed: 15-20s guaranteed
```

### **Alternative - Use Different Model:**

Edit `route.ts` line 11:
```typescript
// Change from:
'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',

// To:
'sdxl': 'runwayml/stable-diffusion-v1-5',
```

Some models don't require auth.

---

## 📋 **CHECKLIST:**

- [ ] Checked `.env.local` for old tokens
- [ ] Commented out `HUGGINGFACE_API_TOKEN` line
- [ ] Restarted server completely
- [ ] Ran `node test-free-api.js`
- [ ] Checked server logs for token status
- [ ] Cleared browser cache
- [ ] Tried Premium as fallback

---

**🎯 Token issue is the #1 cause of 401 errors. Remove old tokens and it should work!** 🚀
