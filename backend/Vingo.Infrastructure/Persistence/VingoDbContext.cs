using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Content;
using Vingo.Domain.Entities.Marketing;
using Vingo.Domain.Entities.Orders;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Infrastructure.Persistence;

public class VingoDbContext : IdentityDbContext<Identity.VingoUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public VingoDbContext(DbContextOptions<VingoDbContext> options) : base(options)
    {
    }

    // Catalog
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<Color> Colors => Set<Color>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Size> Sizes => Set<Size>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Need> Needs => Set<Need>();
    public DbSet<Review> Reviews => Set<Review>();

    // Content
    public DbSet<InspirationStory> InspirationStories => Set<InspirationStory>();
    public DbSet<InspirationSection> InspirationSections => Set<InspirationSection>();

    // Shopping
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

    // Orders
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistory => Set<OrderStatusHistory>();

    // Marketing
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();

    // Identity / Auth
    public DbSet<Identity.RefreshToken> RefreshTokens => Set<Identity.RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set timestamps automatically
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity &&
                       (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Modified)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
