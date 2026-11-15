namespace Vingo.Application.Features.Catalog.Queries.GetProducts;

public record ProductDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? CompareAtPrice { get; init; }
    public string? CategorySlug { get; init; }
    public string? CategoryName { get; init; }
    public string PrimaryImageUrl { get; init; } = string.Empty;
    public string? LightControl { get; init; }
    public string[] Styles { get; init; } = [];
    public string[] RoomSlugs { get; init; } = [];
    public string[] CollectionSlugs { get; init; } = [];
    public string[] NeedSlugs { get; init; } = [];
    public string[] MaterialTiers { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public bool IsFeatured { get; init; }
    public bool IsBestseller { get; init; }
    public bool IsNewArrival { get; init; }
    public bool IsOnSale { get; init; }
    public bool Motorized { get; init; }
    public decimal Rating { get; init; }
    public int ReviewCount { get; init; }
}
