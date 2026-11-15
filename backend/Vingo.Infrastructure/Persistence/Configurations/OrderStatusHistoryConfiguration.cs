using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Orders;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("order_status_history");

        builder.HasKey(oh => oh.Id);

        builder.Property(oh => oh.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(oh => oh.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(oh => oh.OrderId);
        builder.HasIndex(oh => oh.CreatedAt);
        builder.HasIndex(oh => new { oh.OrderId, oh.CreatedAt });

        builder.Ignore(oh => oh.DomainEvents);
    }
}
