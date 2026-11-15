using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(p => p.Slug)
            .IsUnique();

        builder.Property(p => p.Name)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(p => p.ShortDescription)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(p => p.LongDescription)
            .HasMaxLength(2000);

        // Money value object for BasePrice
        builder.OwnsOne(p => p.BasePrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("base_price")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("currency")
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        });

        // Money value object for CompareAtPrice
        builder.OwnsOne(p => p.CompareAtPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("compare_at_price")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("compare_at_currency")
                .HasMaxLength(3)
                .HasDefaultValue("USD");
        });

        builder.Property(p => p.LightControl)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.Rating)
            .HasPrecision(3, 2);

        builder.Property(p => p.ReviewCount)
            .HasDefaultValue(0);

        builder.Property(p => p.ViewCount)
            .HasDefaultValue(0);

        builder.Property(p => p.IsActive)
            .HasDefaultValue(true);

        builder.Property(p => p.IsFeatured)
            .HasDefaultValue(false);

        builder.Property(p => p.IsBestseller)
            .HasDefaultValue(false);

        builder.Property(p => p.IsNewArrival)
            .HasDefaultValue(false);

        builder.Property(p => p.IsOnSale)
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(p => p.Images)
            .WithOne()
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Many-to-many with Materials
        builder.HasMany(p => p.Materials)
            .WithMany(m => m.Products)
            .UsingEntity<Dictionary<string, object>>(
                "product_materials",
                j => j.HasOne<Material>().WithMany().HasForeignKey("material_id"),
                j => j.HasOne<Product>().WithMany().HasForeignKey("product_id")
            );

        // Many-to-many with Colors
        builder.HasMany(p => p.Colors)
            .WithMany(c => c.Products)
            .UsingEntity<Dictionary<string, object>>(
                "product_colors",
                j => j.HasOne<Color>().WithMany().HasForeignKey("color_id"),
                j => j.HasOne<Product>().WithMany().HasForeignKey("product_id")
            );

        // Many-to-many with Collections
        builder.HasMany(p => p.Collections)
            .WithMany(c => c.Products)
            .UsingEntity<Dictionary<string, object>>(
                "product_collections",
                j => j.HasOne<Collection>().WithMany().HasForeignKey("collection_id"),
                j => j.HasOne<Product>().WithMany().HasForeignKey("product_id"),
                j => j.Property<int>("sort_order").HasDefaultValue(0)
            );

        // Indexes
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.IsFeatured);
        builder.HasIndex(p => p.IsBestseller);
        builder.HasIndex(p => new { p.IsActive, p.IsFeatured });

        // Ignore domain events (not persisted)
        builder.Ignore(p => p.DomainEvents);
    }
}
