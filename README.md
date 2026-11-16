# 🪟 Vingo Roll Studio - Enterprise Marketplace

Premium made-to-measure curtains & window treatments platform.

**Architecture**: Next.js + ASP.NET Core Clean Architecture + PostgreSQL

---

## 🏗️ Project Structure

```
Marketplace-Vingo-Roll-Eg-Full/
├── frontend/           # Next.js 15 + React 19
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities & API clients
│   ├── stores/        # Zustand state
│   └── package.json   # Frontend dependencies (pnpm)
│
├── backend/           # ASP.NET Core Web API
│   ├── Vingo.Domain/
│   ├── Vingo.Application/
│   ├── Vingo.Infrastructure/
│   └── Vingo.WebAPI/
│
├── docs/              # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API.md
│
├── docker/            # Deployment assets
```

---

## 🚀 Quick Start

### Frontend (Next.js)

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

### Backend (ASP.NET Core)

```bash
cd backend
dotnet restore
dotnet run --project Vingo.WebAPI
# → http://localhost:5000
```

### Full Stack

```bash
# Terminal 1 - Backend
cd backend && dotnet run --project Vingo.WebAPI

# Terminal 2 - Frontend
cd frontend && pnpm dev
```

---

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios

### Backend
- **Framework**: ASP.NET Core 9.0
- **Architecture**: Clean Architecture + CQRS
- **Database**: PostgreSQL + EF Core
- **Auth**: JWT + ASP.NET Identity
- **Logging**: Serilog
- **Docs**: OpenAPI + Scalar

---

## 🗄️ Database

**Connection**: `db80065.public.databaseasp.net`

```bash
# Apply migrations
cd backend/Vingo.Infrastructure
dotnet ef database update --startup-project ../Vingo.WebAPI
```

---

## 📝 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Products
- `GET /products` - List products (paginated)
- `GET /products/featured` - Featured products
- `GET /products/bestsellers` - Bestseller products

### Categories
- `GET /categories` - List all categories

### Cart
- `POST /cart/items` - Add to cart (guest/user)
- `GET /cart` - Get current cart

### Orders
- `POST /orders` - Create order
- `GET /orders` - User's orders

### Materials & Colors
- `GET /materials` - Available materials
- `GET /colors` - Available colors

### Health
- `GET /health` - API health
- `GET /health/db` - Database status

**Interactive Docs**: http://localhost:5000/scalar/v1

---

## 🎯 Features

### Implemented ✅
- Product catalog with filtering
- Guest cart with session cookies
- Server-side price recalculation
- Category browsing
- Materials & colors selection
- Health monitoring
- OpenAPI documentation

### In Progress 🚧
- User authentication (JWT)
- Checkout flow
- Order management
- Product reviews
- Wishlist persistence

---

## 🔐 Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`backend/Vingo.WebAPI/appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=db80065.public.databaseasp.net;..."
  }
}
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
dotnet test

# Frontend tests (coming soon)
cd frontend
pnpm test
```

---

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - System design & patterns
- [Database Schema](./docs/DATABASE.md) - PostgreSQL schema
- [Migration Plan](./MIGRATION_PLAN.md) - Full migration roadmap
- [Progress Tracker](./PROGRESS.md) - Current status

---

## 🤝 Development

### Commit Convention
```
feat(scope): description
fix(scope): description
docs: description
```

### Git Config
```bash
git config user.name "we3ds-company"
git config user.email "we3ds.solution@gmail.com"
```

---

## 📊 Migration Status

**Overall Progress**: 70% Complete

| Phase | Status |
|-------|--------|
| Backend Foundation | ✅ 100% |
| API Endpoints | ✅ 100% |
| Frontend Setup | ✅ 100% |
| Component Migration | 🚧 60% |
| Database & Seeds | ⏳ Pending |
| Full Integration | ⏳ Pending |

---

## 📞 Support

**Developer**: we3ds-company  
**Email**: we3ds.solution@gmail.com  
**Database**: db80065.public.databaseasp.net

---

## 📄 License

Proprietary - All rights reserved

---

**Built with Clean Architecture & DDD principles** 🏛️
