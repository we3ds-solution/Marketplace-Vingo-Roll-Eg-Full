# Vingo Roll Backend - ASP.NET Core Clean Architecture

Enterprise-grade backend API for the Vingo Roll marketplace platform.

## 🏗️ Architecture

Built using **Clean Architecture** principles with strict dependency rules:

```
Domain (Core Business Logic)
  ↑
Application (Use Cases)
  ↑
Infrastructure (Data Access, External Services)
  ↑
WebAPI (HTTP Endpoints)
```

## 📦 Projects

### Vingo.Domain
**Pure business logic - No dependencies**

- **Entities**: Product, Category, Material, Color, Cart, Order, etc.
- **Value Objects**: Money (with currency support)
- **Domain Events**: Event infrastructure ready
- **Business Rules**: Pricing, validation, workflow logic

### Vingo.Application
**Use cases and application business rules**

- CQRS structure (Commands/Queries/Handlers)
- DTOs and mapping (Mapster)
- Validation (FluentValidation)
- Service interfaces

### Vingo.Infrastructure
**External concerns implementation**

- **Database**: EF Core + PostgreSQL
- **Persistence**: DbContext, Configurations, Repositories
- **Identity**: User management, JWT tokens
- **Services**: Email, file storage, caching

### Vingo.WebAPI
**HTTP entry point**

- Controllers (RESTful APIs)
- Authentication/Authorization
- Middleware (logging, errors, CORS)
- OpenAPI documentation (Scalar)
- Health checks

## 🗄️ Database

**PostgreSQL** with Entity Framework Core

**Connection**: `db80065.public.databaseasp.net`

### Schema Overview
- **13 core tables**: Products, Categories, Orders, Cart, etc.
- **3 junction tables**: Product relationships (materials, colors, collections)
- **Indexes**: Optimized for common queries
- **Constraints**: Referential integrity, unique constraints

## 🚀 Getting Started

### Prerequisites
- .NET 9.0 SDK
- PostgreSQL (or use remote connection)
- dotnet-ef tools (for migrations)

### Installation

```bash
# Restore dependencies
dotnet restore

# Build solution
dotnet build

# Install EF Core tools (if not installed)
dotnet tool install --global dotnet-ef
```

### Run API

```bash
cd Vingo.WebAPI
dotnet run

# API will be available at:
# - http://localhost:5000
# - https://localhost:5001
```

### Access Documentation

```
# OpenAPI Spec
http://localhost:5000/openapi/v1.json

# Interactive API Docs (Scalar)
http://localhost:5000/scalar/v1

# Health Check
http://localhost:5000/health
http://localhost:5000/api/v1/health/db
```

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/Vingo.UnitTests
dotnet test tests/Vingo.IntegrationTests
dotnet test tests/Vingo.ArchitectureTests
```

## 🔧 Database Migrations

### Create Migration
```bash
cd Vingo.Infrastructure
dotnet ef migrations add MigrationName --startup-project ../Vingo.WebAPI
```

### Apply Migration
```bash
dotnet ef database update --startup-project ../Vingo.WebAPI
```

### View Migration Status
```bash
dotnet ef migrations list --startup-project ../Vingo.WebAPI
```

## 📝 Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=db80065.public.databaseasp.net;Port=5432;Database=db80065;User Id=db80065;Password=***;Ssl Mode=Prefer;"
  },
  "JwtSettings": {
    "Secret": "Your-Secret-Key-Here",
    "ExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  },
  "CorsSettings": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

### Environment Variables (Optional)

```bash
# Database
export ConnectionStrings__DefaultConnection="Server=...;Database=..."

# JWT
export JwtSettings__Secret="your-secret-key"

# CORS
export CorsSettings__AllowedOrigins__0="http://localhost:3000"
```

## 🛡️ Security

### Implemented
- ✅ Server-side price recalculation (never trust client)
- ✅ Order product snapshots (audit trail)
- ✅ Quantity validation (1-20 per item)
- ✅ SQL injection prevention (parameterized queries)
- ✅ SSL/TLS for database connection
- ✅ CORS configuration

### To Implement (Phase 3)
- [ ] JWT authentication
- [ ] Role-based authorization
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Password hashing (bcrypt)
- [ ] Refresh token rotation

## 🎯 API Endpoints (Current)

### Health & Status
```
GET  /health                    → ASP.NET health check
GET  /api/v1/health            → API status
GET  /api/v1/health/db         → Database connectivity
```

### Coming in Phase 3
```
# Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

