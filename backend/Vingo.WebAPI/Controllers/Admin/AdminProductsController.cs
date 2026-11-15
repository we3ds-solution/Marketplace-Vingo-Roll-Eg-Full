using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Enums;
using Vingo.Domain.ValueObjects;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IApplicationDbContext context, ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private sealed record AdminProductListItem(
        Guid Id, string Slug, string Name, string ShortDescription,
        decimal Price, decimal? CompareAtPrice,
        string? CategorySlug, string? CategoryName, string PrimaryImageUrl,
        bool IsFeatured, bool IsBestseller, bool IsNewArrival, bool IsOnSale, bool IsActive,
        decimal Rating, int ReviewCount, string StockStatus, bool Motorized);

    private sealed record AdminProductImage(
        Guid Id, string Url, string? Alt, bool IsPrimary, int SortOrder);

    private sealed record AdminProductDetail(
        Guid Id, string Slug, string Name, string ShortDescription, string? LongDescription,
        decimal Price, decimal? CompareAtPrice, string Currency,
        Guid? CategoryId, string? CategorySlug, string? CategoryName,
        string LightControl, string Installation, bool Motorized, string StockStatus,
        string[] Styles, List<string> Features, Dictionary<string, string> Specifications,
        bool IsFeatured, bool IsBestseller, bool IsNewArrival, bool IsOnSale, bool IsActive,
        decimal Rating, int ReviewCount,
        Guid[] MaterialIds, Guid[] ColorIds, Guid[] SizeIds, Guid[] RoomIds, Guid[] NeedIds, Guid[] CollectionIds,
        List<AdminProductImage> Images);

    public sealed record AdminProductUpsertRequest(
        string Slug,
        string Name,
        string ShortDescription,
        string? LongDescription,
        decimal Price,
        decimal? CompareAtPrice,
        Guid? CategoryId,
        string LightControl,
        string Installation,
        bool Motorized,
        string StockStatus,
        string[] Styles,
        List<string> Features,
        Dictionary<string, string> Specifications,
        bool IsFeatured,
        bool IsBestseller,
        bool IsNewArrival,
        bool IsOnSale,
        bool IsActive,
        Guid[] MaterialIds,
        Guid[] ColorIds,
        Guid[] SizeIds,
        Guid[] RoomIds,
        Guid[] NeedIds,
        Guid[] CollectionIds);

    /// <summary>
    /// List all products (admin) with search/filter/pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var productsQuery = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLowerInvariant();
            productsQuery = productsQuery.Where(p =>
                p.Name.ToLower().Contains(q) || p.Slug.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            productsQuery = productsQuery.Where(p => p.Category != null && p.Category.Slug == category);
        }

        if (active == "active")
        {
            productsQuery = productsQuery.Where(p => p.IsActive);
        }
        else if (active == "inactive")
        {
            productsQuery = productsQuery.Where(p => !p.IsActive);
        }

        var total = await productsQuery.CountAsync(cancellationToken);

        var products = await productsQuery
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = products.Select(p => new AdminProductListItem(
            p.Id, p.Slug, p.Name, p.ShortDescription,
            p.BasePrice.Amount, p.CompareAtPrice?.Amount,
            p.Category?.Slug, p.Category?.Name,
            p.Images.OrderByDescending(i => i.IsPrimary).ThenBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault() ?? "",
            p.IsFeatured, p.IsBestseller, p.IsNewArrival, p.IsOnSale, p.IsActive,
            p.Rating, p.ReviewCount, p.StockStatus, p.Motorized)).ToList();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>
    /// Get one product with all editable fields
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Materials)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Rooms)
            .Include(p => p.Needs)
            .Include(p => p.Collections)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        return Ok(MapDetail(product));
    }

    /// <summary>
    /// Create a product
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] AdminProductUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var error = await ValidateUpsertAsync(request, null, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        var lightControl = ParseLightControl(request.LightControl);
        if (lightControl == null)
        {
            return BadRequest(new { error = "LightControl must be Sheer, LightFiltering, Blackout or RoomDarkening" });
        }

        var product = new Product(
            request.Slug.Trim().ToLowerInvariant(),
            request.Name.Trim(),
            request.ShortDescription.Trim(),
            new Money(request.Price),
            lightControl.Value)
        {
            Id = Guid.NewGuid()
        };

        product.UpdatePrice(
            new Money(request.Price),
            request.CompareAtPrice.HasValue ? new Money(request.CompareAtPrice.Value) : null);
        product.SetFlags(request.IsFeatured, request.IsBestseller, request.IsNewArrival, request.IsOnSale);
        product.SetFlags(isActive: request.IsActive);
        product.UpdateRating(0m, 0);

        ApplyDetails(product, request, lightControl.Value);
        await ReplaceOptionsAsync(product, request, cancellationToken);

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        var reloaded = await LoadFullAsync(product.Id, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, MapDetail(reloaded!));
    }

    /// <summary>
    /// Update a product
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] AdminProductUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var product = await LoadFullAsync(id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        var error = await ValidateUpsertAsync(request, product.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        var lightControl = ParseLightControl(request.LightControl);
        if (lightControl == null)
        {
            return BadRequest(new { error = "LightControl must be Sheer, LightFiltering, Blackout or RoomDarkening" });
        }

        ApplyDetails(product, request, lightControl.Value);
        product.UpdatePrice(
            new Money(request.Price),
            request.CompareAtPrice.HasValue ? new Money(request.CompareAtPrice.Value) : null);
        product.SetFlags(request.IsFeatured, request.IsBestseller, request.IsNewArrival, request.IsOnSale);
        product.SetFlags(isActive: request.IsActive);
        await ReplaceOptionsAsync(product, request, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        var reloaded = await LoadFullAsync(product.Id, cancellationToken);
        return Ok(MapDetail(reloaded!));
    }

    /// <summary>
    /// Delete a product (cascades images and review rows)
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Add an image to a product
    /// </summary>
    [HttpPost("{id:guid}/images")]
    public async Task<IActionResult> AddImage(
        Guid id,
        [FromBody] AdminImageRequest request,
        CancellationToken cancellationToken)
    {
        var product = await LoadFullAsync(id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return BadRequest(new { error = "Image URL is required" });
        }

        product.AddImage(request.Url.Trim(), request.Alt?.Trim(), request.IsPrimary);
        if (request.IsPrimary)
        {
            var primaryId = product.Images.Last().Id;
            product.SetPrimaryImage(primaryId);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var reloaded = await LoadFullAsync(id, cancellationToken);
        return Ok(MapDetail(reloaded!));
    }

    /// <summary>
    /// Remove an image
    /// </summary>
    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> RemoveImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        var product = await LoadFullAsync(id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        var removed = product.RemoveImage(imageId);
        if (!removed)
        {
            return NotFound(new { error = "Image not found" });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(MapDetail(product));
    }

    /// <summary>
    /// Make an image the primary
    /// </summary>
    [HttpPost("{id:guid}/images/{imageId:guid}/primary")]
    public async Task<IActionResult> SetPrimaryImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        var product = await LoadFullAsync(id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        if (product.Images.All(i => i.Id != imageId))
        {
            return NotFound(new { error = "Image not found" });
        }

        product.SetPrimaryImage(imageId);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(MapDetail(product));
    }

    public record AdminImageRequest(string Url, string? Alt, bool IsPrimary = false);

    private async Task<Product?> LoadFullAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Materials)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Rooms)
            .Include(p => p.Needs)
            .Include(p => p.Collections)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    private async Task<string?> ValidateUpsertAsync(AdminProductUpsertRequest request, Guid? existingId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Slug))
            return "Slug is required";

        if (string.IsNullOrWhiteSpace(request.Name))
            return "Name is required";

        if (string.IsNullOrWhiteSpace(request.ShortDescription))
            return "Short description is required";

        if (request.Price < 0)
            return "Price cannot be negative";

        var slug = request.Slug.Trim().ToLowerInvariant();
        var slugTaken = await _context.Products
            .AnyAsync(p => p.Slug == slug && p.Id != existingId, cancellationToken);

        if (slugTaken)
            return $"A product with the slug '{slug}' already exists";

        var validCategory = request.CategoryId == null ||
            await _context.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!validCategory)
            return "Unknown category";

        var validControl = ParseLightControl(request.LightControl) != null;
        if (!validControl)
            return "LightControl must be Sheer, LightFiltering, Blackout or RoomDarkening";

        return null;
    }

    private static LightControlType? ParseLightControl(string value)
    {
        return Enum.TryParse<LightControlType>(value?.Trim().Replace("-", string.Empty), ignoreCase: true, out var light)
            ? light
            : null;
    }

    private static void ApplyDetails(Product product, AdminProductUpsertRequest request, LightControlType lightControl)
    {
        product.UpdateDetails(
            request.Name,
            request.ShortDescription,
            request.LongDescription,
            new Money(request.Price),
            request.CompareAtPrice.HasValue ? new Money(request.CompareAtPrice.Value) : null,
            request.CategoryId,
            lightControl,
            string.IsNullOrWhiteSpace(request.Installation) ? "both" : request.Installation.Trim().ToLowerInvariant(),
            request.Motorized,
            string.IsNullOrWhiteSpace(request.StockStatus) ? "in-stock" : request.StockStatus.Trim().ToLowerInvariant(),
            request.Styles ?? [],
            request.Slug);
    }

    private async Task ReplaceOptionsAsync(Product product, AdminProductUpsertRequest request, CancellationToken cancellationToken)
    {
        var (materials, colors, sizes, rooms, needs, collections) = await ResolveOptionsAsync(request, cancellationToken);
        product.ReplaceOptions(materials, colors, sizes, rooms, needs, collections);
    }

    private async Task<(List<Material> Materials, List<Color> Colors, List<Size> Sizes,
        List<Room> Rooms, List<Need> Needs, List<Collection> Collections)> ResolveOptionsAsync(
        AdminProductUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var materialIds = request.MaterialIds ?? [];
        var colorIds = request.ColorIds ?? [];
        var sizeIds = request.SizeIds ?? [];
        var roomIds = request.RoomIds ?? [];
        var needIds = request.NeedIds ?? [];
        var collectionIds = request.CollectionIds ?? [];

        var materials = await _context.Materials.Where(m => materialIds.Contains(m.Id)).ToListAsync(cancellationToken);
        var colors = await _context.Colors.Where(c => colorIds.Contains(c.Id)).ToListAsync(cancellationToken);
        var sizes = await _context.Sizes.Where(s => sizeIds.Contains(s.Id)).ToListAsync(cancellationToken);
        var rooms = await _context.Rooms.Where(r => roomIds.Contains(r.Id)).ToListAsync(cancellationToken);
        var needs = await _context.Needs.Where(n => needIds.Contains(n.Id)).ToListAsync(cancellationToken);
        var collections = await _context.Collections.Where(c => collectionIds.Contains(c.Id)).ToListAsync(cancellationToken);

        return (materials, colors, sizes, rooms, needs, collections);
    }

    private static AdminProductDetail MapDetail(Product p)
    {
        var features = string.IsNullOrWhiteSpace(p.FeaturesJson)
            ? []
            : (JsonSerializer.Deserialize<List<string>>(p.FeaturesJson) ?? []);

        var specifications = string.IsNullOrWhiteSpace(p.SpecificationsJson)
            ? new Dictionary<string, string>()
            : (JsonSerializer.Deserialize<Dictionary<string, string>>(p.SpecificationsJson) ?? new Dictionary<string, string>());

        return new AdminProductDetail(
            p.Id, p.Slug, p.Name, p.ShortDescription, p.LongDescription,
            p.BasePrice.Amount, p.CompareAtPrice?.Amount, "USD",
            p.CategoryId, p.Category?.Slug, p.Category?.Name,
            p.LightControl.ToString(), p.Installation, p.Motorized, p.StockStatus,
            p.Styles, features, specifications,
            p.IsFeatured, p.IsBestseller, p.IsNewArrival, p.IsOnSale, p.IsActive,
            p.Rating, p.ReviewCount,
            p.Materials.Select(m => m.Id).ToArray(),
            p.Colors.Select(c => c.Id).ToArray(),
            p.Sizes.Select(s => s.Id).ToArray(),
            p.Rooms.Select(r => r.Id).ToArray(),
            p.Needs.Select(n => n.Id).ToArray(),
            p.Collections.Select(c => c.Id).ToArray(),
            p.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new AdminProductImage(i.Id, i.Url, i.AltText, i.IsPrimary, i.SortOrder))
                .ToList());
    }
}
