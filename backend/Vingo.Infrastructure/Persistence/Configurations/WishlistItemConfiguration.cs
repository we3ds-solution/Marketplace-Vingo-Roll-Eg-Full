using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("wishlist_items");

        builder.HasKey(wi => wi.Id);

        // Prevent duplicate products in same wishlist
        builder.HasIndex(wi => new { wi.WishlistId, wi.ProductId })
            .IsUnique();

        builder.Ignore(wi => wi.DomainEvents);
    }
}
