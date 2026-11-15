using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Catalog.Queries.GetProductBySlug;

public class GetProductBySlugHandler
{
    private readonly IApplicationDbContext _context;

    public GetProductBySlugHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDetailDto?> Handle(
        string slug,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Materials)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Rooms)
            .Include(p => p.Needs)
            .Include(p => p.Collections)
            .Include(p => p.Reviews.OrderByDescending(r => r.CreatedAt).Take(10))
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive, cancellationToken);

        if (product == null)
            return null;

        // Related products: same category first, then backfill from the catalog
        var relatedEntities = await _context.Products
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.Id != product.Id && p.CategoryId == product.CategoryId)
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.Rating)
            .Take(4)
            .ToListAsync(cancellationToken);

        if (relatedEntities.Count < 4)
        {
            var exclude = relatedEntities.Select(p => p.Id).Append(product.Id).ToList();

            var backfill = await _context.Products
                .Include(p => p.Images)
                .Where(p => p.IsActive && !exclude.Contains(p.Id))
                .OrderByDescending(p => p.IsFeatured)
                .ThenByDescending(p => p.Rating)
                .Take(4 - relatedEntities.Count)
                .ToListAsync(cancellationToken);

            relatedEntities.AddRange(backfill);
        }

        var related = relatedEntities.Select(p => new RelatedProductDto
        {
            Slug = p.Slug,
            Name = p.Name,
            Price = p.BasePrice.Amount,
            PrimaryImageUrl = p.Images
                .OrderByDescending(i => i.IsPrimary)
                .ThenBy(i => i.SortOrder)
                .Select(i => i.Url)
                .FirstOrDefault() ?? "",
            Rating = p.Rating,
            ReviewCount = p.ReviewCount
        }).ToList();

        return new ProductDetailDto
        {
            Id = product.Id,
            Slug = product.Slug,
            Name = product.Name,
            ShortDescription = product.ShortDescription,
            Description = product.LongDescription ?? product.ShortDescription,
            Price = product.BasePrice.Amount,
            CompareAtPrice = product.CompareAtPrice?.Amount,
            Currency = "USD",
            CategorySlug = product.Category?.Slug,
            CategoryName = product.Category?.Name,
            CollectionSlugs = product.Collections.OrderBy(c => c.Slug).Select(c => c.Slug).ToArray(),
            RoomSlugs = product.Rooms.OrderBy(r => r.Slug).Select(r => r.Slug).ToArray(),
            NeedSlugs = product.Needs.OrderBy(n => n.Slug).Select(n => n.Slug).ToArray(),
            Styles = product.Styles,
            LightControl = product.LightControl.ToString(),
            Installation = product.Installation,
            Motorized = product.Motorized,
            StockStatus = product.StockStatus,
            IsFeatured = product.IsFeatured,
            IsBestseller = product.IsBestseller,
            IsNewArrival = product.IsNewArrival,
            IsOnSale = product.IsOnSale,
            Rating = product.Rating,
            ReviewCount = product.ReviewCount,
            Images = product.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new ImageDto
                {
                    Url = i.Url,
                    Alt = i.AltText,
                    Kind = i.IsPrimary ? "main" : "detail"
                })
                .ToList(),
            Materials = product.Materials
                .OrderBy(m => m.SortOrder)
                .Select(m => new OptionDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Slug = m.Slug,
                    PriceDelta = m.PriceDelta,
                    Tier = m.Tier.ToString()
                })
                .ToList(),
            Colors = product.Colors
                .OrderBy(c => c.SortOrder)
                .Select(c => new OptionDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    HexCode = c.HexCode,
                    Family = c.Family
                })
                .ToList(),
            Sizes = product.Sizes
                .OrderBy(s => s.SortOrder)
                .Select(s => new OptionDto
                {
                    Id = s.Id,
                    Label = s.Label,
                    Slug = s.Slug,
                    PriceDelta = s.PriceDelta,
                    WidthInches = s.WidthInches,
                    HeightInches = s.HeightInches
                })
                .ToList(),
            Features = DeserializeList(product.FeaturesJson),
            Specifications = DeserializeDictionary(product.SpecificationsJson),
            RelatedProducts = related,
            Reviews = product.Reviews
                .Select(r => new ReviewItemDto
                {
                    Id = r.Id,
                    Author = r.AuthorName,
                    Rating = r.Rating,
                    Title = r.Title,
                    Body = r.Body,
                    Verified = r.IsVerifiedPurchase,
                    CreatedAt = r.CreatedAt
                })
                .ToList()
        };
    }

    private static List<string> DeserializeList(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static Dictionary<string, string> DeserializeDictionary(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new Dictionary<string, string>();
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                   ?? new Dictionary<string, string>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, string>();
        }
    }
}
