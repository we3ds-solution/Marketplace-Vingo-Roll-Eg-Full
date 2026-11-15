using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Catalog.Queries.GetProducts;

namespace Vingo.Application.Features.Catalog.Queries.GetCollections;

public class GetCollectionsHandler
{
    private readonly IApplicationDbContext _context;

    public GetCollectionsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CollectionDto>> Handle(CancellationToken cancellationToken = default)
    {
        var collections = await _context.Collections
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new CollectionDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Mood = c.Mood,
                Story = c.Story,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return collections;
    }
}

public class GetCollectionBySlugHandler
{
    private readonly IApplicationDbContext _context;
    private readonly GetProductsHandler _getProductsHandler;

    public GetCollectionBySlugHandler(IApplicationDbContext context, GetProductsHandler getProductsHandler)
    {
        _context = context;
        _getProductsHandler = getProductsHandler;
    }

    public async Task<CollectionDetailDto?> Handle(
        string slug,
        string? sort = null,
        CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive, cancellationToken);

        if (collection == null)
            return null;

        var products = await _getProductsHandler.Handle(
            new GetProductsQuery(Page: 1, PageSize: 100, CollectionSlug: slug, Sort: sort),
            cancellationToken);

        return new CollectionDetailDto(
            collection.Id,
            collection.Name,
            collection.Slug,
            collection.Mood,
            collection.Story,
            collection.Description,
            collection.ImageUrl,
            products.Items);
    }
}

public record CollectionDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Mood { get; init; }
    public string? Story { get; init; }
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public int ProductCount { get; init; }
}

public record CollectionDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? Mood,
    string? Story,
    string? Description,
    string? ImageUrl,
    List<ProductDto> Products);
