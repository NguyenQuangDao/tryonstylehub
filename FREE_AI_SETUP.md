# 🆓 Free AI Image Generation - Setup & Troubleshooting

## 📋 Overview

Free AI image generation uses **Hugging Face Inference API** with Stable Diffusion models.
- ✅ **100% FREE** - No cost
- ✅ **No API key required** (but recommended for better performance)
- ✅ **Multiple models** with automatic fallback
- ⚠️ **May be slower** on first request (cold start: 20-60s)

---

## 🚀 Quick Start (No Setup Required!)

**The free AI works OUT OF THE BOX!** No setup needed.

Just:
1. Click template to fill form
2. Switch to AI mode
3. Check "Free AI"
4. Click "Tạo Ảnh Miễn Phí"
5. Wait 30-60s (first time) or 15-20s (after)
6. Get your FREE image!

---

## 🔧 Optional: Improve Performance with API Token

Want **faster** and **more reliable** generation? Add a Hugging Face token:

### **Step 1: Get Free Hugging Face Token**

1. Go to https://huggingface.co/join
2. Sign up (free)
3. Go to https://huggingface.co/settings/tokens
4. Click "New token"
5. Name: `aistylehub-free` (or anything)
6. Role: Select **"Read"** (default)
7. Click "Generate"
8. **Copy the token** (starts with `hf_...`)

### **Step 2: Add Token to Project**

