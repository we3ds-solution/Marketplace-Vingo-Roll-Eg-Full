using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Wishlist.Common;

public record WishlistDto
{
    public int Count { get; init; }
    public List<WishlistItemDto> Items { get; init; } = [];
}

public record WishlistItemDto
{
    public Guid ProductId { get; init; }
    public string ProductSlug { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? CompareAtPrice { get; init; }
    public string ImageUrl { get; init; } = string.Empty;
    public decimal Rating { get; init; }
    public int ReviewCount { get; init; }
    public bool IsBestseller { get; init; }
}

public static class WishlistMapper
{
    public static async Task<WishlistDto> MapAsync(
        IApplicationDbContext context,
        Domain.Entities.Shopping.Wishlist wishlist,
        CancellationToken cancellationToken = default)
    {
        var productIds = wishlist.Items.Select(i => i.ProductId).ToList();

        var products = await context.Products
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        return new WishlistDto
        {
            Count = products.Count,
            Items = wishlist.Items
                .Where(i => products.ContainsKey(i.ProductId))
                .Select(i =>
                {
                    var p = products[i.ProductId];
                    return new WishlistItemDto
                    {
                        ProductId = p.Id,
                        ProductSlug = p.Slug,
                        ProductName = p.Name,
                        Price = p.BasePrice.Amount,
                        CompareAtPrice = p.CompareAtPrice?.Amount,
                        ImageUrl = p.Images
                            .OrderByDescending(im => im.IsPrimary)
                            .ThenBy(im => im.SortOrder)
                            .Select(im => im.Url)
                            .FirstOrDefault() ?? "",
                        Rating = p.Rating,
                        ReviewCount = p.ReviewCount,
                        IsBestseller = p.IsBestseller
                    };
                })
                .ToList()
        };
    }

    /// <summary>Finds the session/user wishlist or returns null.</summary>
    public static async Task<Domain.Entities.Shopping.Wishlist?> FindAsync(
        IApplicationDbContext context,
        Guid? userId,
        string? sessionId,
        CancellationToken cancellationToken = default)
    {
        if (userId.HasValue)
        {
            return await context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userId.Value, cancellationToken);
        }

        if (!string.IsNullOrWhiteSpace(sessionId))
        {
            return await context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.SessionId == sessionId, cancellationToken);
        }

        return null;
    }
}
