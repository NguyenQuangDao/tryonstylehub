# Chương 2 — Sơ đồ Phân tích & Thiết kế (Mermaid)

## 1) Kiến trúc tổng quan hệ thống
```mermaid
flowchart LR
  subgraph Client[Frontend (Next.js App Router)]
    UI[UI Pages / Components]
  end

  subgraph Backend[Backend (Next.js API Routes)]
    TRYON[/api/tryon/]
    GENIMG[/api/generate-image/]
    PROMPT[/api/generate-prompt/]
    UPLOAD[/api/upload/]
    PRESIGN[/api/upload/presigned-url/]
    TOKENS[/api/tokens/*]
    AUTH[/api/auth/*]
    TOKENM[Token Manager]
    AUTHM[Auth/JWT]
  end

  subgraph ExternalAI[External AI Services]
    FASHN[Fashn API (IDM-VTON)]
    OPENAI[OpenAI Images]
    OPENROUTER[OpenRouter LLM]
  end

  subgraph Storage[Storage & Database]
    S3[(AWS S3)]
    DB[(Prisma Database)]
  end

  STRIPE[Stripe Payment]

  UI --> TRYON
  UI --> GENIMG
  UI --> PROMPT
  UI --> UPLOAD
  UI --> PRESIGN
  UI --> TOKENS
  UI --> AUTH

  TRYON --> TOKENM
  GENIMG --> TOKENM
  TOKENS --> STRIPE
  TOKENS --> DB

  TRYON --> FASHN
  GENIMG --> OPENAI
  PROMPT --> OPENROUTER

  TRYON --> S3
  GENIMG --> S3
  UPLOAD --> S3
  PRESIGN --> S3

  TRYON --> DB
  GENIMG --> DB
  AUTH --> AUTHM
```

## 2) Use Case chính và Actors
```mermaid
flowchart LR
  subgraph Actors
    Guest[Khách vãng lai]
    Member[Thành viên]
    Seller[Người bán]
    Admin[Quản trị viên]
  end

  subgraph UseCases[Use Cases]
    UC1((Quản lý tài khoản))
    UC2((Mua sắm & Checkout))
    UC3((Thử đồ ảo))
    UC4((Gợi ý phối đồ AI))
    UC5((Hệ thống Token))
    UC6((Kênh Người bán))
    UC7((Quản trị & Blog))
  end

  Guest --> UC2
  Guest --> UC7

  Member --> UC1
  Member --> UC2
  Member --> UC3
  Member --> UC4
  Member --> UC5

  Seller --> UC6

  Admin --> UC7
```

## 3) Activity Diagram — Thực hiện thử đồ ảo
```mermaid
stateDiagram-v2
  [*] --> Validate
  Validate: Kiểm tra ảnh & token
  Validate -->|Hợp lệ| PrepareData
  Validate -->|Không hợp lệ| Error

  PrepareData: Base64, cấu hình (category, mode)
  PrepareData --> CallAI

  CallAI: Gọi Fashn API predictions.run
  CallAI --> Polling

  Polling: Kiểm tra trạng thái mỗi 2s
  Polling -->|Processing| Polling
  Polling -->|Failed| Error
  Polling -->|Completed| ResultProcessing

  ResultProcessing: Tải ảnh, optimize (sharp), upload S3
  ResultProcessing --> UpdateData

  UpdateData: Trừ token, lưu metadata DB
  UpdateData --> Display
  Display: Trả URL ảnh cho client

  Display --> [*]
  Error --> [*]
```

