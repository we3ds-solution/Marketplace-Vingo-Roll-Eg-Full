using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Cart.Common;

public record CartDto
{
    public Guid Id { get; init; }
    public int ItemCount { get; init; }
    public decimal Subtotal { get; init; }
    public decimal Shipping { get; init; }
    public decimal Total { get; init; }
    public List<CartItemDto> Items { get; init; } = [];
}

public record CartItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductSlug { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal TotalPrice { get; init; }
    public Guid? MaterialId { get; init; }
    public Guid? ColorId { get; init; }
    public Guid? SizeId { get; init; }
    public string? MaterialName { get; init; }
    public string? ColorName { get; init; }
    public string? SizeLabel { get; init; }
    public string? Mount { get; init; }
}

/// <summary>
/// Maps a Cart entity to its API DTO, resolving display info for each line item.
/// </summary>
public static class CartMapper
{
    public static async Task<CartDto> MapAsync(IApplicationDbContext context, Domain.Entities.Shopping.Cart cart, CancellationToken cancellationToken = default)
    {
        var productIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var materialIds = cart.Items.Where(i => i.MaterialId.HasValue).Select(i => i.MaterialId!.Value).ToList();
        var colorIds = cart.Items.Where(i => i.ColorId.HasValue).Select(i => i.ColorId!.Value).ToList();
        var sizeIds = cart.Items.Where(i => i.SizeId.HasValue).Select(i => i.SizeId!.Value).ToList();

        var products = await context.Products
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var materials = materialIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await context.Materials
                .Where(m => materialIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, m => m.Name, cancellationToken);

        var colors = colorIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await context.Colors
                .Where(c => colorIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        var sizes = sizeIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await context.Sizes
                .Where(s => sizeIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.Label, cancellationToken);

        var subtotal = cart.GetSubtotal();
        var shipping = cart.Items.Count == 0 ? 0 : subtotal >= 500 ? 0 : 45;

        return new CartDto
        {
            Id = cart.Id,
            ItemCount = cart.GetTotalItems(),
            Subtotal = subtotal,
            Shipping = shipping,
            Total = subtotal + shipping,
            Items = cart.Items.Select(i =>
            {
                products.TryGetValue(i.ProductId, out var product);
                return new CartItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductSlug = product?.Slug ?? string.Empty,
                    ProductName = product?.Name ?? "Unavailable product",
                    ImageUrl = product?.Images
                        .OrderByDescending(im => im.IsPrimary)
                        .ThenBy(im => im.SortOrder)
                        .Select(im => im.Url)
                        .FirstOrDefault() ?? "",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.GetTotalPrice(),
                    MaterialId = i.MaterialId,
                    ColorId = i.ColorId,
                    SizeId = i.SizeId,
                    MaterialName = i.MaterialId.HasValue && materials.TryGetValue(i.MaterialId.Value, out var mn) ? mn : null,
                    ColorName = i.ColorId.HasValue && colors.TryGetValue(i.ColorId.Value, out var cn) ? cn : null,
                    SizeLabel = i.SizeId.HasValue && sizes.TryGetValue(i.SizeId.Value, out var sl) ? sl : null,
                    Mount = i.Mount
                };
            }).ToList()
        };
    }
}
