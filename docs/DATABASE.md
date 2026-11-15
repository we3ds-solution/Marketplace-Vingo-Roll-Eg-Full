# 🗄️ Database Design - Vingo Roll

## Overview

PostgreSQL database with Entity Framework Core, designed for:

- E-commerce transactions (orders, payments)
- Product catalog with variants (materials, colors, sizes)
- User management and authentication
- Content management (inspiration, FAQs)
- Service requests (swatches, quotes, consultations)

---

## Schema Design

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │────────>│  Addresses   │         │   Roles     │
│             │         │              │         │             │
└──────┬──────┘         └──────────────┘         └──────┬──────┘
       │                                                 │
       │                ┌──────────────┐                │
       └───────────────>│  UserRoles   │<───────────────┘
       │                └──────────────┘
       │
       │                ┌──────────────┐
       ├───────────────>│    Carts     │
       │                └──────┬───────┘
       │                       │
       │                       v
       │                ┌──────────────┐         ┌──────────────┐
       │                │  CartItems   │────────>│   Products   │
       │                └──────────────┘         │              │
       │                                         └──────┬───────┘
       │                ┌──────────────┐               │
       ├───────────────>│  Wishlists   │               │
       │                └──────┬───────┘               │
       │                       │                       │
       │                       v                       │
       │                ┌──────────────┐               │
       │                │WishlistItems │───────────────┘
       │                └──────────────┘               │
       │                                               │
       │                ┌──────────────┐               │
       └───────────────>│    Orders    │               │
                        └──────┬───────┘               │
                               │                       │
                               v                       │
                        ┌──────────────┐               │
                        │  OrderItems  │───────────────┘
                        └──────────────┘
```

---

## Tables

### Identity Domain

#### Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    INDEX idx_users_email (email)
);
```

#### Addresses

```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'shipping', 'billing'
    full_name VARCHAR(200) NOT NULL,
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'US',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_addresses_user (user_id),
    INDEX idx_addresses_default (user_id, is_default)
);
```

#### Roles & UserRoles

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (user_id, role_id)
);

-- Default roles
INSERT INTO roles (name) VALUES
    ('Admin'),
    ('Customer'),
    ('Guest');
```

#### RefreshTokens

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    replaced_by_token VARCHAR(500),

    INDEX idx_refresh_tokens_user (user_id),
    INDEX idx_refresh_tokens_token (token),
    INDEX idx_refresh_tokens_expiry (expires_at)
);
```

---

### Catalog Domain

#### Categories

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent (parent_id)
);
```

#### Products

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    base_price DECIMAL(18, 2) NOT NULL,
    compare_at_price DECIMAL(18, 2),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Characteristics
    light_control VARCHAR(50), -- 'sheer', 'light-filtering', 'blackout'

    -- Flags
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- SEO
    meta_title VARCHAR(200),
    meta_description TEXT,

    -- Stats
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    view_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    INDEX idx_products_slug (slug),
    INDEX idx_products_category (category_id),
    INDEX idx_products_featured (is_featured),
    INDEX idx_products_bestseller (is_bestseller),
    INDEX idx_products_price (base_price),
    FULLTEXT INDEX idx_products_search (name, short_description)
);
```

#### ProductImages

```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,

    INDEX idx_product_images_product (product_id)
);
```

#### Materials

```sql
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    tier VARCHAR(50), -- 'essential', 'signature', 'couture'
    price_delta DECIMAL(18, 2) DEFAULT 0,
    description TEXT,
    swatch_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,

    INDEX idx_materials_slug (slug),
    INDEX idx_materials_tier (tier)
);
```

#### Colors

```sql
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    hex_code VARCHAR(7) NOT NULL, -- #FFFFFF
    family VARCHAR(50), -- 'Ivory', 'Neutral', 'Warm', 'Cool', etc.
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_colors_family (family)
);
```

#### ProductMaterials (Many-to-Many)

```sql
CREATE TABLE product_materials (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,

    PRIMARY KEY (product_id, material_id)
);
```

#### ProductColors (Many-to-Many)

```sql
CREATE TABLE product_colors (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,

    PRIMARY KEY (product_id, color_id)
);
```

#### Collections

```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_collections_slug (slug)
);
```

#### ProductCollections

```sql
CREATE TABLE product_collections (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    sort_order INT DEFAULT 0,

    PRIMARY KEY (product_id, collection_id)
);
```

#### ProductRooms (Taxonomy)

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0
);

