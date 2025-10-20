# AIStyleHub - Cursor Rules

## Project Overview
**AIStyleHub** is an AI-driven fashion platform that focuses on virtual try-on and smart outfit recommendations.

### Core Features
1. **Virtual Try-On**: Users upload a personal photo + clothing image, AI uses GPT-4 Vision to analyze and DALL-E 3 to generate a realistic try-on image
2. **Image Editing**: Users can edit images with AI (with or without mask) using DALL-E 2/3
3. **AI Style Recommendations**: Users input style descriptions (text, e.g., "casual beach outfit"), GPT-4o suggests complete outfits (top + bottom + accessories)
4. **Shopping Links**: Returns direct links to seller websites (e.g., Shopee, Zara, independent shops)

## Tech Stack
- **Frontend/Backend**: Next.js 15 with React 19
- **Database**: Prisma with SQLite (dev) / PostgreSQL (production)
- **AI Integration**:
  - OpenAI GPT-4 Vision: Analyze person and clothing images
  - OpenAI DALL-E 3: Generate high-quality virtual try-on images
  - OpenAI DALL-E 2: Edit images with masks
  - OpenAI GPT-4o: Outfit recommendations
- **Deployment**: Vercel (optimized for Next.js)

## Key Advantages
- Higher quality (DALL-E 3 vs Stable Diffusion)
- Faster (15-30s vs 20-60s)
- Easier to maintain (1 provider instead of 2)
- More stable API (99.9% uptime)

## Development Priorities
1. Quality over speed (but keep response times < 30s)
2. Cost optimization (caching, smart quality settings)
3. User experience (clear feedback, error handling)
4. Scalability (rate limiting, efficient database queries)

## Important Notes
- All AI features use OpenAI exclusively
- Cache aggressive (1 hour TTL) to reduce costs
- Rate limiting per IP address
- Image size limit: 5MB
- Always validate inputs with Zod
- Use TypeScript strictly

## Cost Considerations
- Try-On: ~$0.05-0.09 per request (GPT-4 Vision + DALL-E 3)
- Image Edit: ~$0.02-0.08 per request (DALL-E 2/3)
- Recommendations: ~$0.01 per request (GPT-4o)
- Target: $100-500/month for 1000-5000 active users

## Code Quality Standards
- Write self-documenting code with clear variable names
- Add comments only for complex logic or non-obvious decisions
- Follow existing code conventions
- Ensure all new code has test coverage
- Update documentation when making significant changes

## Common Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npx prisma studio` - Open Prisma database GUI
- `npx prisma db push` - Push schema changes to database
- `npx prisma db seed` - Seed database with mock data