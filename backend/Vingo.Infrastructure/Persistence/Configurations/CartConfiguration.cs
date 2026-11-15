using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("carts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.SessionId)
            .HasMaxLength(255);

        // Indexes
        builder.HasIndex(c => c.UserId)
            .IsUnique()
            .HasFilter("user_id IS NOT NULL"); // Unique per user

        builder.HasIndex(c => c.SessionId);

        // Relationships
        builder.HasMany(c => c.Items)
            .WithOne()
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(c => c.DomainEvents);
    }
}
