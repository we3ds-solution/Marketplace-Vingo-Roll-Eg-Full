using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Catalog.Queries.GetCategories;

public class GetCategoriesHandler
{
    private readonly IApplicationDbContext _context;

    public GetCategoriesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> Handle(CancellationToken cancellationToken = default)
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Tagline = c.Tagline,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                Group = c.Group,
                ProductCount = c.Products.Count(p => p.IsActive),
                ParentId = c.ParentId
            })
            .ToListAsync(cancellationToken);

        return categories;
    }
}

public record CategoryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Tagline { get; init; }
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string? Group { get; init; }
    public int ProductCount { get; init; }
    public Guid? ParentId { get; init; }
}