CREATE TABLE product_rooms (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,

    PRIMARY KEY (product_id, room_id)
);
```

---

### Shopping Domain

#### Carts

```sql
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    INDEX idx_carts_user (user_id),
    INDEX idx_carts_session (session_id),
    UNIQUE INDEX idx_carts_user_unique (user_id) WHERE user_id IS NOT NULL
);
```

#### CartItems

```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Selected options
    material_id UUID REFERENCES materials(id),
    color_id UUID REFERENCES colors(id),
    width_inches DECIMAL(5, 2),
    height_inches DECIMAL(5, 2),

    quantity INT NOT NULL CHECK (quantity > 0 AND quantity <= 20),
    unit_price DECIMAL(18, 2) NOT NULL, -- Snapshot at add time

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_product (product_id)
);
```

#### Wishlists

```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_wishlists_user (user_id)
);
```

#### WishlistItems

```sql
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_wishlist_items_wishlist (wishlist_id),
    UNIQUE INDEX idx_wishlist_items_unique (wishlist_id, product_id)
);
```

---

### Orders Domain

#### Orders

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-2025-000001
    user_id UUID NOT NULL REFERENCES users(id),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'

    -- Pricing
    subtotal DECIMAL(18, 2) NOT NULL,
    shipping_cost DECIMAL(18, 2) DEFAULT 0,
    tax_amount DECIMAL(18, 2) DEFAULT 0,
    discount_amount DECIMAL(18, 2) DEFAULT 0,
    total_amount DECIMAL(18, 2) NOT NULL,

    -- Addresses (denormalized snapshots)
    shipping_address_id UUID REFERENCES addresses(id),
    billing_address_id UUID REFERENCES addresses(id),

    -- Shipping
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,

    -- Payment
    payment_method VARCHAR(50), -- 'credit_card', 'paypal', etc.

    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    INDEX idx_orders_user (user_id),
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at)
);
```

#### OrderItems

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),

    -- Snapshot of product details at time of order
    product_name VARCHAR(300) NOT NULL,
    product_slug VARCHAR(200) NOT NULL,
    material_name VARCHAR(200),
    color_name VARCHAR(100),
    width_inches DECIMAL(5, 2),
    height_inches DECIMAL(5, 2),

    quantity INT NOT NULL,
    unit_price DECIMAL(18, 2) NOT NULL,
    total_price DECIMAL(18, 2) NOT NULL,

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);
```

#### OrderStatusHistory

```sql
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    INDEX idx_order_history_order (order_id),
    INDEX idx_order_history_created (created_at)
);
```

#### OrderAddresses (Denormalized Snapshots)

```sql
CREATE TABLE order_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'shipping', 'billing'
    full_name VARCHAR(200) NOT NULL,
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL,
    phone VARCHAR(20),

    INDEX idx_order_addresses_order (order_id)
);
```

---

### Payments Domain

#### Payments

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(18, 2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'credit_card', 'paypal', 'stripe'
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id VARCHAR(255), -- External payment gateway ID
    gateway_response TEXT, -- JSON response from gateway
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status)
);
```

#### PaymentTransactions (Audit Trail)

```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'authorize', 'capture', 'refund', 'void'
    amount DECIMAL(18, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_payment_transactions_payment (payment_id)
);
```

---

### Marketing & Services Domain

#### SwatchRequests

```sql
CREATE TABLE swatch_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(320) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),

    -- Shipping address
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'US',

    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'cancelled'
    tracking_number VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,

    INDEX idx_swatch_requests_email (email),
    INDEX idx_swatch_requests_status (status)
);
```

#### SwatchRequestItems

```sql
CREATE TABLE swatch_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES swatch_requests(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    color_id UUID REFERENCES colors(id),

    INDEX idx_swatch_items_request (request_id)
);
```

#### QuoteRequests

```sql
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(320) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),

    -- Project details
    project_description TEXT NOT NULL,
    room_type VARCHAR(100),
    window_count INT,
    budget_range VARCHAR(50),

    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'quoted', 'converted', 'declined'

    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP,

    INDEX idx_quote_requests_email (email),
    INDEX idx_quote_requests_status (status)
);
```

#### Consultations

```sql
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(320) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    service_type VARCHAR(100) NOT NULL, -- 'design', 'measuring', 'installation'
    preferred_date DATE,
    preferred_time TIME,
    notes TEXT,

    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scheduled', 'completed', 'cancelled'
    scheduled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_consultations_email (email),
    INDEX idx_consultations_status (status)
);
```

#### Promotions

```sql
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(18, 2) NOT NULL,
    minimum_order_amount DECIMAL(18, 2),

    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    usage_limit INT, -- NULL = unlimited
    usage_count INT DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_promotions_code (code),
    INDEX idx_promotions_dates (start_date, end_date)
);
```

---

### Content Domain

