namespace Vingo.Application.Features.Catalog.Queries.GetProductBySlug;

public record OptionDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Slug { get; init; }
    public decimal PriceDelta { get; init; }
    public string? Tier { get; init; }
    public string? HexCode { get; init; }
    public string? Family { get; init; }
    public string? Label { get; init; }
    public decimal? WidthInches { get; init; }
    public decimal? HeightInches { get; init; }
}

public record ImageDto
{
    public string Url { get; init; } = string.Empty;
    public string? Alt { get; init; }
    public string Kind { get; init; } = "main";
}

public record ReviewSummaryDto
{
    public int Count { get; init; }
    public decimal AverageRating { get; init; }
    public List<ReviewItemDto> Items { get; init; } = [];
}

public record ReviewItemDto
{
    public Guid Id { get; init; }
    public string Author { get; init; } = string.Empty;
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Body { get; init; }
    public bool Verified { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record RelatedProductDto
{
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string PrimaryImageUrl { get; init; } = string.Empty;
    public decimal Rating { get; init; }
    public int ReviewCount { get; init; }
}

public record ProductDetailDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Price { get; init; }
    public decimal? CompareAtPrice { get; init; }
    public string Currency { get; init; } = "USD";

    public string? CategorySlug { get; init; }
    public string? CategoryName { get; init; }
    public string[] CollectionSlugs { get; init; } = [];
    public string[] RoomSlugs { get; init; } = [];
    public string[] NeedSlugs { get; init; } = [];
    public string[] Styles { get; init; } = [];
    public string? LightControl { get; init; }
    public string Installation { get; init; } = "both";
    public bool Motorized { get; init; }
    public string StockStatus { get; init; } = "in-stock";

    public bool IsFeatured { get; init; }
    public bool IsBestseller { get; init; }
    public bool IsNewArrival { get; init; }
    public bool IsOnSale { get; init; }

    public decimal Rating { get; init; }
    public int ReviewCount { get; init; }

    public List<ImageDto> Images { get; init; } = [];
    public List<OptionDto> Materials { get; init; } = [];
    public List<OptionDto> Colors { get; init; } = [];
    public List<OptionDto> Sizes { get; init; } = [];
    public List<string> Features { get; init; } = [];
    public Dictionary<string, string> Specifications { get; init; } = new();
    public List<ReviewItemDto> Reviews { get; init; } = [];
    public List<RelatedProductDto> RelatedProducts { get; init; } = [];
}
