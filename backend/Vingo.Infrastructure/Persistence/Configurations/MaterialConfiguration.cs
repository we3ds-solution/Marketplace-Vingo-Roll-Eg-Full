using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.ToTable("materials");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(m => m.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(m => m.Slug)
            .IsUnique();

        builder.Property(m => m.Tier)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(m => m.PriceDelta)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(m => m.Description)
            .HasMaxLength(1000);

        builder.Property(m => m.SwatchImageUrl)
            .HasMaxLength(500);

        builder.Property(m => m.IsActive)
            .HasDefaultValue(true);

        builder.Property(m => m.SortOrder)
            .HasDefaultValue(0);

        builder.HasIndex(m => m.Tier);
        builder.HasIndex(m => new { m.IsActive, m.SortOrder });

        builder.Ignore(m => m.DomainEvents);
    }
}
