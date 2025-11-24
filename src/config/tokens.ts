/**
 * Token Configuration
 * Centralized configuration for token-related settings
 */

export const TOKEN_CONFIG = {
    // Free tokens for new users
    FREE_TOKENS_ON_SIGNUP: 10,

    // Token costs for different operations
    COSTS: {
        TRY_ON: 1,              // Virtual try-on
        AI_RECOMMENDATION: 1,    // AI product recommendation
        GENERATE_IMAGE: 2,       // AI image generation
        CUSTOM_MODEL: 3,         // Create custom virtual model
    },

    // Token packages available for purchase
    PACKAGES: [
        // USD Packages (International)
        {
            id: 'starter',
            name: 'Gói Khởi Đầu',
            tokens: 20,
            price: 4.99,
            currency: 'USD',
            featured: true,
            description: 'Hoàn hảo để bắt đầu trải nghiệm',
            savings: 0,
        },
        {
            id: 'basic',
            name: 'Gói Cơ Bản',
            tokens: 50,
            price: 9.99,
            currency: 'USD',
            featured: false,
            description: 'Phù hợp cho người dùng thường xuyên',
            savings: 10, // % savings compared to starter
        },
        {
            id: 'pro',
            name: 'Gói Chuyên Nghiệp',
            tokens: 120,
            price: 19.99,
            currency: 'USD',
            featured: true,
            description: 'Tốt nhất cho người dùng chuyên nghiệp',
            savings: 20,
        },
        {
            id: 'enterprise',
            name: 'Gói Doanh Nghiệp',
            tokens: 350,
            price: 49.99,
            currency: 'USD',
            featured: false,
            description: 'Giải pháp cho doanh nghiệp',
            savings: 30,
        },
        // VND Packages (Vietnam)
        {
            id: 'starter_vnd',
            name: 'Gói Khởi Đầu',
            tokens: 20,
            price: 99000,
            currency: 'VND',
            featured: true,
            description: 'Hoàn hảo để bắt đầu trải nghiệm',
            savings: 0,
        },
        {
            id: 'basic_vnd',
            name: 'Gói Cơ Bản',
            tokens: 50,
            price: 199000,
            currency: 'VND',
            featured: false,
            description: 'Phù hợp cho người dùng thường xuyên',
            savings: 10,
        },
        {
            id: 'pro_vnd',
            name: 'Gói Chuyên Nghiệp',
            tokens: 120,
            price: 399000,
            currency: 'VND',
            featured: true,
            description: 'Tốt nhất cho người dùng chuyên nghiệp',
            savings: 20,
        },
        {
            id: 'enterprise_vnd',
            name: 'Gói Doanh Nghiệp',
            tokens: 350,
            price: 999000,
            currency: 'VND',
            featured: false,
            description: 'Giải pháp cho doanh nghiệp',
            savings: 30,
        },
    ],

    // Payment methods
    PAYMENT_METHODS: [
        {
            id: 'stripe',
            name: 'Thẻ tín dụng/ghi nợ (Stripe)',
            icon: '💳',
            enabled: true,
            description: 'Visa, MasterCard, American Express',
            currencies: ['USD', 'VND']
        },
        {
            id: 'paypal',
            name: 'PayPal',
            icon: '🅿️',
            enabled: true,
            description: 'Thanh toán qua tài khoản PayPal',
            currencies: ['USD']
        },
        {
            id: 'momo',
            name: 'Ví MoMo',
            icon: '🟣',
            enabled: true,
            description: 'Ví điện tử phổ biến tại Việt Nam',
            currencies: ['VND']
        },
        {
            id: 'vnpay',
            name: 'VNPay',
            icon: '🔵',
            enabled: true,
            description: 'Cổng thanh toán quốc gia',
            currencies: ['VND']
        },
        {
            id: 'zalopay',
            name: 'ZaloPay',
            icon: '⚡',
            enabled: true,
            description: 'Ví điện tử ZaloPay',
            currencies: ['VND']
        },
    ],

    // Minimum token balance warnings
    LOW_BALANCE_THRESHOLD: 5,
    ZERO_BALANCE_THRESHOLD: 0,
}

export type TokenPackage = typeof TOKEN_CONFIG.PACKAGES[number]
export type PaymentMethod = typeof TOKEN_CONFIG.PAYMENT_METHODS[number]
