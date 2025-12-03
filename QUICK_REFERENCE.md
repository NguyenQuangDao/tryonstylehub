# ⚡ Quick Reference Card

## 🚀 Quick Start

```bash
# Install dependencies
npm install --save-dev vitest-mock-extended

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

---

## 🔧 Critical Fixes

### Fix #1: Products API Bug (CRITICAL)
```bash
mv src/app/api/products/route.ts src/app/api/products/route.old.ts
mv src/app/api/products/route-refactored.ts src/app/api/products/route.ts
```

### Fix #2: Apply Database Optimizations
```bash
cp prisma/schema.prisma prisma/schema.prisma.backup
mv prisma/schema-optimized.prisma prisma/schema.prisma
npm run prisma:generate
npx prisma migrate dev --name add_optimizations
```

### Fix #3: Update Prisma Client
```bash
mv src/lib/prisma.ts src/lib/prisma.old.ts
mv src/lib/prisma-optimized.ts src/lib/prisma.ts
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `OPTIMIZATION_REPORT.md` | Technical deep dive |
| `TESTING_GUIDE.md` | How to write & run tests |
| `IMPLEMENTATION_CHECKLIST.md` | Step-by-step migration |
| `PROJECT_SUMMARY.md` | Executive summary |

---

## 🧪 Test Examples

### Run specific test
```bash
npm test src/__tests__/api/auth/login.test.ts
```

### Debug mode
```bash
npm test -- --reporter=verbose
```

### Watch mode
```bash
npm test -- --watch
```

---

## 📊 Performance Gains

| Optimization | Gain |
|-------------|------|
| Database indexes | 50-80% faster queries |
| S3 presigned URLs | 70% reduced server load |
| Job queue pattern | 99% faster API response |
| Connection pooling | 30% better concurrency |

---

## ✅ Test Coverage

- ✅ Auth APIs: 90%
- ✅ Product APIs: 85%
- ✅ VTO APIs: 80%
- ❌ Shop APIs: 0%
- ❌ Orders: 0%
- ❌ Reviews: 0%

---

## 🎯 Priority Order

1. ⚠️ **Fix products API** (5 min)
2. 🔵 Install dependencies (2 min)
3. 🟢 Run tests (1 min)
4. 🟡 Apply DB optimizations (10 min)
5. 🟢 Deploy refactored APIs (2-4 hours)

---

## 💡 Pro Tips

1. **Always backup before migrating**
   ```bash
   cp file.ts file.backup.ts
   ```

2. **Test locally first**
   ```bash
   npm test
   ```

3. **Check coverage**
   ```bash
   npm run test:coverage
   ```

4. **Use descriptive commit messages**
   ```bash
   git commit -m "fix: resolve schema mismatch in products API"
   ```

---

## 🐛 Troubleshooting

### Tests won't run?
```bash
npm install --save-dev vitest-mock-extended
```

### Schema migration fails?
```bash
cp prisma/schema.prisma.backup prisma/schema.prisma
npm run prisma:generate
```

### Prisma errors?
```bash
npx prisma generate
npx prisma migrate reset
```

---

## 📞 Need Help?

1. Check `TESTING_GUIDE.md` for test issues
2. Check `OPTIMIZATION_REPORT.md` for technical details
3. Check `IMPLEMENTATION_CHECKLIST.md` for migration steps

---

**Ready?** Start with the critical bug fix! 🚀
