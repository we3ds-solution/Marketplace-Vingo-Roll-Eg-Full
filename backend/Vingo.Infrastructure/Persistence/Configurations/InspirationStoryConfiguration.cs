using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Content;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class InspirationStoryConfiguration : IEntityTypeConfiguration<InspirationStory>
{
    public void Configure(EntityTypeBuilder<InspirationStory> builder)
    {
        builder.ToTable("inspiration_stories");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(s => s.Slug)
            .IsUnique();

        builder.Property(s => s.Title)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(s => s.Excerpt)
            .HasMaxLength(500);

        builder.Property(s => s.HeroImageUrl)
            .HasMaxLength(500);

        builder.Property(s => s.RoomSlug)
            .HasMaxLength(200);

        builder.Property(s => s.Style)
            .HasMaxLength(100);

        builder.Property(s => s.Treatment)
            .HasMaxLength(100);

        builder.Property(s => s.IsPublished)
            .HasDefaultValue(true);

        builder.HasIndex(s => new { s.IsPublished, s.SortOrder });

        // Body sections
        builder.HasMany(s => s.Sections)
            .WithOne()
            .HasForeignKey(x => x.StoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Featured products (Product side has no navigation)
        builder.HasMany(s => s.Products)
            .WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "inspiration_story_products",
                j => j.HasOne<Product>().WithMany().HasForeignKey("product_id"),
                j => j.HasOne<InspirationStory>().WithMany().HasForeignKey("story_id")
            );

        builder.Ignore(s => s.DomainEvents);
    }
}
