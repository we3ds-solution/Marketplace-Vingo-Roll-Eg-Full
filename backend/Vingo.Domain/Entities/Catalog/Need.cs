using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Need : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Need() { } // EF Core

    public Need(string slug, string name, string? description = null, string? icon = null)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Need slug is required");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Need name is required");

        Slug = slug.Trim().ToLowerInvariant();
        Name = name;
        Description = description;
        Icon = icon;
    }

    /// <summary>Full admin edit.</summary>
    public void UpdateDetails(
        string name,
        string slug,
        string? description,
        string? icon,
        int sortOrder,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Need name is required");

        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Need slug is required");

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Description = description;
        Icon = icon;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
