using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Orders;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");

        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.ProductName)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(oi => oi.ProductSlug)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(oi => oi.MaterialName)
            .HasMaxLength(200);

        builder.Property(oi => oi.ColorName)
            .HasMaxLength(100);

        builder.Property(oi => oi.SizeLabel)
            .HasMaxLength(100);

        builder.Property(oi => oi.Mount)
            .HasMaxLength(20);

        builder.Property(oi => oi.WidthInches)
            .HasPrecision(5, 2);

        builder.Property(oi => oi.HeightInches)
            .HasPrecision(5, 2);

        builder.Property(oi => oi.Quantity)
            .IsRequired();

        // Money value objects
        builder.OwnsOne(oi => oi.UnitPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("unit_price")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("unit_price_currency")
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        });

        builder.OwnsOne(oi => oi.TotalPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("total_price")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("total_price_currency")
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        });

        builder.HasIndex(oi => oi.OrderId);
        builder.HasIndex(oi => oi.ProductId);

        builder.Ignore(oi => oi.DomainEvents);
    }
}
