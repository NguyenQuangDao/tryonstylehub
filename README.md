# AIStyleHub - Virtual Try-On Platform

A modern, high-performance virtual try-on platform built with Next.js 15, React 19, and TypeScript. Experience AI-powered fashion try-on with advanced image processing and real-time rendering.

## 🚀 Features

### Core Features
- **AI-Powered Virtual Try-On**: Công nghệ FASHN cho mô phỏng trang phục chân thực
- **Real-time Image Processing**: High-quality image resizing and optimization using Pica
- **FASHN v1.6**: Hỗ trợ model try-on v1.6
- **Virtual Model Management**: Create and manage custom virtual models with body measurements
- **Responsive Design**: Optimized for all devices with modern UI/UX theo Material Design
- **Dark Mode Support**: Complete dark/light theme system
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support

### Performance Features
- **Lazy Loading**: Components and images load on demand
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Multi-layer caching system (memory, localStorage, sessionStorage)
- **Image Optimization**: WebP/AVIF support with automatic format selection
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Performance Monitoring**: Real-time Web Vitals tracking

### UI/UX Features
- **Modern Design System**: Consistent design tokens and components
- **Smooth Animations**: Framer Motion powered transitions
- **Toast Notifications**: User-friendly feedback system
- **Modal System**: Accessible modal components with focus management
- **Form Validation**: Real-time validation with Zod schemas
- **Responsive Components**: Adaptive layouts for all screen sizes

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # Page-specific components
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── common/           # Common components
│   ├── forms/            # Form components
│   ├── modals/           # Modal components
│   └── ui/               # UI primitives
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── services/             # Business logic services
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui, tuân thủ Material Design
- **Animations**: Framer Motion
- **State Management**: React hooks with custom state management
- **Image Processing**: Pica for high-quality resizing
- **Validation**: Zod for schema validation
- **Icons**: Lucide React
- **Database**: Prisma ORM (if applicable)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/your-username/aistylehub.git
   cd aistylehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # API Configuration (server-side only)
   FASHN_API_KEY=your_api_key_here
   
   # Database (if using Prisma)
   DATABASE_URL=your_database_url
   
   # Next.js Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Basic Try-On Process

1. **Upload Model Image**: Select or upload a photo of the person
2. **Upload Garment Image**: Select or upload a photo of the clothing item
3. **Configure Settings**: Choose garment type, category, and processing options
4. **Generate Result**: Click "Thử Đồ Ngay" to process the virtual try-on
5. **View Results**: Browse generated images and download favorites

### Advanced Features

#### Virtual Model Management
- Create custom virtual models with body measurements
- Save and reuse models for consistent results
- Manage multiple models for different body types

#### Comparison Mode
- So sánh kết quả dễ dàng
- Side-by-side comparison với lưới hoặc chế độ đối chiếu
- Hiệu ứng chuyển động trực quan

#### Performance Optimization
- Automatic image optimization and resizing
- Lazy loading for improved performance
- Caching for faster subsequent loads

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:turbo    # Start with Turbopack (faster)

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage

# Database (if using Prisma)
npm run prisma:generate  # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled, prefer type safety
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with custom design tokens
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: Feature-based organization
- **Imports**: Absolute imports with `@/` prefix

### Performance Guidelines

- Use `React.memo` for expensive components
- Implement lazy loading for non-critical components
- Optimize images with proper sizing and formats
- Use caching for API responses
- Monitor bundle size and performance metrics

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Gray scale (#64748B)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Open Sans (Vietnamese optimized)
- **Scale**: Responsive typography scale
- **Weights**: 300-800 range

### Components
- **Cards**: Modern glass-morphism design
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Accessible form controls with validation
- **Modals**: Full-screen overlays with animations

## 🔧 Configuration

### Next.js Configuration
The project uses optimized Next.js configuration:
- Image optimization with WebP/AVIF support
- Bundle optimization with code splitting
- Performance monitoring
- Security headers

### Tailwind Configuration
Custom Tailwind setup with:
- Design tokens integration
- Dark mode support
- Custom animations
- Responsive utilities

## 📊 Performance

### Optimization Features
- **Bundle Size**: Optimized with tree shaking
- **Loading Speed**: Lazy loading and code splitting
- **Image Performance**: Automatic optimization
- **Caching**: Multi-layer caching strategy
- **Monitoring**: Real-time performance tracking

### Web Vitals Targets
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/     # Component tests
├── utils/         # Utility function tests
└── integration/   # Integration tests
```

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:ui           # Visual test runner
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Ensure all production environment variables are set:
- API keys and endpoints
- Database connections
- CDN configurations
- Analytics tracking

### Performance Monitoring
- Enable Web Vitals tracking
- Set up error monitoring
- Configure performance budgets
- Monitor bundle sizes

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Review Process
- All changes require review
- Tests must pass
- Performance impact assessment
- Accessibility compliance check

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FASHN API** for virtual try-on technology
- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Open Sans** for Vietnamese typography support

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/your-username/aistylehub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/aistylehub/discussions)
- **Email**: support@aistylehub.com

---

**Made with ❤️ for the Vietnamese fashion community**