1. In your project root: `tryonstylehub/`
2. Create file `.env.local` (if doesn't exist)
3. Add this line:
   ```bash
   HUGGINGFACE_API_TOKEN=hf_your_token_here
   ```
4. Save file
5. Restart dev server (`npm run dev`)

### **Step 3: Test**

Try generating again - should be **faster** and **more reliable**!

---

## 🎯 How It Works

### **Models Used (in order):**

1. **Stable Diffusion XL** (Primary - Most reliable)
   - Model: `stabilityai/stable-diffusion-xl-base-1.0`
   - Best balance of speed & quality
   
2. **Realistic Vision V6** (Fallback 1)
   - Model: `SG161222/Realistic_Vision_V6.0_B1_noVAE`
   - High quality realistic images

3. **Studio Ghibli Portrait** (Fallback 2)
   - Model: `artificialguybr/StudioGhibli-Diffusion-PortraitPlus`
   - Artistic style

### **Automatic Fallback:**

If one model fails, the system automatically tries the next one!

---

## ⚠️ Common Issues & Solutions

### **Issue 1: "Model đang khởi động"**

**Error message:**
```
Model đang khởi động. Vui lòng thử lại sau 20 giây.
```

**What it means:**
- Hugging Face models "sleep" when not used
- First request wakes them up (cold start)
- Takes 20-60 seconds

**Solution:**
- ✅ Just **wait 30 seconds**
- ✅ Click "Tạo lại" (Regenerate)
- ✅ System will auto-retry (2 attempts)
- ✅ After first successful gen, next ones are fast!

**Prevention:**
- Add Hugging Face token (see above) → Models stay warm longer

---

### **Issue 2: "Quá nhiều requests"**

**Error message:**
```
Quá nhiều requests. Vui lòng thử lại sau.
```

**What it means:**
- Rate limiting on Hugging Face API
- Too many requests in short time

**Solution:**
- ✅ Wait 1-2 minutes
- ✅ Try again
- ✅ Or switch to Premium (DALL-E 3)

**Prevention:**
- Add Hugging Face token → Higher rate limits

---

### **Issue 3: "Request timeout"**

**Error message:**
```
Request timeout (60s)
```

**What it means:**
- Model took too long to respond
- Network issues or model overloaded

**Solution:**
- ✅ Try again (may be temporary)
- ✅ Check your internet connection
- ✅ Try at different time (off-peak hours)
- ✅ Or use Premium for guaranteed speed

---

### **Issue 4: Generic Error**

**Error message:**
```
Không thể tạo ảnh miễn phí. Vui lòng thử lại hoặc chuyển sang chế độ Premium.
```

**Possible causes:**
- Hugging Face API temporarily down
- Network issues
- Invalid prompt (too long, inappropriate content)

**Solution:**
1. **Check prompt:**
   - Keep it under 300 characters
   - Remove special characters
   - Make it clear and descriptive

2. **Try again:**
   - Click "Tạo lại"
   - Wait a moment between attempts

3. **Check network:**
   - Open browser console (F12)
   - Look for network errors
   - Check internet connection

4. **Last resort:**
   - Uncheck "Free AI"
   - Use Premium (DALL-E 3) - ~$0.08
   - Guaranteed to work, faster (15-20s)

---

## 🔍 Debugging

### **Check Server Logs:**

In your terminal running `npm run dev`, look for:

```
[Free Image API] Request received
[Free Image API] Prompt length: 245
[Free Image API] Preferred model: sdxl
[Free Image API] Trying model: stabilityai/stable-diffusion-xl-base-1.0
```

**Good signs:**
- `✅ Success with sdxl` → Working!

**Bad signs:**
- `API error: 503` → Model loading (wait & retry)
- `API error: 429` → Rate limit (wait)
- `Request timeout` → Network/model issues

### **Check Browser Console:**

1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors

**Common errors:**
- `Failed to fetch` → Network blocked, check firewall
- `CORS error` → Should not happen with proper setup
- `500 Internal Server Error` → Check server logs

---

## 💡 Tips for Best Results

### **1. Prompt Quality**

Good prompt:
```
A professional portrait photo of an athletic Asian male, 
age 25, short black hair, wearing casual white t-shirt, 
studio lighting, realistic, high quality, 4K
```

Bad prompt:
```
man
```

**Tips:**
- Be specific (age, ethnicity, clothing, pose)
- Mention style (realistic, photographic)
- Add quality keywords (high quality, detailed, 4K)
- Keep under 300 characters

### **2. Timing**

**Best times to use:**
- Off-peak hours (early morning, late night in US/EU)
- Weekdays better than weekends

**Slower times:**
- Peak US/EU hours (9am-5pm EST/CET)
- Weekends

### **3. Caching**

The app caches generated images!
- Same parameters = instant result (no API call)
- Different parameters = new generation

### **4. When to Use Premium**

Use Premium (DALL-E 3) when:
- ✅ Need guaranteed fast generation (15-20s)
- ✅ Need highest quality (1024x1792 HD)
- ✅ Important/urgent task
- ✅ Free tier has issues

Cost: Only ~$0.08 per image

---

## 📊 Comparison: Free vs Premium

| Feature | Free (Stable Diffusion) | Premium (DALL-E 3) |
|---------|------------------------|-------------------|
| **Cost** | $0 | ~$0.08 per image |
| **Quality** | Good (512x768) | Excellent (1024x1792 HD) |
| **Speed (warm)** | 15-20s | 15-20s |
| **Speed (cold)** | 30-60s | 15-20s (always warm) |
| **Reliability** | Good (95%) | Excellent (99.9%) |
| **Setup** | None required | Needs OpenAI API key |
| **Rate limits** | Yes (lower) | Yes (higher) |
| **Best for** | Testing, iterations | Final results |

---

## 🔐 API Token Security

**Hugging Face token in `.env.local`:**
- ✅ Safe (not committed to git)
- ✅ Server-side only (not exposed to browser)
- ✅ Read-only access (can't modify your HF account)

**Never:**
- ❌ Don't commit `.env.local` to git
- ❌ Don't share your token publicly
- ❌ Don't use write access tokens

**If token leaked:**
1. Go to https://huggingface.co/settings/tokens
2. Revoke old token
3. Generate new token
4. Update `.env.local`

---

## 🎯 Success Checklist

Before reporting issues, check:

- [ ] Filled all required fields (*) in form
- [ ] Switched to AI mode (clicked "AI Photo" card)
- [ ] Checked "Free AI" checkbox
- [ ] Waited full 60 seconds on first try
- [ ] Checked server logs for errors
- [ ] Internet connection working
- [ ] Tried different prompt
- [ ] Tried at different time
- [ ] Tried with Premium to rule out local issues

---

## 📞 Still Having Issues?

**Collect this info:**

1. **Error message** (exact text)
2. **Server logs** (from terminal)
3. **Browser console** (F12 → Console)
4. **Steps to reproduce**
5. **Time of day** (for rate limit debugging)
6. **Prompt used** (if comfortable sharing)

**Then:**
- Check server logs for detailed error
- Try Premium mode to see if it works (rules out local issues)
- Create GitHub issue with info above

---

## 🚀 Performance Optimization

### **For Development:**

```bash
# Add token to .env.local
HUGGINGFACE_API_TOKEN=hf_your_token

# Restart server
npm run dev
```

### **For Production:**

```bash
# Add to production environment variables
HUGGINGFACE_API_TOKEN=hf_your_production_token

# Deploy with updated env vars
```

### **Advanced: Dedicated Inference Endpoint**

For high-traffic production:
1. Create Hugging Face Inference Endpoint (paid)
2. Point API to your endpoint
3. Get dedicated resources, no cold starts
4. See: https://huggingface.co/inference-endpoints

---

## 🎊 Summary

**Free AI works without ANY setup!**

Just slower on first request (30-60s cold start).

**To improve:**
- Add free Hugging Face token → Faster, more reliable
- Use off-peak hours → Less rate limiting
- Write good prompts → Better results
- Cache results → Instant for same params

**When free doesn't work:**
- Premium always works
- Only ~$0.08
- Worth it for important images

**Questions?** Check server logs, browser console, or ask! 🚀


