using Microsoft.EntityFrameworkCore;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Orders;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    // Catalog
    DbSet<Product> Products { get; }
    DbSet<Category> Categories { get; }
    DbSet<Material> Materials { get; }
    DbSet<Color> Colors { get; }
    DbSet<Collection> Collections { get; }

    // Shopping
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Wishlist> Wishlists { get; }

    // Orders
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
