# 🚀 Vingo Roll - Enterprise Migration Plan

## Executive Summary

Migration from **TanStack Start (Frontend-only)** to **Next.js + ASP.NET Core Clean Architecture** with PostgreSQL.

**Goal**: Transform frontend demo into production-ready marketplace platform with real backend.

---

## Current State Audit

### Technology Stack (Current)
- **Framework**: TanStack Start + React 19
- **Router**: TanStack Router
- **State**: Zustand (cart, wishlist, orders, swatches, UI)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS 4 + Radix UI
- **Data**: Mock data in `src/data/` (14 files)
- **Backend**: None (localStorage persistence only)

### Routes Inventory (42+ routes)
```
Core E-commerce:
├── / (Homepage)
├── /shop (Product catalog)
├── /shop/$category (Category pages)
├── /product/$slug (Product details)
├── /cart (Shopping cart)
├── /checkout (Multi-step checkout)
├── /checkout/payment (Payment)
├── /checkout/review (Order review)
├── /order-confirmation (Success page)
├── /wishlist (Saved products)
└── /search (Product search)

Discovery & Tools:
├── /style-finder (Interactive quiz)
├── /swatches (Sample request builder)
├── /quote (Quote builder)
├── /inspiration (Gallery)
├── /inspiration/$slug (Inspiration details)
├── /collections (Collections)
├── /collections/$slug (Collection details)
└── /rooms (Browse by room)

Content & Help:
├── /guides (Help center)
├── /guides/measuring (Measuring guide)
├── /guides/care (Care instructions)
├── /guides/shipping (Shipping info)
├── /guides/returns (Returns policy)
├── /services (Services overview)
├── /services/design-consultation
├── /services/measuring-installation
└── /services/$slug (Service details)

Company:
├── /about (About us)
├── /about/our-story
├── /contact (Contact form)
├── /trade (Trade program)
└── /smart-home (Smart home integration)

Legal:
├── /legal/privacy (Privacy policy)
├── /legal/terms (Terms of service)
├── /legal/cookies (Cookie policy)
└── /legal/accessibility (Accessibility statement)
```

### Mock Data Files
```
src/data/
├── categories.ts (Product categories)
├── collections.ts (Curated collections)
├── content.ts (CMS content)
├── faqs.ts (FAQ entries)
├── inspiration.ts (Gallery posts)
├── navigation.ts (Site navigation)
├── needs.ts (Customer needs taxonomy)
├── products.ts (Full product catalog ~20+ products)
├── reviews.ts (Product reviews)
├── rooms.ts (Room categories)
├── services.ts (Service offerings)
├── swatches.ts (Material samples)
├── testimonials.ts (Customer testimonials)
└── index.ts (Aggregated exports)
```

### Zustand Stores
```
src/store/
├── cart-store.ts (Shopping cart + localStorage)
├── order-store.ts (Order creation + mock checkout)
├── swatch-store.ts (Swatch request builder)
├── wishlist-store.ts (Saved products)
└── ui-store.ts (UI state, modals, theme)
```

### Business Logic Identified

#### Cart Store
- Multi-variant item keying (`slug::option1=value1|option2=value2`)
- Quantity management (1-20 limit)
- Undo remove functionality
- Subtotal/count calculations
- localStorage persistence

#### Order Store
- Order ID generation
- Shipping calculation (by subtotal + method)
- Tax calculation (by state)
- Estimated delivery date
- Order status tracking
- Multi-address support (shipping + billing)

#### Product Data Structure
```typescript
Product {
  slug, name, categoryId, price, compareAtPrice?
  short (description), lightControl, rooms[], needs[], style[]
  image, gallery[], collectionId?
  materials: MaterialOption[] (price deltas)
  colors: ColorOption[]
  sizes: SizeOption[] (price deltas)
  flags: { featured?, bestseller?, newArrival?, sale? }
  rating, reviewCount
}
```

---

## Target Architecture

