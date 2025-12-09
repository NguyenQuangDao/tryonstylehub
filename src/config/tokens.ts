/**
 * Token Configuration & Design System
 * Centralized configuration for token-related settings and shadcn/ui design tokens
 */

// ============================================================================
// DESIGN TOKENS (shadcn/ui inspired)
// ============================================================================

export const DESIGN_TOKENS = {
    // Color System - HSL values following shadcn/ui conventions
    colors: {
        // Primary brand colors
        primary: {
            DEFAULT: 'hsl(222.2 47.4% 11.2%)',      // Deep slate for primary elements
            foreground: 'hsl(210 40% 98%)',         // Light text on primary
            50: 'hsl(210 40% 98%)',
            100: 'hsl(214 32% 91%)',
            200: 'hsl(213 27% 84%)',
            300: 'hsl(212 24% 74%)',
            400: 'hsl(213 21% 60%)',
            500: 'hsl(217 19% 27%)',
            600: 'hsl(222.2 47.4% 11.2%)',
            700: 'hsl(222 47% 11%)',
            800: 'hsl(223 50% 8%)',
            900: 'hsl(224 71% 4%)',
        },

        // Accent colors - Vibrant purple/violet
        accent: {
            DEFAULT: 'hsl(262.1 83.3% 57.8%)',      // Vibrant purple
            foreground: 'hsl(210 40% 98%)',
            50: 'hsl(270 100% 98%)',
            100: 'hsl(269 100% 95%)',
            200: 'hsl(269 100% 92%)',
            300: 'hsl(269 97% 85%)',
            400: 'hsl(270 95% 75%)',
            500: 'hsl(262.1 83.3% 57.8%)',
            600: 'hsl(262 80% 50%)',
            700: 'hsl(263 70% 45%)',
            800: 'hsl(263 69% 42%)',
            900: 'hsl(264 67% 35%)',
        },

        // Secondary colors - Elegant blue
        secondary: {
            DEFAULT: 'hsl(217.2 91.2% 59.8%)',      // Bright blue
            foreground: 'hsl(222.2 47.4% 11.2%)',
            50: 'hsl(214 100% 97%)',
            100: 'hsl(214 95% 93%)',
            200: 'hsl(213 97% 87%)',
            300: 'hsl(212 96% 78%)',
            400: 'hsl(213 94% 68%)',
            500: 'hsl(217.2 91.2% 59.8%)',
            600: 'hsl(221 83% 53%)',
            700: 'hsl(224 76% 48%)',
            800: 'hsl(226 71% 40%)',
            900: 'hsl(224 64% 33%)',
        },

        // Muted colors for backgrounds and subtle elements
        muted: {
            DEFAULT: 'hsl(210 40% 96.1%)',
            foreground: 'hsl(215.4 16.3% 46.9%)',
        },

        // Destructive/Error colors
        destructive: {
            DEFAULT: 'hsl(0 84.2% 60.2%)',
            foreground: 'hsl(210 40% 98%)',
        },

        // Success colors - Fresh green
        success: {
            DEFAULT: 'hsl(142.1 76.2% 36.3%)',
            foreground: 'hsl(210 40% 98%)',
            50: 'hsl(138 76% 97%)',
            100: 'hsl(141 84% 93%)',
            200: 'hsl(141 79% 85%)',
            300: 'hsl(142 77% 73%)',
            400: 'hsl(142 69% 58%)',
            500: 'hsl(142.1 76.2% 36.3%)',
            600: 'hsl(142 71% 29%)',
            700: 'hsl(142 64% 24%)',
            800: 'hsl(143 61% 20%)',
            900: 'hsl(144 61% 16%)',
        },

        // Warning colors - Amber
        warning: {
            DEFAULT: 'hsl(38 92% 50%)',
            foreground: 'hsl(222.2 47.4% 11.2%)',
            50: 'hsl(48 100% 96%)',
            100: 'hsl(48 96% 89%)',
            200: 'hsl(48 97% 77%)',
            300: 'hsl(46 97% 65%)',
            400: 'hsl(43 96% 56%)',
            500: 'hsl(38 92% 50%)',
            600: 'hsl(32 95% 44%)',
            700: 'hsl(26 90% 37%)',
            800: 'hsl(23 83% 31%)',
            900: 'hsl(22 78% 26%)',
        },

        // Neutral grays
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        card: 'hsl(0 0% 100%)',
        cardForeground: 'hsl(222.2 84% 4.9%)',
        popover: 'hsl(0 0% 100%)',
        popoverForeground: 'hsl(222.2 84% 4.9%)',
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(262.1 83.3% 57.8%)',
    },

    // Spacing scale (based on 4px base unit)
    spacing: {
        0: '0',
        1: '0.25rem',    // 4px
        2: '0.5rem',     // 8px
        3: '0.75rem',    // 12px
        4: '1rem',       // 16px
        5: '1.25rem',    // 20px
        6: '1.5rem',     // 24px
        8: '2rem',       // 32px
        10: '2.5rem',    // 40px
        12: '3rem',      // 48px
        16: '4rem',      // 64px
        20: '5rem',      // 80px
        24: '6rem',      // 96px
    },

    // Typography
    typography: {
        fontFamily: {
            sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"Fira Code", "Courier New", monospace',
        },
        fontSize: {
            xs: '0.75rem',      // 12px
            sm: '0.875rem',     // 14px
            base: '1rem',       // 16px
            lg: '1.125rem',     // 18px
            xl: '1.25rem',      // 20px
            '2xl': '1.5rem',    // 24px
            '3xl': '1.875rem',  // 30px
            '4xl': '2.25rem',   // 36px
            '5xl': '3rem',      // 48px
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
        lineHeight: {
            none: '1',
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        },
    },

    // Border radius
    borderRadius: {
        none: '0',
        sm: '0.25rem',      // 4px
        DEFAULT: '0.5rem',  // 8px
        md: '0.5rem',       // 8px
        lg: '0.75rem',      // 12px
        xl: '1rem',         // 16px
        '2xl': '1.5rem',    // 24px
        full: '9999px',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        glow: '0 0 20px rgba(124, 58, 237, 0.4)',
    },

    // Animations
    animations: {
        transition: {
            fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
            base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
            slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },
}

// ============================================================================
// TOKEN SYSTEM CONFIGURATION
// ============================================================================

export const TOKEN_CONFIG = {
    // Free tokens for new users
    FREE_TOKENS_ON_SIGNUP: 10,

    // Token costs for different operations with icons and colors
    COSTS: {
        TRY_ON_STANDARD: {
            amount: 2,
            name: 'Phối đồ ảo (thường)',
            icon: '👔',
            color: DESIGN_TOKENS.colors.secondary.DEFAULT,
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.secondary[400]}, ${DESIGN_TOKENS.colors.secondary[600]})`,
        },
        TRY_ON_HIGH: {
            amount: 4,
            name: 'Phối đồ ảo (cao)',
            icon: '👔',
            color: DESIGN_TOKENS.colors.secondary[700],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.secondary[600]}, ${DESIGN_TOKENS.colors.secondary[800]})`,
        },
        AI_RECOMMENDATION: {
            amount: 1,
            name: 'Gợi ý AI',
            icon: '🤖',
            color: DESIGN_TOKENS.colors.accent.DEFAULT,
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.accent[400]}, ${DESIGN_TOKENS.colors.accent[600]})`,
        },
        GENERATE_IMAGE: {
            amount: 1,
            name: 'Tạo hình ảnh AI',
            icon: '🎨',
            color: DESIGN_TOKENS.colors.warning.DEFAULT,
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.warning[400]}, ${DESIGN_TOKENS.colors.warning[600]})`,
        },
        CUSTOM_MODEL: {
            amount: 3,
            name: 'Model tùy chỉnh',
            icon: '👤',
            color: DESIGN_TOKENS.colors.success.DEFAULT,
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.success[400]}, ${DESIGN_TOKENS.colors.success[600]})`,
        },
    },

    // Token packages with enhanced visual design
    PACKAGES: [
        // USD Packages (International)
        {
            id: 'starter',
            name: 'Starter',
            nameVi: 'Gói Khởi Đầu',
            tokens: 20,
            price: 4.99,
            currency: 'USD',
            featured: false,
            popular: false,
            description: 'Perfect to start your journey',
            descriptionVi: 'Hoàn hảo để bắt đầu trải nghiệm',
            icon: '🌱',
            color: DESIGN_TOKENS.colors.success[500],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.success[300]}, ${DESIGN_TOKENS.colors.success[600]})`,
            badge: null,
            savings: 0,
            features: ['20 tokens', 'Basic features', 'Email support'],
        },
        {
            id: 'basic',
            name: 'Basic',
            nameVi: 'Gói Cơ Bản',
            tokens: 50,
            price: 9.99,
            currency: 'USD',
            featured: false,
            popular: true,
            description: 'Great for regular users',
            descriptionVi: 'Phù hợp cho người dùng thường xuyên',
            icon: '⭐',
            color: DESIGN_TOKENS.colors.secondary[500],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.secondary[300]}, ${DESIGN_TOKENS.colors.secondary[600]})`,
            badge: 'Popular',
            badgeColor: DESIGN_TOKENS.colors.secondary.DEFAULT,
            savings: 10,
            features: ['50 tokens', 'All basic features', 'Priority email support', '10% savings'],
        },
        {
            id: 'pro',
            name: 'Professional',
            nameVi: 'Gói Chuyên Nghiệp',
            tokens: 120,
            price: 19.99,
            currency: 'USD',
            featured: true,
            popular: false,
            description: 'Best for professionals',
            descriptionVi: 'Tốt nhất cho người dùng chuyên nghiệp',
            icon: '💎',
            color: DESIGN_TOKENS.colors.accent[500],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.accent[400]}, ${DESIGN_TOKENS.colors.accent[700]})`,
            badge: 'Best Value',
            badgeColor: DESIGN_TOKENS.colors.accent.DEFAULT,
            savings: 20,
            features: ['120 tokens', 'All pro features', 'Priority support', '20% savings', 'Custom models'],
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            nameVi: 'Gói Doanh Nghiệp',
            tokens: 350,
            price: 49.99,
            currency: 'USD',
            featured: false,
            popular: false,
            description: 'For business solutions',
            descriptionVi: 'Giải pháp cho doanh nghiệp',
            icon: '🏢',
            color: DESIGN_TOKENS.colors.primary[600],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary[400]}, ${DESIGN_TOKENS.colors.primary[800]})`,
            badge: null,
            savings: 30,
            features: ['350 tokens', 'All features', '24/7 support', '30% savings', 'API access', 'Team collaboration'],
        },

        // VND Packages (Vietnam)
        {
            id: 'starter_vnd',
            name: 'Starter',
            nameVi: 'Gói Khởi Đầu',
            tokens: 20,
            price: 99000,
            currency: 'VND',
            featured: false,
            popular: false,
            description: 'Perfect to start your journey',
            descriptionVi: 'Hoàn hảo để bắt đầu trải nghiệm',
            icon: '🌱',
            color: DESIGN_TOKENS.colors.success[500],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.success[300]}, ${DESIGN_TOKENS.colors.success[600]})`,
            badge: null,
            savings: 0,
            features: ['20 tokens', 'Tính năng cơ bản', 'Hỗ trợ email'],
        },
        {
            id: 'basic_vnd',
            name: 'Basic',
            nameVi: 'Gói Cơ Bản',
            tokens: 50,
            price: 199000,
            currency: 'VND',
            featured: false,
            popular: true,
            description: 'Great for regular users',
            descriptionVi: 'Phù hợp cho người dùng thường xuyên',
            icon: '⭐',
            color: DESIGN_TOKENS.colors.secondary[500],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.secondary[300]}, ${DESIGN_TOKENS.colors.secondary[600]})`,
            badge: 'Phổ biến',
            badgeColor: DESIGN_TOKENS.colors.secondary.DEFAULT,
            savings: 10,
            features: ['50 tokens', 'Tất cả tính năng cơ bản', 'Hỗ trợ ưu tiên', 'Tiết kiệm 10%'],
        },
        {
            id: 'pro_vnd',
            name: 'Professional',
            nameVi: 'Gói Chuyên Nghiệp',
            tokens: 120,
            price: 399000,
            currency: 'VND',
            featured: true,
            popular: false,
            description: 'Best for professionals',
            descriptionVi: 'Tốt nhất cho người dùng chuyên nghiệp',
            icon: '💎',
            color: DESIGN_TOKENS.colors.accent[500],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.accent[400]}, ${DESIGN_TOKENS.colors.accent[700]})`,
            badge: 'Đáng giá nhất',
            badgeColor: DESIGN_TOKENS.colors.accent.DEFAULT,
            savings: 20,
            features: ['120 tokens', 'Tất cả tính năng pro', 'Hỗ trợ ưu tiên', 'Tiết kiệm 20%', 'Model tùy chỉnh'],
        },
        {
            id: 'enterprise_vnd',
            name: 'Enterprise',
            nameVi: 'Gói Doanh Nghiệp',
            tokens: 350,
            price: 999000,
            currency: 'VND',
            featured: false,
            popular: false,
            description: 'For business solutions',
            descriptionVi: 'Giải pháp cho doanh nghiệp',
            icon: '🏢',
            color: DESIGN_TOKENS.colors.primary[600],
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary[400]}, ${DESIGN_TOKENS.colors.primary[800]})`,
            badge: null,
            savings: 30,
            features: ['350 tokens', 'Tất cả tính năng', 'Hỗ trợ 24/7', 'Tiết kiệm 30%', 'API truy cập', 'Làm việc nhóm'],
        },
    ],

    // Payment methods with modern icons and styling
    PAYMENT_METHODS: [
        {
            id: 'paypal',
            name: 'PayPal',
            nameVi: 'PayPal (Sandbox)',
            icon: '🅿️',
            svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19h12a4 4 0 0 0 0-8H9"/><path d="M9 11H6a4 4 0 0 0 0 8h1"/></svg>`,
            enabled: true,
            description: 'Ví điện tử PayPal - hỗ trợ thẻ quốc tế',
            currencies: ['USD'],
            color: DESIGN_TOKENS.colors.secondary[500],
            popularity: 1,
        },
    ],

    // Balance thresholds with visual indicators
    THRESHOLDS: {
        LOW_BALANCE: {
            value: 5,
            color: DESIGN_TOKENS.colors.warning.DEFAULT,
            icon: '⚠️',
            message: 'Your token balance is running low',
            messageVi: 'Số dư token của bạn sắp hết',
        },
        ZERO_BALANCE: {
            value: 0,
            color: DESIGN_TOKENS.colors.destructive.DEFAULT,
            icon: '🚫',
            message: 'You have run out of tokens',
            messageVi: 'Bạn đã hết token',
        },
        HEALTHY_BALANCE: {
            value: 20,
            color: DESIGN_TOKENS.colors.success.DEFAULT,
            icon: '✅',
            message: 'Your token balance is healthy',
            messageVi: 'Số dư token của bạn tốt',
        },
    },

    // Legacy compatibility (for existing code)
    LOW_BALANCE_THRESHOLD: 5,
    ZERO_BALANCE_THRESHOLD: 0,
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TokenPackage = typeof TOKEN_CONFIG.PACKAGES[number]
export type PaymentMethod = typeof TOKEN_CONFIG.PAYMENT_METHODS[number]
export type DesignTokens = typeof DESIGN_TOKENS
