# 🏛️ Vingo Roll - System Architecture

## Overview

Vingo Roll is an enterprise marketplace platform for made-to-measure window treatments, built with:
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: ASP.NET Core (.NET 10) with Clean Architecture
- **Database**: PostgreSQL with Entity Framework Core
- **Cache**: Redis (distributed cache)
- **Auth**: JWT + Refresh Tokens

---

## Architecture Principles

### Clean Architecture
We follow Uncle Bob's Clean Architecture with strict dependency rules:
```
Domain ← Application ← Infrastructure
                    ↑
                  WebAPI
```

**Rules**:
- Domain has no dependencies
- Application depends only on Domain
- Infrastructure implements Application interfaces
- WebAPI orchestrates and handles HTTP

### CQRS (Command Query Responsibility Segregation)
- **Commands**: Mutate state (CreateOrder, AddToCart)
- **Queries**: Read state (GetProducts, GetOrder)
- Separate models for reads vs writes where beneficial

### Domain-Driven Design (DDD)
- Aggregates with clear boundaries
- Domain events for side effects
- Value objects for immutability
- Rich domain models (not anemic)

---

## Layer Responsibilities

### 1. Vingo.Domain (Core)

**Purpose**: Business logic, entities, domain rules

**Contains**:
```
Entities/
├── Catalog/
│   ├── Product.cs
│   ├── Category.cs
│   ├── Material.cs
│   ├── Color.cs
│   └── Collection.cs
├── Identity/
│   ├── User.cs
│   └── Address.cs
├── Shopping/
│   ├── Cart.cs
│   ├── CartItem.cs
│   ├── Wishlist.cs
│   └── WishlistItem.cs
├── Orders/
│   ├── Order.cs
│   ├── OrderItem.cs
│   └── OrderStatusHistory.cs
└── Payments/
    └── Payment.cs

ValueObjects/
├── Money.cs
├── Dimensions.cs
├── EmailAddress.cs
└── PhoneNumber.cs

Events/
├── OrderPlacedEvent.cs
├── ProductCreatedEvent.cs
└── ReviewSubmittedEvent.cs

Exceptions/
├── DomainException.cs
├── ProductNotFoundException.cs
└── InsufficientStockException.cs

Enums/
├── OrderStatus.cs
├── PaymentStatus.cs
├── LightControlType.cs
└── MaterialTier.cs
```

**No dependencies** - Pure C# + domain logic

**Example Entity**:
```csharp
public class Product : BaseEntity
{
    public string Slug { get; private set; }
    public string Name { get; private set; }
    public Money BasePrice { get; private set; }
    public Money? CompareAtPrice { get; private set; }
    
    private readonly List<ProductMaterial> _materials = new();
    public IReadOnlyCollection<ProductMaterial> Materials => _materials;
    
    public void UpdatePrice(Money newPrice)
    {
        if (newPrice.Amount <= 0)
            throw new DomainException("Price must be positive");
            
        BasePrice = newPrice;
        RaiseDomainEvent(new ProductPriceChangedEvent(Id, newPrice));
    }
    
    public Money CalculateFinalPrice(MaterialOption material, SizeOption size)
    {
        var materialDelta = material.PriceDelta;
        var sizeDelta = size.PriceDelta;
        return new Money(BasePrice.Amount + materialDelta + sizeDelta);
    }
}
```

---

### 2. Vingo.Application (Use Cases)

**Purpose**: Application business logic, orchestration

**Contains**:
```
Features/
├── Catalog/
│   ├── Queries/
│   │   ├── GetProducts/
│   │   │   ├── GetProductsQuery.cs
│   │   │   ├── GetProductsHandler.cs
│   │   │   └── ProductDto.cs
│   │   └── GetProductBySlug/
│   │       ├── GetProductBySlugQuery.cs
│   │       └── GetProductBySlugHandler.cs
│   └── Commands/
│       └── CreateProduct/
│           ├── CreateProductCommand.cs
│           ├── CreateProductHandler.cs
│           └── CreateProductValidator.cs
├── Cart/
│   ├── Commands/
│   │   ├── AddToCart/
│   │   ├── UpdateCartItem/
│   │   └── RemoveFromCart/
│   └── Queries/
│       └── GetCart/
├── Orders/
│   ├── Commands/
│   │   ├── CreateOrder/
│   │   ├── UpdateOrderStatus/
│   │   └── CancelOrder/
│   └── Queries/
│       └── GetUserOrders/
└── Auth/
    ├── Commands/
    │   ├── Register/
    │   ├── Login/
    │   └── RefreshToken/
    └── Queries/
        └── GetCurrentUser/

Common/
├── Interfaces/
│   ├── IApplicationDbContext.cs
│   ├── IRepository.cs
│   ├── IEmailService.cs
│   └── ICurrentUserService.cs
├── Mappings/
│   └── MappingProfile.cs
├── Behaviors/
│   ├── ValidationBehavior.cs
│   └── LoggingBehavior.cs
└── Exceptions/
    └── ValidationException.cs
```