### Monorepo Structure
```
Marketplace-Vingo-Roll-Eg-Full/
├── frontend/                    # Next.js App
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   ├── features/           # Feature modules
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API clients
│   │   ├── stores/             # Zustand stores
│   │   ├── lib/                # Utilities
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # Global styles
│   ├── public/                 # Static assets
│   ├── package.json
│   └── next.config.ts
│
├── backend/                     # ASP.NET Core
│   ├── src/
│   │   ├── Vingo.Domain/       # Core business logic
│   │   ├── Vingo.Application/  # Use cases (CQRS)
│   │   ├── Vingo.Infrastructure/ # EF Core, PostgreSQL
│   │   └── Vingo.WebAPI/       # HTTP layer
│   └── tests/
│       ├── Vingo.UnitTests/
│       ├── Vingo.IntegrationTests/
│       └── Vingo.ArchitectureTests/
│
├── database/                    # Database scripts
│   └── seeds/                  # Seed data migration
│
├── infrastructure/              # DevOps
│   ├── docker/
│   └── scripts/
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   └── MIGRATION.md
│
├── docker-compose.yml           # Local development
└── README.md                    # Updated docs
```

### Backend: Clean Architecture Layers

#### 1. Vingo.Domain (Core)
```
Entities:
- Product, Category, Collection
- User, Address, RefreshToken
- Order, OrderItem, OrderStatusHistory
- Cart, CartItem
- Wishlist, WishlistItem
- Material, Color, ProductMaterial
- Review, Rating
- Swatch, SwatchRequest
- QuoteRequest, Consultation
- Payment, PaymentTransaction

Value Objects:
- Money, Dimensions, Weight
- Address (with validation)
- Email, Phone

Domain Events:
- OrderPlaced, OrderStatusChanged
- ProductCreated, ProductPriceChanged
- ReviewSubmitted

Enums:
- OrderStatus, PaymentStatus, ShippingMethod
- MaterialTier, LightControl, RoomType
```

#### 2. Vingo.Application (Use Cases)
```
Features (CQRS):
├── Catalog/
│   ├── Queries/ (GetProducts, GetProductBySlug, SearchProducts)
│   └── Commands/ (CreateProduct, UpdateProduct)
├── Cart/
│   ├── Commands/ (AddToCart, UpdateQuantity, RemoveFromCart, MergeCart)
│   └── Queries/ (GetCart)
├── Orders/
│   ├── Commands/ (CreateOrder, UpdateOrderStatus, CancelOrder)
│   └── Queries/ (GetOrder, GetUserOrders)
├── Auth/
│   ├── Commands/ (Register, Login, RefreshToken, Logout)
│   └── Queries/ (GetCurrentUser)
├── Swatches/
│   └── Commands/ (RequestSwatch)
├── Quotes/
│   └── Commands/ (CreateQuote)
└── Reviews/
    └── Commands/ (SubmitReview)

DTOs:
- Request/Response models
- FluentValidation validators
- Mapster mapping profiles
```

#### 3. Vingo.Infrastructure (Implementation)
```
Persistence/
├── VingoDbContext (EF Core)
├── Configurations/ (Fluent API)
├── Repositories/ (IRepository implementations)
└── Migrations/

Identity/
├── ApplicationUser (ASP.NET Identity)
└── JwtTokenService

External Services/
├── EmailService
├── FileStorageService
└── PaymentGateway (placeholder)
```

#### 4. Vingo.WebAPI (HTTP)
```
Controllers/
├── AuthController
├── ProductsController
├── CategoriesController
├── CartController
├── OrdersController
├── SwatchesController
├── QuotesController
└── ReviewsController

Middleware/
├── GlobalExceptionHandler
├── JwtMiddleware
└── RequestLoggingMiddleware

Configuration/
├── DependencyInjection
├── OpenAPI (Scalar)
└── CORS, Rate Limiting
```

---

## Database Design

### PostgreSQL Schema (15+ tables)

#### Identity Domain
```sql
Users (Id, Email, PasswordHash, FirstName, LastName, Phone, CreatedAt)
Roles (Id, Name)
UserRoles (UserId, RoleId)
Addresses (Id, UserId, Type, Street, City, State, Zip, Country, IsDefault)
RefreshTokens (Id, UserId, Token, ExpiresAt, CreatedAt, RevokedAt)
```

