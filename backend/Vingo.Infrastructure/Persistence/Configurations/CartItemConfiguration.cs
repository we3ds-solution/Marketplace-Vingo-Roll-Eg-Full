using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("cart_items");

        builder.HasKey(ci => ci.Id);

        builder.Property(ci => ci.Quantity)
            .IsRequired();

        builder.Property(ci => ci.UnitPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(ci => ci.WidthInches)
            .HasPrecision(5, 2);

        builder.Property(ci => ci.HeightInches)
            .HasPrecision(5, 2);

        // Selected options (frontend parity: slug::color=|material=|mount=inside|size=)
        builder.Property(ci => ci.Mount)
            .HasMaxLength(20);

        builder.HasOne<Size>()
            .WithMany()
            .HasForeignKey(ci => ci.SizeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(ci => ci.CartId);
        builder.HasIndex(ci => ci.ProductId);
        builder.HasIndex(ci => new { ci.CartId, ci.ProductId });

        builder.Ignore(ci => ci.DomainEvents);
    }
}