**Dependencies**: Domain only

**Example Handler**:
```csharp
public class CreateOrderHandler
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPricingService _pricing;
    
    public async Task<OrderDto> Handle(CreateOrderCommand command)
    {
        // 1. Validate user
        var user = await _context.Users.FindAsync(_currentUser.UserId);
        if (user == null) throw new UnauthorizedException();
        
        // 2. Get cart items
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == user.Id);
            
        if (cart == null || !cart.Items.Any())
            throw new ValidationException("Cart is empty");
        
        // 3. Recalculate prices (NEVER trust client)
        var orderItems = new List<OrderItem>();
        foreach (var cartItem in cart.Items)
        {
            var product = await _context.Products.FindAsync(cartItem.ProductId);
            var unitPrice = _pricing.CalculatePrice(product, cartItem.Options);
            
            orderItems.Add(new OrderItem(
                product.Id,
                cartItem.Quantity,
                unitPrice
            ));
        }
        
        // 4. Create order aggregate
        var order = Order.Create(
            user.Id,
            orderItems,
            command.ShippingAddress,
            command.PaymentMethod
        );
        
        // 5. Persist
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        
        // 6. Clear cart
        cart.Clear();
        await _context.SaveChangesAsync();
        
        return order.ToDto();
    }
}
```

---

### 3. Vingo.Infrastructure (Implementation)

**Purpose**: External concerns (DB, I/O, 3rd party)

**Contains**:
```
Persistence/
├── VingoDbContext.cs
├── Configurations/
│   ├── ProductConfiguration.cs
│   ├── OrderConfiguration.cs
│   └── UserConfiguration.cs
├── Repositories/
│   ├── ProductRepository.cs
│   └── OrderRepository.cs
├── Migrations/
│   └── 20250101000000_InitialCreate.cs
└── Interceptors/
    └── AuditableEntityInterceptor.cs

Identity/
├── ApplicationUser.cs (extends IdentityUser)
├── ApplicationRole.cs
├── JwtTokenService.cs
├── RefreshTokenService.cs
└── PasswordHasher.cs

Services/
├── EmailService.cs
├── FileStorageService.cs
└── DateTimeService.cs

External/
├── PaymentGateway/
└── ShippingProviders/
```

**Dependencies**: Application, Domain, external packages

**Example Configuration**:
```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Slug)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.HasIndex(p => p.Slug)
            .IsUnique();
            
        builder.OwnsOne(p => p.BasePrice, price =>
        {
            price.Property(m => m.Amount)
                .HasColumnName("BasePrice")
                .HasPrecision(18, 2)
                .IsRequired();
                
            price.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        });
        
        builder.HasMany(p => p.Images)
            .WithOne()
            .HasForeignKey("ProductId")
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(p => p.Materials)
            .WithMany(m => m.Products)
            .UsingEntity<Dictionary<string, object>>(
                "ProductMaterials",
                j => j.HasOne<Material>().WithMany().HasForeignKey("MaterialId"),
                j => j.HasOne<Product>().WithMany().HasForeignKey("ProductId")
            );
    }
}
```

**DbContext**:
```csharp
public class VingoDbContext : DbContext, IApplicationDbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Cart> Carts => Set<Cart>();
    // ... more DbSets
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // Audit trail
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = DateTime.UtcNow;
                
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        
        return await base.SaveChangesAsync(ct);
    }
}
```

---

### 4. Vingo.WebAPI (HTTP Layer)

**Purpose**: HTTP endpoints, middleware, DI

