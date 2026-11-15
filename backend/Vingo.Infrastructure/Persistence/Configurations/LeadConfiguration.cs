using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Marketing;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.ToTable("leads");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.LeadType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(l => l.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(l => l.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(l => l.Email)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(l => l.Phone)
            .HasMaxLength(40);

        builder.Property(l => l.Message)
            .HasMaxLength(2000);

        builder.Property(l => l.ProductSlug)
            .HasMaxLength(200);

        builder.Property(l => l.Source)
            .HasMaxLength(100);

        builder.HasIndex(l => l.Email);
        builder.HasIndex(l => l.Status);
        builder.HasIndex(l => l.CreatedAt);

        builder.Ignore(l => l.DomainEvents);
    }
}