#### Catalog Domain
```sql
Categories (Id, Name, Slug, Description, ImageUrl, ParentId, SortOrder)
Products (Id, Slug, Name, Description, BasePrice, CompareAtPrice, CategoryId, 
          LightControl, IsActive, IsFeatured, IsBestseller, IsNewArrival, 
          IsSale, Rating, ReviewCount, CreatedAt, UpdatedAt)
ProductImages (Id, ProductId, Url, AltText, SortOrder, IsPrimary)
Materials (Id, Name, Slug, Tier, PriceDelta, Description, SwatchImageUrl)
Colors (Id, Name, Hex, Family, SortOrder)
ProductMaterials (ProductId, MaterialId)
ProductColors (ProductId, ColorId)
Collections (Id, Name, Slug, Description, ImageUrl, IsActive, SortOrder)
ProductCollections (ProductId, CollectionId)
```

#### Shopping Domain
```sql
Carts (Id, UserId, SessionId, CreatedAt, UpdatedAt)
CartItems (Id, CartId, ProductId, MaterialId, ColorId, Width, Height, 
           Quantity, UnitPrice, CreatedAt)
Wishlists (Id, UserId, CreatedAt)
WishlistItems (Id, WishlistId, ProductId, CreatedAt)
```

#### Orders Domain
```sql
Orders (Id, OrderNumber, UserId, Status, Subtotal, Shipping, Tax, Total, 
        ShippingAddressId, BillingAddressId, PaymentMethod, 
        EstimatedDelivery, CreatedAt, UpdatedAt)
OrderItems (Id, OrderId, ProductId, MaterialName, ColorName, Width, Height, 
            Quantity, UnitPrice, TotalPrice)
OrderStatusHistory (Id, OrderId, Status, Notes, CreatedAt)
OrderAddresses (Id, OrderId, Type, Street, City, State, Zip, Country)
```

#### Payments Domain
```sql
Payments (Id, OrderId, Amount, Method, Status, TransactionId, CreatedAt)
PaymentTransactions (Id, PaymentId, Type, Amount, Status, Response, CreatedAt)
```

#### Marketing Domain
```sql
Promotions (Id, Code, DiscountType, DiscountValue, StartDate, EndDate, UsageLimit)
SwatchRequests (Id, UserId, Email, FullName, AddressId, Status, CreatedAt)
SwatchRequestItems (Id, RequestId, MaterialId, ColorId)
QuoteRequests (Id, UserId, Email, Phone, Description, Status, CreatedAt)
Consultations (Id, UserId, ServiceType, ScheduledAt, Status, Notes, CreatedAt)
```

#### Content Domain
```sql
Reviews (Id, ProductId, UserId, Rating, Title, Comment, IsVerifiedPurchase, 
         IsApproved, CreatedAt)
InspirationPosts (Id, Slug, Title, Excerpt, Content, ImageUrl, Category, 
                  PublishedAt, ViewCount)
Rooms (Id, Name, Slug, Description, ImageUrl, SortOrder)
FAQs (Id, Question, Answer, Category, SortOrder, IsPublished)
Testimonials (Id, CustomerName, Location, Rating, Comment, ProductId, CreatedAt)
```

#### System
```sql
AuditLogs (Id, UserId, Action, Entity, EntityId, Changes, IpAddress, CreatedAt)
Notifications (Id, UserId, Type, Title, Message, IsRead, CreatedAt)
```

### Key Relationships
```
User 1→∞ Orders
User 1→1 Cart
User 1→∞ Addresses
User 1→1 Wishlist

Order 1→∞ OrderItems
Order 1→∞ OrderStatusHistory
Order 1→1 Payment

Product ∞→∞ Materials (ProductMaterials)
Product ∞→∞ Colors (ProductColors)
Product 1→∞ Reviews
Product ∞→1 Category

Cart 1→∞ CartItems
CartItem ∞→1 Product

SwatchRequest 1→∞ SwatchRequestItems
```

### EF Core Configuration
- Fluent API (no data annotations)
- Explicit indexes on slugs, foreign keys, status fields
- Unique constraints on email, slugs, order numbers
- Decimal precision for prices (18, 2)
- Cascade delete rules
- Optimistic concurrency (RowVersion) where needed
- Seed data from current mock data

---

## API Design

### Base URL
```
/api/v1/*
```

### Authentication
- JWT Bearer tokens
- Refresh token rotation
- HttpOnly cookies for refresh tokens
- CSRF protection

### Endpoints

#### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

#### Products
```
GET    /api/v1/products?page=1&limit=20&category=&search=&sort=
GET    /api/v1/products/{slug}
GET    /api/v1/products/featured
GET    /api/v1/products/bestsellers
GET    /api/v1/products/{slug}/reviews
POST   /api/v1/products/{slug}/reviews (auth)
```

