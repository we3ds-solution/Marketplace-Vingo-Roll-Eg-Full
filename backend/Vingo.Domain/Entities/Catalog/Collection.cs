using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Collection : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Mood { get; private set; }
    public string? Story { get; private set; }
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Collection() { } // EF Core

    public Collection(
        string name,
        string slug,
        string? description = null,
        string? mood = null,
        string? story = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Collection name is required");

        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Collection slug is required");

        Name = name;
        Slug = slug;
        Description = description;
        Mood = mood;
        Story = story;
        IsActive = true;
    }

    /// <summary>Full admin edit.</summary>
    public void UpdateDetails(
        string name,
        string slug,
        string? mood,
        string? story,
        string? description,
        string? imageUrl,
        int sortOrder,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Collection name is required");

        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Collection slug is required");

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Mood = mood;
        Story = story;
        Description = description;
        ImageUrl = imageUrl;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddProduct(Product product)
    {
        if (!_products.Contains(product))
        {
            _products.Add(product);
        }
    }
}
