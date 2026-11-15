using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Room : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }

    /// <summary>Category slugs recommended for this room.</summary>
    public string[] RecommendedCategorySlugs { get; private set; } = [];

    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Room() { } // EF Core

    public Room(
        string slug,
        string name,
        string? description = null,
        string? imageUrl = null,
        string[]? recommendedCategorySlugs = null)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Room slug is required");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Room name is required");

        Slug = slug.Trim().ToLowerInvariant();
        Name = name;
        Description = description;
        ImageUrl = imageUrl;
        RecommendedCategorySlugs = recommendedCategorySlugs ?? [];
    }

    /// <summary>Full admin edit.</summary>
    public void UpdateDetails(
        string name,
        string slug,
        string? description,
        string? imageUrl,
        string[] recommendedCategorySlugs,
        int sortOrder,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Room name is required");

        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Room slug is required");

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Description = description;
        ImageUrl = imageUrl;
        RecommendedCategorySlugs = recommendedCategorySlugs ?? [];
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
