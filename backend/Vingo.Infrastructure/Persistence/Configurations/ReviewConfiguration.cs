using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("reviews", t =>
        {
            t.HasCheckConstraint("ck_reviews_rating", "rating >= 1 AND rating <= 5");
        });

        builder.HasKey(r => r.Id);

        builder.Property(r => r.AuthorName)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(r => r.Rating)
            .IsRequired();

        builder.Property(r => r.Title)
            .HasMaxLength(120);

        builder.Property(r => r.Body)
            .HasMaxLength(1000);

        builder.Property(r => r.IsVerifiedPurchase)
            .HasDefaultValue(false);

        builder.HasOne(r => r.Product)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.ProductId);
        builder.HasIndex(r => r.CreatedAt);

        builder.Ignore(r => r.DomainEvents);
    }
}