## 4) Sequence Diagram — Try-on end-to-end
```mermaid
sequenceDiagram
  participant M as Member
  participant C as Client (Next.js)
  participant B as Backend /api/tryon
  participant A as Fashn API
  participant S as AWS S3
  participant T as Token Manager
  participant D as Database

  M->>C: Chọn ảnh + trang phục + nhấn "Thử ngay"
  C->>B: POST /api/tryon (base64, config)
  B->>T: requireTokens(cost)
  T-->>B: OK
  B->>A: predictions.run(config, images)
  loop Polling 2s
    B->>A: GET status(jobId)
    A-->>B: status=processing|completed|failed
  end
  alt completed
    B->>S: Optimize (sharp) & upload ảnh kết quả
    B->>D: Lưu metadata, trừ tokens
    B-->>C: 200 { url }
    C-->>M: Hiển thị ảnh kết quả
  else failed/timeout
    B->>D: Ghi log lỗi, refund nếu cần
    B-->>C: 5xx lỗi
    C-->>M: Thông báo thất bại
  end
```

## 5) State Diagram — Trạng thái job Try-on
```mermaid
stateDiagram-v2
  [*] --> Created
  Created --> Processing
  Processing --> Completed
  Processing --> Failed
  Processing --> Timeout
  Completed --> [*]
  Failed --> [*]
  Timeout --> [*]
```

## 6) ER Diagram — Mô hình dữ liệu chính
```mermaid
erDiagram
  USER {
    string id
    string email
    string name
    string role
    int tokens
    date createdAt
  }
  SHOP {
    string id
    string ownerId
    string name
    date createdAt
  }
  PRODUCT {
    string id
    string shopId
    string title
    float price
    string category
    string imageUrl
    int inventory
    date createdAt
  }
  ORDER {
    string id
    string buyerId
    string status
    float total
    date createdAt
  }
  ORDER_ITEM {
    string id
    string orderId
    string productId
    int quantity
    float price
  }
  TOKEN_PURCHASE {
    string id
    string userId
    int tokens
    float amount
    string currency
    string provider
    string status
    date createdAt
  }
  TOKEN_TRANSACTION {
    string id
    string userId
    string type
    int amount
    string reason
    date createdAt
  }
  TRYON_JOB {
    string id
    string userId
    string garmentId
    string personImageUrl
    string resultUrl
    string status
    date createdAt
    date completedAt
  }
  GALLERY_MEDIA {
    string id
    string userId
    string url
    string type
    date createdAt
  }
  BLOG_POST {
    string id
    string authorId
    string title
    string content
    string coverUrl
    int likes
    date createdAt
  }
  COMMENT {
    string id
    string postId
    string authorId
    string content
    date createdAt
  }

  USER ||--o{ SHOP : owns
  SHOP ||--o{ PRODUCT : lists
  USER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  USER ||--o{ TOKEN_PURCHASE : buys
  USER ||--o{ TOKEN_TRANSACTION : has
  USER ||--o{ TRYON_JOB : runs
  USER ||--o{ GALLERY_MEDIA : saves
  USER ||--o{ BLOG_POST : writes
  BLOG_POST ||--o{ COMMENT : has
```

## 7) Sequence — Mua token qua Stripe
```mermaid
sequenceDiagram
  participant M as Member
  participant C as Client
  participant B as Backend /api/tokens/purchase
  participant P as Stripe
  participant D as Database

  M->>C: Chọn gói token và thanh toán
  C->>B: POST /purchase {packageId}
  B->>P: Tạo PaymentIntent
  P-->>B: client_secret
  B-->>C: {clientSecret}
  C->>P: Confirm card payment
  P-->>B: webhook payment_intent.succeeded
  B->>D: Tạo purchase, cộng tokens
  B-->>C: Hiển thị kết quả thành công
```

## 8) Flow — AI Recommendation
```mermaid
flowchart LR
  Prompt[Prompt người dùng] --> NLP[Phân tích ngữ nghĩa]
  NLP --> Attrs[Thuộc tính: Style, Occasion, Color]
  Attrs --> Filter[Filter sản phẩm trong DB]
  Wishlist[Ưu tiên Wishlist] --> Filter
  Following[Ưu tiên Shop theo dõi] --> Filter
  Filter --> Result[Danh sách gợi ý + Trending]
```