#### Reviews

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id), -- NULL if not verified purchase

    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,

    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,

    helpful_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,

    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_approved (is_approved, created_at)
);
```

#### InspirationPosts

```sql
CREATE TABLE inspiration_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(300) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url VARCHAR(500),

    category VARCHAR(100), -- 'living-room', 'bedroom', etc.

    view_count INT DEFAULT 0,

    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    INDEX idx_inspiration_slug (slug),
    INDEX idx_inspiration_category (category),
    INDEX idx_inspiration_published (is_published, published_at)
);
```

#### FAQs

```sql
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100), -- 'ordering', 'shipping', 'products', etc.
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,

    INDEX idx_faqs_category (category)
);
```

#### Testimonials

```sql
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    product_id UUID REFERENCES products(id),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_testimonials_featured (is_featured)
);
```

---

### System Domain

#### AuditLogs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    entity_type VARCHAR(100) NOT NULL, -- 'Product', 'Order', etc.
    entity_id UUID NOT NULL,
    changes JSONB, -- Before/after snapshot
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_created (created_at)
);
```

#### Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'order_update', 'promotion', 'system'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_unread (user_id, is_read, created_at)
);
```

---

## Indexes Summary

### Performance-Critical Indexes

```sql
-- Products
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || short_description));
CREATE INDEX idx_products_category_price ON products (category_id, base_price);
CREATE INDEX idx_products_featured_active ON products (is_featured, is_active);

-- Orders
CREATE INDEX idx_orders_user_status ON orders (user_id, status);
CREATE INDEX idx_orders_created_desc ON orders (created_at DESC);

-- Cart
CREATE INDEX idx_cart_items_cart_product ON cart_items (cart_id, product_id);

-- Reviews
CREATE INDEX idx_reviews_product_approved ON reviews (product_id, is_approved, created_at DESC);
```

---

## Seed Data Script

### Sample Data

```sql
-- Categories
INSERT INTO categories (id, name, slug, description) VALUES
    ('cat-curtains', 'Curtains & Drapes', 'curtains', 'Premium made-to-measure curtains'),
    ('cat-sheers', 'Sheer Curtains', 'sheers', 'Light-filtering voile panels'),
    ('cat-blackout', 'Blackout Curtains', 'blackout', 'Complete light blocking');

-- Materials
INSERT INTO materials (name, slug, tier, price_delta) VALUES
    ('Belgian Linen', 'belgian-linen', 'essential', 0),
    ('Brushed Cotton', 'brushed-cotton', 'essential', 20),
    ('Wool Blend', 'wool-blend', 'signature', 65),
    ('Silk Velvet', 'silk-velvet', 'couture', 140);

-- Colors
INSERT INTO colors (name, hex_code, family) VALUES
    ('Raw Ivory', '#EFE6D6', 'Ivory'),
    ('Oat', '#DCCDB4', 'Neutral'),
    ('Clay', '#B08A6B', 'Warm'),
    ('Walnut', '#6B4B34', 'Brown'),
    ('Dry Sage', '#9AA189', 'Green');

-- Rooms
INSERT INTO rooms (name, slug) VALUES
    ('Living Room', 'living-room'),
    ('Bedroom', 'bedroom'),
    ('Dining Room', 'dining-room'),
    ('Home Office', 'home-office'),
    ('Kids Room', 'kids-room');

-- Default Admin User
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
    ('admin@vingoroll.com', '$2a$11$...', 'Admin', 'User');

INSERT INTO roles (name) VALUES ('Admin'), ('Customer');
```

---

## Migration Strategy

### From Mock Data to Database

1. **Extract current mock data**
   - Products from `src/data/products.ts`
   - Categories from `src/data/categories.ts`
   - Materials, colors from product definitions

2. **Create seed migration**

   ```bash
   dotnet ef migrations add SeedInitialData
   ```

3. **Seed script template**

   ```csharp
   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
       modelBuilder.Entity<Category>().HasData(
           new Category { Id = Guid.Parse("..."), Name = "Curtains", Slug = "curtains" },
           // ...
       );

       modelBuilder.Entity<Product>().HasData(
           // Migrate from products.ts
       );
   }
   ```

4. **Image migration**
   - Copy `/public/images/*` to cloud storage (S3/Azure Blob)
   - Update URLs in database

---

## Backup & Recovery

### Daily Backups

```bash
pg_dump -h localhost -U postgres vingo_prod > backup_$(date +%Y%m%d).sql
```

### Point-in-Time Recovery

Enable WAL archiving in PostgreSQL config

---

## Performance Optimization

### Query Optimization

- Use `EXPLAIN ANALYZE` for slow queries
- Add indexes based on actual query patterns
- Use materialized views for complex aggregations

### Connection Pooling

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=vingo;Username=postgres;Password=***;Minimum Pool Size=10;Maximum Pool Size=100;"
}
```

---

## Security

### Row-Level Security (Future)

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_user_policy ON orders
    FOR SELECT
    USING (user_id = current_user_id() OR current_user_role() = 'Admin');
```

### Encryption at Rest

Enable PostgreSQL encryption for sensitive columns (passwords, payment info)

---

## Monitoring

### Health Checks

- Connection test
- Query response time
- Disk space monitoring

### Alerts

- Slow queries (> 1 second)
- Connection pool exhaustion
- Disk usage > 80%

---

_Last updated: 2025_