#### Categories
```
GET    /api/v1/categories
GET    /api/v1/categories/{slug}
GET    /api/v1/categories/{slug}/products
```

#### Collections
```
GET    /api/v1/collections
GET    /api/v1/collections/{slug}
```

#### Materials & Colors
```
GET    /api/v1/materials
GET    /api/v1/colors
```

#### Cart (supports guest + authenticated)
```
GET    /api/v1/cart (auth or session)
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{id}
DELETE /api/v1/cart/items/{id}
DELETE /api/v1/cart (clear)
POST   /api/v1/cart/merge (guest → user)
```

#### Wishlist
```
GET    /api/v1/wishlist (auth)
POST   /api/v1/wishlist/items
DELETE /api/v1/wishlist/items/{productId}
```

#### Orders
```
POST   /api/v1/orders (auth)
GET    /api/v1/orders (auth, user's orders)
GET    /api/v1/orders/{id} (auth, ownership check)
POST   /api/v1/orders/{id}/cancel (auth)
```

#### Swatches
```
POST   /api/v1/swatches/request (guest or auth)
GET    /api/v1/swatches/materials
```

#### Quotes
```
POST   /api/v1/quotes (guest or auth)
GET    /api/v1/quotes (auth, user's quotes)
```

#### Consultations
```
POST   /api/v1/consultations (guest or auth)
GET    /api/v1/consultations (auth, user's consultations)
```

#### Content
```
GET    /api/v1/inspiration?page=1&category=
GET    /api/v1/inspiration/{slug}
GET    /api/v1/rooms
GET    /api/v1/faqs?category=
GET    /api/v1/testimonials
```

#### Admin (future)
```
/api/v1/admin/products
/api/v1/admin/orders
/api/v1/admin/users
```

### Response Format
```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 },
  "errors": []
}
```

### Error Response
```json
{
  "type": "ValidationError",
  "title": "One or more validation errors occurred",
  "status": 400,
  "errors": {
    "Email": ["Email is required"]
  },
  "traceId": "00-abc123..."
}
```

---

## Frontend Migration

### Next.js Route Mapping

| TanStack Router | Next.js App Router |
|---|---|
| `/` | `app/page.tsx` |
| `/shop` | `app/shop/page.tsx` |
| `/shop/$category` | `app/shop/[category]/page.tsx` |
| `/product/$slug` | `app/product/[slug]/page.tsx` |
| `/cart` | `app/cart/page.tsx` |
| `/checkout` | `app/checkout/page.tsx` |
| `/checkout/payment` | `app/checkout/payment/page.tsx` |
| `/checkout/review` | `app/checkout/review/page.tsx` |
| `/order-confirmation` | `app/order-confirmation/page.tsx` |
| `/wishlist` | `app/wishlist/page.tsx` |
| `/search` | `app/search/page.tsx` |
| `/style-finder` | `app/style-finder/page.tsx` |
| `/swatches` | `app/swatches/page.tsx` |
| `/quote` | `app/quote/page.tsx` |
| `/inspiration` | `app/inspiration/page.tsx` |
| `/inspiration/$slug` | `app/inspiration/[slug]/page.tsx` |
| `/collections` | `app/collections/page.tsx` |
| `/collections/$slug` | `app/collections/[slug]/page.tsx` |
| `/rooms` | `app/rooms/page.tsx` |
| `/services` | `app/services/page.tsx` |
| `/services/$slug` | `app/services/[slug]/page.tsx` |
| `/guides` | `app/guides/page.tsx` |
| `/guides/*` | `app/guides/*/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/about/our-story` | `app/about/our-story/page.tsx` |
| `/contact` | `app/contact/page.tsx` |
| `/trade` | `app/trade/page.tsx` |
| `/smart-home` | `app/smart-home/page.tsx` |
| `/legal/*` | `app/legal/*/page.tsx` |

### Server vs Client Components

**Server Components** (default):
- Homepage (`/`)
- Product listing (`/shop`, `/shop/[category]`)
- Product details (`/product/[slug]`)
- Collections, Inspiration, Rooms
- Static content (guides, about, legal)
- SEO metadata generation

