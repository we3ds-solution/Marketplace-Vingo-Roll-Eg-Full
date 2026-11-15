using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.ToTable("wishlists");

        builder.HasKey(w => w.Id);

        // One wishlist per user (nullable for guests)
        builder.HasIndex(w => w.UserId)
            .IsUnique()
            .HasFilter("user_id IS NOT NULL");

        // One wishlist per guest session (nullable for signed-in users)
        builder.HasIndex(w => w.SessionId)
            .IsUnique()
            .HasFilter("session_id IS NOT NULL");

        // Relationships
        builder.HasMany(w => w.Items)
            .WithOne()
            .HasForeignKey(wi => wi.WishlistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(w => w.DomainEvents);
    }
}
