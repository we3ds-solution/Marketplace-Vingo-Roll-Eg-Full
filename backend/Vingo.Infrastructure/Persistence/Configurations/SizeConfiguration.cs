using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class SizeConfiguration : IEntityTypeConfiguration<Size>
{
    public void Configure(EntityTypeBuilder<Size> builder)
    {
        builder.ToTable("sizes");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Slug)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(s => s.Slug)
            .IsUnique();

        builder.Property(s => s.Label)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(s => s.WidthInches)
            .HasPrecision(5, 2);

        builder.Property(s => s.HeightInches)
            .HasPrecision(5, 2);

        builder.Property(s => s.PriceDelta)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(s => s.SortOrder)
            .HasDefaultValue(0);

        builder.Property(s => s.IsActive)
            .HasDefaultValue(true);

        builder.Ignore(s => s.DomainEvents);
    }
}
