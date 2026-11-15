namespace Vingo.Application.Features.Catalog.Queries.GetProducts;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? CategorySlug = null,
    string? CollectionSlug = null,
    string? RoomSlug = null,
    string? NeedSlug = null,
    string? Search = null,
    string? LightControl = null,
    string? MaterialTier = null,
    string? Style = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    bool? IsFeatured = null,
    bool? IsBestseller = null,
    bool? IsOnSale = null,
    string? Sort = null
);