**Contains**:
```
Controllers/
├── AuthController.cs
├── ProductsController.cs
├── CategoriesController.cs
├── CartController.cs
├── OrdersController.cs
├── SwatchesController.cs
└── ReviewsController.cs

Middleware/
├── GlobalExceptionHandler.cs
├── RequestLoggingMiddleware.cs
└── RateLimitingMiddleware.cs

Filters/
├── ValidateModelStateAttribute.cs
└── ApiKeyAuthorizationFilter.cs

Configuration/
├── DependencyInjection.cs
├── OpenApiConfiguration.cs
└── CorsConfiguration.cs

Program.cs
appsettings.json
appsettings.Development.json
```

**Example Controller**:
```csharp
[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator; // or direct handler injection
    
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<ProductDto>), 200)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] GetProductsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(ProductDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProduct(string slug)
    {
        var query = new GetProductBySlugQuery(slug);
        var result = await _mediator.Send(query);
        
        if (result == null)
            return NotFound(new { message = $"Product '{slug}' not found" });
            
        return Ok(result);
    }
    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(
            nameof(GetProduct), 
            new { slug = result.Slug }, 
            result
        );
    }
}
```

**Program.cs** (Minimal API style):
```csharp
var builder = WebApplication.CreateBuilder(args);

// Configuration
builder.Services.AddApplicationServices();    // Application layer
builder.Services.AddInfrastructureServices(   // Infrastructure layer
    builder.Configuration
);
builder.Services.AddWebAPIServices();         // WebAPI layer

// Logging
builder.Host.UseSerilog((context, config) => 
    config.ReadFrom.Configuration(context.Configuration)
);

var app = builder.Build();

// Middleware pipeline
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
}

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
```

---

## Data Flow Examples

### Query Flow (Read)
```
Client → ProductsController.GetProducts()
      → GetProductsHandler.Handle()
      → ProductRepository.GetPaginatedAsync()
      → EF Core → PostgreSQL
      ← ProductDto[]
      ← JSON Response
```

### Command Flow (Write)
```
Client → CartController.AddItem(command)
      → ValidateModelState
      → AddToCartHandler.Handle()
      → Cart.AddItem(product)  // Domain logic
      → VingoDbContext.SaveChangesAsync()
      → Audit interceptor
      → PostgreSQL transaction
      ← CartDto
      ← JSON Response
```

### Order Creation Flow
```
Client → OrdersController.CreateOrder(command)
      → [Authorize] check
      → CreateOrderHandler.Handle()
          → Get user cart
          → Recalculate prices (!!!)
          → Order.Create() // Domain aggregate
          → OrderPlacedEvent raised
          → SaveChanges (transaction)
          → Clear cart
          → Event handlers (email, notifications)
      ← OrderDto
      ← 201 Created
```

---

## Security Architecture

### Authentication Flow

**Registration**:
```
POST /api/v1/auth/register
→ Hash password (bcrypt)
→ Create user in Identity
→ Generate JWT + refresh token
→ Store refresh token in DB
→ Set refresh token in HttpOnly cookie
← { accessToken, user }
```

**Login**:
```
POST /api/v1/auth/login
→ Validate credentials
→ Generate JWT (15 min expiry)
→ Generate refresh token (7 days, rotation)
→ Store refresh token
→ Set HttpOnly cookie
← { accessToken, user }
```

**Token Refresh**:
```
POST /api/v1/auth/refresh
→ Read refresh token from cookie
→ Validate token in DB
→ Check expiry, revocation
→ Generate new access token
→ Rotate refresh token
→ Revoke old refresh token
← { accessToken }
```

### Authorization Patterns

**Role-based**:
```csharp
[Authorize(Roles = "Admin")]
public async Task<IActionResult> DeleteProduct(int id)
```

**Policy-based**:
```csharp
[Authorize(Policy = "CanManageOrders")]
public async Task<IActionResult> CancelOrder(string orderId)
```

**Resource ownership**:
```csharp
var order = await _context.Orders.FindAsync(orderId);
if (order.UserId != _currentUser.UserId && !_currentUser.IsAdmin)
    return Forbid();
```

---

## Database Architecture

### Connection Management
- Connection pooling (default)
- Read replicas (future)
- Retry policies for transient failures