## 9) Sequence — Upload với Presigned URL
```mermaid
sequenceDiagram
  participant C as Client
  participant B as Backend /api/upload/presigned-url
  participant S as AWS S3

  C->>B: GET presigned URL {key}
  B-->>C: {url, fields}
  C->>S: PUT file lên S3 (presigned)
  S-->>C: 200 OK
```

## 10) Sequence — Tạo ảnh bằng OpenAI (DALL·E)
```mermaid
sequenceDiagram
  participant M as Member
  participant C as Client
  participant B as Backend /api/generate-image
  participant OA as OpenAI Images
  participant S as AWS S3
  participant D as Database
  participant T as Token Manager

  M->>C: Nhập prompt, tạo ảnh
  C->>B: POST /generate-image {prompt}
  B->>T: requireTokens
  T-->>B: OK
  B->>OA: images.generate(prompt)
  OA-->>B: images (base64)
  B->>S: Optimize (sharp), upload
  B->>D: Lưu metadata, trừ tokens
  B-->>C: {url}
```

## 11) Flow — Kênh Người bán & Quản trị
```mermaid
flowchart LR
  Register[Đăng ký mở shop] --> Review[Duyệt bởi Admin]
  Review -->|Approved| ShopActive[Shop hoạt động]
  Review -->|Rejected| End[Kết thúc]
  ShopActive --> AddProduct[Đăng sản phẩm]
  ShopActive --> Inventory[Quản lý kho]
  ShopActive --> Orders[Quản lý đơn hàng]
  Orders --> Stats[Thống kê doanh thu]
  Admin[Quản trị] --> Review
  Admin --> Blog[Quản lý Blog]
```

## 12) Flow — Blog & Media
```mermaid
flowchart LR
  Create[Viết bài Blog] --> Upload[Upload ảnh/video vào S3]
  Upload --> Publish[Đăng bài]
  Publish --> Read[Người dùng xem]
  Read --> Like[Like/Save]
  Read --> Comment[Bình luận kèm media]
```

## 13) Bản đồ API chính (App Router)
```mermaid
flowchart TB
  subgraph API Routes
    A1[/api/tryon/]
    A2[/api/tryon/status/:jobId]
    A3[/api/generate-image/]
    A4[/api/generate-prompt/]
    A5[/api/upload/]
    A6[/api/upload/presigned-url/]
    T1[/api/tokens/purchase/]
    T2[/api/tokens/confirm-stripe/]
    T3[/api/tokens/payment-webhook/]
    T4[/api/tokens/balance/]
    B1[/api/blog/posts/]
    B2[/api/blog/posts/:id]
    B3[/api/blog/posts/:id/like]
    B4[/api/blog/posts/:id/save]
    B5[/api/blog/posts/:id/comments]
    AU1[/api/auth/login/]
    AU2[/api/auth/logout/]
    AU3[/api/auth/register/]
  end
```

## 14) Deployment & tích hợp
```mermaid
flowchart LR
  subgraph Browser[Client Browser]
    Cookie[Cookie JWT]
  end
  subgraph NextJS[Next.js App + API]
    App[App Router]
    Routes[API Routes]
    Middleware[Token/Auth Middleware]
  end
  subgraph Cloud[Cloud Services]
    S3[(AWS S3 Bucket)]
    Stripe[Stripe Gateway]
    Fashn[Fashn API]
    OpenAI[OpenAI Images]
    OpenRouter[OpenRouter LLM]
    DB[(Prisma-backed DB)]
  end

  Cookie -. gửi/nhận .- Routes
  App --> Routes
  Routes --> S3
  Routes --> DB
  Routes --> Stripe
  Routes --> Fashn
  Routes --> OpenAI
  Routes --> OpenRouter
```

> Lưu ý: Các sơ đồ phản ánh đúng kiến trúc và luồng xử lý hiện tại trong codebase (Next.js App Router, API routes, S3, Prisma, Stripe, Fashn/OpenAI/OpenRouter, Token/JWT). Có thể mở file này bằng bất kỳ viewer hỗ trợ Mermaid để render.