# Products
GET  /api/v1/products
GET  /api/v1/products/{slug}
GET  /api/v1/products/featured

# Cart
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{id}
DELETE /api/v1/cart/items/{id}

# Orders
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/{id}
```

## 🏛️ Design Patterns

- **Clean Architecture**: Dependency inversion, separation of concerns
- **Domain-Driven Design**: Rich domain models, value objects
- **CQRS**: Command/Query separation (structure ready)
- **Repository Pattern**: Data access abstraction (ready)
- **Value Objects**: Money for immutable price handling
- **Domain Events**: Decoupled business logic

## 📚 Business Logic Highlights

### Product Pricing
```csharp
finalPrice = basePrice + materialDelta + sizeDelta
```

### Cart Workflow
```
Guest Cart (session) → Login → Merge with User Cart
```

### Order Creation
```
1. Validate cart items
2. Recalculate all prices (server-side)
3. Calculate shipping (free > $200)
4. Calculate tax (8%)
5. Create order with snapshots
6. Add status history
7. Clear cart
```

### Status Transitions
```
Pending → Confirmed → Processing → Shipped → Delivered
                    ↓
                Cancelled
```

## 🧩 Domain Entities

### Catalog
- `Product` - Main product with variants and pricing
- `Category` - Hierarchical product categories
- `Material` - Fabric options with price deltas
- `Color` - Color variants with hex codes
- `Collection` - Curated product groups
- `ProductImage` - Product gallery images

### Shopping
- `Cart` - Guest and authenticated shopping carts
- `CartItem` - Line items with options
- `Wishlist` - Saved products per user
- `WishlistItem` - Wishlist entries

### Orders
- `Order` - Customer orders with pricing breakdown
- `OrderItem` - Order line items (product snapshots)
- `OrderStatusHistory` - Audit trail for status changes

## 📦 NuGet Packages

### Core
- `Npgsql.EntityFrameworkCore.PostgreSQL` 9.0.2
- `Microsoft.EntityFrameworkCore.Design` 9.0.0
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 11.0.0

### Application
- `FluentValidation` + DI Extensions
- `Mapster` (object mapping)

### WebAPI
- `Serilog.AspNetCore` + Console sink
- `Scalar.AspNetCore` (API docs)
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `AspNetCore.HealthChecks.NpgSql`

### Testing
- `xUnit`
- `NSubstitute` (mocking)
- `Shouldly` (assertions)
- `Testcontainers.PostgreSql` (integration tests)

## 🔍 Code Quality

### Static Analysis
```bash
# Run code analysis
dotnet build /p:TreatWarningsAsErrors=true

# Format code
dotnet format
```

### Architecture Tests
```bash
# Verify Clean Architecture rules
dotnet test tests/Vingo.ArchitectureTests
```

## 📈 Performance

### Implemented
- ✅ Connection pooling (EF Core default)
- ✅ AsNoTracking for read-only queries
- ✅ Indexes on frequently queried fields
- ✅ Eager loading for related entities

### To Implement
- [ ] Response caching
- [ ] Redis distributed cache
- [ ] Database query optimization
- [ ] Pagination for large result sets

## 🐳 Docker Support

### Dockerfile (coming soon)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
# Build steps...
```

### Docker Compose
```yaml
services:
  api:
    build: ./backend
    ports:
      - "5000:8080"
    environment:
      - ConnectionStrings__DefaultConnection=...
```

## 🚀 Deployment

### Production Checklist
- [ ] Update connection string
- [ ] Set secure JWT secret
- [ ] Configure CORS for production origin
- [ ] Enable HTTPS only
- [ ] Set up logging aggregation
- [ ] Configure health check monitoring
- [ ] Apply database migrations
- [ ] Set up backup strategy

## 📞 Support

**Developer**: we3ds-company  
**Email**: we3ds.solution@gmail.com  

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using Clean Architecture and DDD principles**
