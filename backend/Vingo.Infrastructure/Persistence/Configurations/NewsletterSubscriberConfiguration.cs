using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Marketing;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class NewsletterSubscriberConfiguration : IEntityTypeConfiguration<NewsletterSubscriber>
{
    public void Configure(EntityTypeBuilder<NewsletterSubscriber> builder)
    {
        builder.ToTable("newsletter_subscribers");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Email)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(n => n.Email)
            .IsUnique();

        builder.Property(n => n.IsActive)
            .HasDefaultValue(true);

        builder.Ignore(n => n.DomainEvents);
    }
}
