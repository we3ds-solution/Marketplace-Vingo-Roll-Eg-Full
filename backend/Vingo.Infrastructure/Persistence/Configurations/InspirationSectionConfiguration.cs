using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Content;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class InspirationSectionConfiguration : IEntityTypeConfiguration<InspirationSection>
{
    public void Configure(EntityTypeBuilder<InspirationSection> builder)
    {
        builder.ToTable("inspiration_sections");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Heading)
            .HasMaxLength(200);

        builder.Property(x => x.Body)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.ImageUrl)
            .HasMaxLength(500);

        builder.Property(x => x.SortOrder)
            .HasDefaultValue(0);

        builder.HasIndex(x => new { x.StoryId, x.SortOrder });

        builder.Ignore(x => x.DomainEvents);
    }
}
