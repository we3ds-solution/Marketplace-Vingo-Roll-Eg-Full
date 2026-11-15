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
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var productsQuery = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Materials)
            .Include(p => p.Rooms)
            .Include(p => p.Collections)
            .Where(p => p.IsActive)
            .AsQueryable();

        // Filters
        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            productsQuery = query.CategorySlug == "sale"
                ? productsQuery.Where(p => p.IsOnSale)
                : productsQuery.Where(p => p.Category != null && p.Category.Slug == query.CategorySlug);
        }

        if (!string.IsNullOrWhiteSpace(query.CollectionSlug))
        {
            productsQuery = productsQuery.Where(p =>
                p.Collections.Any(c => c.Slug == query.CollectionSlug));
        }

        if (!string.IsNullOrWhiteSpace(query.RoomSlug))
        {
            productsQuery = productsQuery.Where(p =>
                p.Rooms.Any(r => r.Slug == query.RoomSlug));
        }

        if (!string.IsNullOrWhiteSpace(query.NeedSlug))
        {
            productsQuery = productsQuery.Where(p =>
                p.Needs.Any(n => n.Slug == query.NeedSlug));
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchLower = query.Search.Trim().ToLower();
            productsQuery = productsQuery.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                p.ShortDescription.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(query.LightControl))
        {
            if (Enum.TryParse<Domain.Enums.LightControlType>(
                    query.LightControl.Replace("-", ""), true, out var light))
            {
                productsQuery = productsQuery.Where(p => p.LightControl == light);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.MaterialTier))
        {
            if (Enum.TryParse<Domain.Enums.MaterialTier>(query.MaterialTier, true, out var tier))
            {
                productsQuery = productsQuery.Where(p => p.Materials.Any(m => m.Tier == tier));
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Style))
        {
            productsQuery = productsQuery.Where(p => p.Styles.Contains(query.Style));
        }

        if (query.MinPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BasePrice.Amount >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BasePrice.Amount <= query.MaxPrice.Value);
        }

        if (query.IsFeatured.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsFeatured == query.IsFeatured.Value);
        }

        if (query.IsBestseller.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsBestseller == query.IsBestseller.Value);
        }

        if (query.IsOnSale.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsOnSale == query.IsOnSale.Value);
        }

        var totalCount = await productsQuery.CountAsync(cancellationToken);

        productsQuery = (query.Sort?.ToLowerInvariant()) switch
        {
            "price-asc" => productsQuery.OrderBy(p => p.BasePrice.Amount),
            "price-desc" => productsQuery.OrderByDescending(p => p.BasePrice.Amount),
            "newest" => productsQuery.OrderByDescending(p => p.CreatedAt),
            "bestseller" => productsQuery.OrderByDescending(p => p.Rating).ThenByDescending(p => p.ReviewCount),
            _ => productsQuery.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
        };

        var products = await productsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Slug = p.Slug,
            Name = p.Name,
            ShortDescription = p.ShortDescription,
            Price = p.BasePrice.Amount,
            CompareAtPrice = p.CompareAtPrice?.Amount,
            CategorySlug = p.Category?.Slug,
            CategoryName = p.Category?.Name,
            PrimaryImageUrl = p.Images
                .OrderByDescending(i => i.IsPrimary)
                .ThenBy(i => i.SortOrder)
                .Select(i => i.Url)
                .FirstOrDefault() ?? "",
            LightControl = p.LightControl.ToString(),
            Styles = p.Styles,
            RoomSlugs = p.Rooms.OrderBy(r => r.Slug).Select(r => r.Slug).ToArray(),
            CollectionSlugs = p.Collections.OrderBy(c => c.Slug).Select(c => c.Slug).ToArray(),
            NeedSlugs = p.Needs.OrderBy(n => n.Slug).Select(n => n.Slug).ToArray(),
            MaterialTiers = p.Materials.Select(m => m.Tier.ToString().ToLowerInvariant()).Distinct().ToArray(),
            CreatedAt = p.CreatedAt,
            IsFeatured = p.IsFeatured,
            IsBestseller = p.IsBestseller,
            IsNewArrival = p.IsNewArrival,
            IsOnSale = p.IsOnSale,
            Motorized = p.Motorized,
            Rating = p.Rating,
            ReviewCount = p.ReviewCount
        }).ToList();

        return new PaginatedResult<ProductDto>(
            items,
            totalCount,
            page,
            pageSize
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
