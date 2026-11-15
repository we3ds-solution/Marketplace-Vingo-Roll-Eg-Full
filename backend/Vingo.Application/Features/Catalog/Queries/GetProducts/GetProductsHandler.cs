using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Catalog.Queries.GetProducts;

public class GetProductsHandler
{
    private readonly IApplicationDbContext _context;

    public GetProductsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(
        GetProductsQuery query, 
        CancellationToken cancellationToken = default)
    {
        var productsQuery = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(query.CategorySlug))
        {
            productsQuery = productsQuery.Where(p => 
                p.Category != null && p.Category.Slug == query.CategorySlug);
        }

        if (!string.IsNullOrEmpty(query.Search))
        {
            var searchLower = query.Search.ToLower();
            productsQuery = productsQuery.Where(p => 
                p.Name.ToLower().Contains(searchLower) ||
                p.ShortDescription.ToLower().Contains(searchLower));
        }

        if (query.IsFeatured.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsFeatured == query.IsFeatured.Value);
        }

        if (query.IsBestseller.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsBestseller == query.IsBestseller.Value);
        }

        // Get total count
        var totalCount = await productsQuery.CountAsync(cancellationToken);

        // Apply pagination
        var products = await productsQuery
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Slug = p.Slug,
                Name = p.Name,
                ShortDescription = p.ShortDescription,
                Price = p.BasePrice.Amount,
                CompareAtPrice = p.CompareAtPrice != null ? p.CompareAtPrice.Amount : null,
                CategoryName = p.Category != null ? p.Category.Name : null,
                PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary) != null 
                    ? p.Images.First(i => i.IsPrimary).Url 
                    : p.Images.FirstOrDefault() != null ? p.Images.First().Url : "",
                IsFeatured = p.IsFeatured,
                IsBestseller = p.IsBestseller,
                IsOnSale = p.IsOnSale,
                Rating = p.Rating,
                ReviewCount = p.ReviewCount
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<ProductDto>(
            products,
            totalCount,
            query.Page,
            query.PageSize
        );
    }
}

public record PaginatedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize
)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