### Transaction Strategy
```csharp
await using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    // 1. Update inventory
    await _context.SaveChangesAsync();
    
    // 2. Create order
    await _context.SaveChangesAsync();
    
    // 3. Clear cart
    await _context.SaveChangesAsync();
    
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

### Indexing Strategy
```sql
-- Performance-critical indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
```

---

## Caching Strategy

### Levels

**1. In-Memory Cache** (short-lived, hot data)
```csharp
_memoryCache.GetOrCreateAsync("featured-products", async entry =>
{
    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
    return await _context.Products.Where(p => p.IsFeatured).ToListAsync();
});
```

**2. Distributed Cache** (Redis, shared across instances)
```csharp
await _distributedCache.SetAsync(
    $"product:{slug}",
    JsonSerializer.SerializeToUtf8Bytes(product),
    new DistributedCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
    }
);
```

**3. HTTP Cache Headers** (CDN, browser)
```csharp
[ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "category", "page" })]
public async Task<IActionResult> GetProducts(...)
```

### Cache Invalidation
```csharp
// On product update
await _cache.RemoveAsync($"product:{product.Slug}");
await _cache.RemoveAsync("featured-products");
await _cache.RemoveAsync($"category:{product.CategoryId}");
```

---

## Frontend Architecture (Next.js)

### Project Structure
```
frontend/src/
├── app/                    # App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── shop/
│   ├── product/[slug]/
│   └── ...
├── components/
│   ├── ui/                # Radix UI components
│   ├── layout/            # Header, Footer
│   ├── product/           # ProductCard, ProductGrid
│   └── ...
├── features/              # Feature modules
│   ├── cart/
│   ├── checkout/
│   └── auth/
├── services/              # API clients
│   ├── api.ts             # Axios instance
│   ├── products.ts
│   ├── cart.ts
│   └── orders.ts
├── stores/                # Zustand stores
│   ├── cart-store.ts      # Guest cart
│   ├── ui-store.ts        # UI state
│   └── auth-store.ts      # Auth state
├── hooks/                 # Custom hooks
│   ├── use-cart.ts
│   ├── use-auth.ts
│   └── use-debounce.ts
├── lib/                   # Utilities
│   ├── utils.ts
│   ├── cn.ts              # Class name utility
│   └── validators.ts
└── types/                 # TypeScript types
    ├── product.ts
    ├── cart.ts
    └── order.ts
```

### API Client (Axios)
```typescript
// services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle refresh token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      await refreshToken();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### TanStack Query Setup
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.Node }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Server Component (SSR)
```typescript
// app/product/[slug]/page.tsx
import { getProduct } from '@/services/products';

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  return {
    title: `${product.name} | Vingo Roll`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  
  return (
    <div>
      <ProductDetails product={product} />
      <AddToCartButton productId={product.id} /> {/* Client */}
    </div>
  );
}
```

### Client Component (Interactivity)
```typescript
// components/product/add-to-cart-button.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '@/services/cart';
import { toast } from 'sonner';

export function AddToCartButton({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: (error) => {
      toast.error('Failed to add to cart');
    },
  });
  
  return (
    <button
      onClick={() => mutation.mutate({ productId, quantity: 1 })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

---

## Deployment Architecture

### Local Development
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: vingo_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    ports:
      - "5000:8080"
    environment:
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=vingo_dev;Username=postgres;Password=postgres"
      Redis__Configuration: "redis:6379"
    depends_on:
      - postgres
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production (Placeholder)
```
Load Balancer (HTTPS)
  ↓
Frontend (Next.js)
  ↓
API Gateway / Rate Limiter
  ↓
Backend (ASP.NET Core) [Multiple instances]
  ↓
PostgreSQL (Primary + Read Replicas)
Redis Cluster (Cache + Sessions)
S3 / Azure Blob (Images)
```

---

## Observability

### Logging (Serilog)
```csharp
Log.Information("Order {OrderId} created by user {UserId}", order.Id, userId);
Log.Warning("Product {Slug} out of stock", slug);
Log.Error(ex, "Payment failed for order {OrderId}", orderId);
```

### Health Checks
```
GET /health
→ Database: OK
→ Redis: OK
→ External API: OK
← 200 OK / 503 Service Unavailable
```

### Metrics (Future)
- Request duration
- Error rate
- Active users
- Order conversion rate

---

## Conclusion

This architecture provides:
- ✅ Separation of concerns
- ✅ Testability
- ✅ Scalability
- ✅ Maintainability
- ✅ Security by design
- ✅ Performance optimization

Clean Architecture + CQRS gives us flexibility to evolve each layer independently without breaking contracts.
