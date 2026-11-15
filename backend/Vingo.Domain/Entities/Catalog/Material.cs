using Vingo.Domain.Common;
using Vingo.Domain.Enums;

namespace Vingo.Domain.Entities.Catalog;

public class Material : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public MaterialTier Tier { get; private set; }
    public decimal PriceDelta { get; private set; }
    public string? Description { get; private set; }
    public string? SwatchImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Material() { } // EF Core

    public Material(string name, string slug, MaterialTier tier, decimal priceDelta = 0)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Material name is required");

        Name = name;
        Slug = slug;
        Tier = tier;
        PriceDelta = priceDelta;
        IsActive = true;
    }

    /// <summary>Full admin edit.</summary>
    public void UpdateDetails(
        string name,
        string slug,
        MaterialTier tier,
        decimal priceDelta,
        string? description,
        string? swatchImageUrl,
        int sortOrder,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Material name is required");

        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Material slug is required");

        if (priceDelta < 0)
            throw new DomainException("Material price delta cannot be negative");

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Tier = tier;
        PriceDelta = priceDelta;
        Description = description;
        SwatchImageUrl = swatchImageUrl;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePricing(decimal priceDelta)
    {
        PriceDelta = priceDelta;
    }
}