**Client Components** (`"use client"`):
- Shopping cart UI
- Wishlist interactions
- Product quick view
- Filters & sorting
- Style Finder quiz
- Swatch builder
- Quote form
- Contact form
- Authentication modals
- Toast notifications

### Package Updates
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "zustand": "^5.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^5.x",
    "next-themes": "^0.x",
    "tailwindcss": "^4.x",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.x",
    "sonner": "^2.x",
    "date-fns": "^4.x",
    "embla-carousel-react": "^8.x",
    "framer-motion": "^11.x",
    "clsx": "^2.x",
    "tailwind-merge": "^3.x",
    "class-variance-authority": "^0.x"
  }
}
```

**Remove**:
- `@tanstack/react-start`
- `@tanstack/react-router`
- `@tanstack/router-plugin`
- `vite-tsconfig-paths`

### State Management Changes

#### Keep Zustand for:
- UI state (modals, theme, mobile menu)
- Guest cart (before login)
- Form wizard state (multi-step)

#### Move to TanStack Query + Backend:
- Products, categories, collections
- User profile, addresses
- Orders, order history
- Authenticated cart (synced with DB)
- Wishlist (persistent)
- Reviews
- Swatch/quote requests

#### Example: Cart Migration
```typescript
// Before (Zustand only)
const { items, add, remove } = useCartStore();

