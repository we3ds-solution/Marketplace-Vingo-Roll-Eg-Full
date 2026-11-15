using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Size : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public decimal WidthInches { get; private set; }
    public decimal HeightInches { get; private set; }
    public decimal PriceDelta { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Size() { } // EF Core

    public Size(string slug, string label, decimal widthInches, decimal heightInches, decimal priceDelta = 0)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Size slug is required");

        if (string.IsNullOrWhiteSpace(label))
            throw new DomainException("Size label is required");

        if (priceDelta < 0)
            throw new DomainException("Size price delta cannot be negative");

        Slug = slug.Trim().ToLowerInvariant();
        Label = label;
        WidthInches = widthInches;
        HeightInches = heightInches;
        PriceDelta = priceDelta;
    }

    /// <summary>Full admin edit.</summary>
    public void UpdateDetails(
        string slug,
        string label,
        decimal widthInches,
        decimal heightInches,
        decimal priceDelta,
        int sortOrder,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Size slug is required");

        if (string.IsNullOrWhiteSpace(label))
            throw new DomainException("Size label is required");

        if (priceDelta < 0)
            throw new DomainException("Size price delta cannot be negative");

        Slug = slug.Trim().ToLowerInvariant();
        Label = label;
        WidthInches = widthInches;
        HeightInches = heightInches;
        PriceDelta = priceDelta;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
