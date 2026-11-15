using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("rooms");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(r => r.Slug)
            .IsUnique();

        builder.Property(r => r.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasMaxLength(1000);

        builder.Property(r => r.ImageUrl)
            .HasMaxLength(500);

        builder.Property(r => r.RecommendedCategorySlugs)
            .HasColumnType("text[]");

        builder.Property(r => r.SortOrder)
            .HasDefaultValue(0);

        builder.Property(r => r.IsActive)
            .HasDefaultValue(true);

        builder.HasIndex(r => new { r.IsActive, r.SortOrder });

        builder.Ignore(r => r.DomainEvents);
    }
}
