using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Catalog.Queries.GetProducts;

namespace Vingo.Application.Features.Catalog.Queries.GetRooms;

public class GetRoomsHandler
{
    private readonly IApplicationDbContext _context;

    public GetRoomsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RoomDto>> Handle(CancellationToken cancellationToken = default)
    {
        var rooms = await _context.Rooms
            .Where(r => r.IsActive)
            .OrderBy(r => r.SortOrder)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                Name = r.Name,
                Slug = r.Slug,
                Description = r.Description,
                ImageUrl = r.ImageUrl,
                RecommendedCategorySlugs = r.RecommendedCategorySlugs,
                ProductCount = r.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return rooms;
    }
}

public class GetRoomBySlugHandler
{
    private readonly IApplicationDbContext _context;
    private readonly GetProductsHandler _getProductsHandler;

    public GetRoomBySlugHandler(IApplicationDbContext context, GetProductsHandler getProductsHandler)
    {
        _context = context;
        _getProductsHandler = getProductsHandler;
    }

    public async Task<RoomDetailDto?> Handle(
        string slug,
        string? sort = null,
        CancellationToken cancellationToken = default)
    {
        var room = await _context.Rooms
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Slug == slug && r.IsActive, cancellationToken);

        if (room == null)
            return null;

        var products = await _getProductsHandler.Handle(
            new GetProductsQuery(Page: 1, PageSize: 100, RoomSlug: slug, Sort: sort),
            cancellationToken);

        return new RoomDetailDto(
            room.Id,
            room.Name,
            room.Slug,
            room.Description,
            room.ImageUrl,
            room.RecommendedCategorySlugs,
            products.Items);
    }
}

public record RoomDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string[] RecommendedCategorySlugs { get; init; } = [];
    public int ProductCount { get; init; }
}

public record RoomDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    string[] RecommendedCategorySlugs,
    List<ProductDto> Products);
