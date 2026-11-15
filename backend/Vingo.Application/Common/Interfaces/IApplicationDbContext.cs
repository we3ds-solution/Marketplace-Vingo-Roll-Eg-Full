using Microsoft.EntityFrameworkCore;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Content;
using Vingo.Domain.Entities.Marketing;
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
    DbSet<ProductImage> ProductImages { get; }
    DbSet<Size> Sizes { get; }
    DbSet<Room> Rooms { get; }
    DbSet<Need> Needs { get; }
    DbSet<Review> Reviews { get; }

    // Content
    DbSet<InspirationStory> InspirationStories { get; }
    DbSet<InspirationSection> InspirationSections { get; }

    // Shopping
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Wishlist> Wishlists { get; }
    DbSet<WishlistItem> WishlistItems { get; }

    // Orders
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderStatusHistory> OrderStatusHistory { get; }

    // Marketing
    DbSet<Lead> Leads { get; }
    DbSet<NewsletterSubscriber> NewsletterSubscribers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
