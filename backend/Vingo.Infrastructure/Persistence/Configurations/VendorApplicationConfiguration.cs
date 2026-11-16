using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vingo.Domain.Entities.Account;

namespace Vingo.Infrastructure.Persistence.Configurations;

public class VendorApplicationConfiguration : IEntityTypeConfiguration<VendorApplication>
{
    public void Configure(EntityTypeBuilder<VendorApplication> builder)
    {
        builder.ToTable("vendor_applications");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.CompanyName).HasMaxLength(200).IsRequired();
        builder.Property(v => v.Message).HasMaxLength(2000);
        builder.Property(v => v.Status).HasConversion<int>();

        builder.HasIndex(v => v.UserId);
        builder.HasIndex(v => v.Status);
    }
}