// After (Zustand + API sync)
const { items } = useCartStore(); // Guest cart
const { data: serverCart } = useQuery(['cart'], fetchCart); // Authenticated
const addToCartMutation = useMutation(addToCartAPI);
```

---

## Security Implementation

### Authentication
- ASP.NET Core Identity
- JWT access tokens (15-minute expiry)
- Refresh tokens (7-day expiry, rotation)
- HttpOnly cookies for refresh tokens
- Secure password hashing (bcrypt)

### Authorization
- Role-based (Admin, Customer, Guest)
- Resource ownership checks (IDOR prevention)
- Policy-based authorization

### Data Protection
- HTTPS only
- CORS allowlist
- Rate limiting (per IP + per user)
- Input validation (FluentValidation)
- SQL injection protection (parameterized queries)
- XSS protection (sanitization)
- CSRF tokens

### Payment Security
- Never trust client-side prices
- Server-side price recalculation
- Payment gateway integration (future)
- PCI DSS compliance considerations

---

## Testing Strategy

### Backend Tests

#### Unit Tests (xUnit + NSubstitute)
- Domain entity validation
- Application handlers
- Business logic calculations

#### Integration Tests (Testcontainers)
- Database operations
- Repository implementations
- API endpoints with real PostgreSQL

#### Architecture Tests (NetArchTest)
- Dependency rules (Domain → Application → Infrastructure)
- Naming conventions
- Immutability checks

### Frontend Tests
- Component tests (React Testing Library)
- E2E tests (Playwright) - critical flows
- Accessibility audits (axe-core)

---

## Phase Execution Plan

### Phase 1: Deep Audit ✅ (CURRENT)
- [x] Inventory routes, components, features
- [x] Document mock data structure
- [x] Map business logic in stores
- [x] Identify UI/UX patterns
- [ ] Create comprehensive checklist

**Deliverables**: This migration plan

---

### Phase 2: Backend Foundation (Week 1-2)

**2.1 Project Setup**
- [ ] Create ASP.NET Core solution
- [ ] Set up Clean Architecture projects
- [ ] Configure dependencies (NuGet packages)
- [ ] Set up logging (Serilog)
- [ ] Configure OpenAPI/Scalar

**2.2 Database Design**
- [ ] Create EF Core entities
- [ ] Configure relationships (Fluent API)
- [ ] Add indexes, constraints
- [ ] Create initial migration
- [ ] Write seed data scripts

**2.3 Identity & Auth**
- [ ] Configure ASP.NET Identity
- [ ] Implement JWT service
- [ ] Add refresh token logic
- [ ] Create auth endpoints
- [ ] Add authorization policies

**Deliverables**: Working backend scaffold, database schema, auth working

---

### Phase 3: Core Business Features (Week 3-4)

**3.1 Catalog**
- [ ] Product queries (list, detail, search)
- [ ] Category queries
- [ ] Material/color queries
- [ ] Collection queries
- [ ] Filtering, sorting, pagination

**3.2 Shopping**
- [ ] Cart endpoints (guest + authenticated)
- [ ] Cart merge logic
- [ ] Wishlist endpoints
- [ ] Quantity validation

**3.3 Orders**
- [ ] Order creation flow
- [ ] Price recalculation
- [ ] Order retrieval
- [ ] Status updates

**3.4 Content**
- [ ] Inspiration posts
- [ ] FAQs, testimonials
- [ ] Reviews

**Deliverables**: Complete REST API, Swagger docs

---

### Phase 4: Frontend Migration (Week 5-6)

**4.1 Next.js Setup**
- [ ] Create Next.js project
- [ ] Migrate components (preserve UI 100%)
- [ ] Migrate layouts, pages
- [ ] Set up Tailwind, Radix UI
- [ ] Configure routing

**4.2 API Integration**
- [ ] Create axios client
- [ ] Set up TanStack Query
- [ ] Implement auth hooks
- [ ] Add error handling
- [ ] Add loading states

**4.3 State Migration**
- [ ] Refactor cart store (API sync)
- [ ] Refactor wishlist (API sync)
- [ ] Update order flow
- [ ] Preserve UI store

**Deliverables**: Working Next.js app connected to backend

---

### Phase 5: Advanced Features (Week 7)

**5.1 Guest Cart Persistence**
- [ ] Session-based cart
- [ ] Cart merge on login

**5.2 Multi-step Checkout**
- [ ] Shipping address
- [ ] Billing address
- [ ] Payment selection
- [ ] Order review
- [ ] Confirmation

**5.3 Swatch & Quote Builders**
- [ ] Migrate swatch request flow
- [ ] Migrate quote builder

**Deliverables**: Complete user flows working

---

### Phase 6: Testing & Quality (Week 8)

**6.1 Backend Tests**
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] Architecture tests

**6.2 Frontend Tests**
- [ ] Component tests (critical paths)
- [ ] E2E tests (checkout, orders)
- [ ] Accessibility audit

**6.3 Security Review**
- [ ] OWASP checklist
- [ ] Auth flow audit
- [ ] Input validation review

**Deliverables**: Test suite passing, security report

---

### Phase 7: DevOps & Deployment (Week 9)

**7.1 Containerization**
- [ ] Backend Dockerfile
- [ ] Frontend Dockerfile
- [ ] Docker Compose (dev environment)

**7.2 CI/CD**
- [ ] GitHub Actions (build + test)
- [ ] Deployment pipeline
- [ ] Database migration strategy

**7.3 Monitoring**
- [ ] Health checks
- [ ] Logging strategy
- [ ] Error tracking

**Deliverables**: Deployable artifacts, CI/CD working

---

## Risk Management

### High-Risk Items
1. **Price calculation mismatch** → Server-side validation mandatory
2. **Cart data loss on migration** → Migration script + backup
3. **UI regression** → Visual regression tests
4. **Performance degradation** → Load testing before production

### Mitigation
- Feature flags for gradual rollout
- Parallel run (old + new) for critical flows
- Database backups before migrations
- Rollback plan documented

---

## Success Criteria

### Phase Completion
- [ ] All existing routes working
- [ ] All existing features functional
- [ ] UI/UX visually identical
- [ ] Backend tests passing (80%+ coverage)
- [ ] E2E tests covering checkout flow
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Documentation complete

### Production Readiness
- [ ] SSL configured
- [ ] Database backups automated
- [ ] Monitoring alerts active
- [ ] Error tracking configured
- [ ] Rate limiting tested
- [ ] Load testing completed

---

## Timeline Summary

| Phase | Duration | Focus |
|---|---|---|
| 1. Audit | 1 day | Documentation ✅ |
| 2. Backend Foundation | 2 weeks | Architecture, DB, Auth |
| 3. Business Features | 2 weeks | API endpoints |
| 4. Frontend Migration | 2 weeks | Next.js, API integration |
| 5. Advanced Features | 1 week | Checkout, Swatches |
| 6. Testing | 1 week | Tests, Security |
| 7. DevOps | 1 week | Deployment |

**Total**: ~9 weeks for full migration

---

## Next Steps

1. **Approve this migration plan**
2. **Start Phase 2**: Create backend solution
3. **Set up PostgreSQL** (Docker or cloud)
4. **Create initial database schema**
5. **Implement authentication**

---

_Last updated: 2025_
