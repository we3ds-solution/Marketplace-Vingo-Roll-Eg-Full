namespace Vingo.Application.Features.Catalog.Queries.GetProducts;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? CategorySlug = null,
    string? Search = null,
    bool? IsFeatured = null,
    bool? IsBestseller = null
);
