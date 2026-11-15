namespace Vingo.Application.Features.Catalog.Queries.GetProducts;

public record ProductDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? CompareAtPrice { get; init; }
    public string? CategoryName { get; init; }
    public string PrimaryImageUrl { get; init; } = string.Empty;
    public bool IsFeatured { get; init; }
    public bool IsBestseller { get; init; }
    public bool IsOnSale { get; init; }
    public decimal Rating { get; init; }
    public int ReviewCount { get; init; }
}
