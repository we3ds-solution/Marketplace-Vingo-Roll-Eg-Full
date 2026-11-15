using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class NeedConfiguration : IEntityTypeConfiguration<Need>
{
    public void Configure(EntityTypeBuilder<Need> builder)
    {
        builder.ToTable("needs");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(n => n.Slug)
            .IsUnique();

        builder.Property(n => n.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(n => n.Description)
            .HasMaxLength(1000);

        builder.Property(n => n.Icon)
            .HasMaxLength(100);

        builder.Property(n => n.SortOrder)
            .HasDefaultValue(0);

        builder.Property(n => n.IsActive)
            .HasDefaultValue(true);

        builder.HasIndex(n => new { n.IsActive, n.SortOrder });

        builder.Ignore(n => n.DomainEvents);
    }
}
