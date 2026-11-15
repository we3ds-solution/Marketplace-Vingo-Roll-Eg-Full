using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Orders;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Money value objects
        builder.OwnsOne(o => o.Subtotal, ConfigureMoney("subtotal"));
        builder.OwnsOne(o => o.ShippingCost, ConfigureMoney("shipping_cost"));
        builder.OwnsOne(o => o.TaxAmount, ConfigureMoney("tax_amount"));
        builder.OwnsOne(o => o.DiscountAmount, ConfigureMoney("discount_amount"));
        builder.OwnsOne(o => o.TotalAmount, ConfigureMoney("total_amount"));

        builder.Property(o => o.ShippingMethod)
            .HasMaxLength(50);

        builder.Property(o => o.TrackingNumber)
            .HasMaxLength(100);

        builder.Property(o => o.PaymentMethod)
            .HasMaxLength(50);

        builder.Property(o => o.CustomerNotes)
            .HasMaxLength(1000);

        builder.Property(o => o.InternalNotes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.StatusHistory)
            .WithOne()
            .HasForeignKey(oh => oh.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);
        builder.HasIndex(o => new { o.UserId, o.Status });

        builder.Ignore(o => o.DomainEvents);
    }

    private static Action<EntityFrameworkCore.Metadata.Builders.OwnedNavigationBuilder<Order, Domain.ValueObjects.Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName(columnPrefix)
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName($"{columnPrefix}_currency")
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        };
    }
}
