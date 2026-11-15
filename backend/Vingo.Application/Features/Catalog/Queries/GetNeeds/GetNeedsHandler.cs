using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Catalog.Queries.GetNeeds;

public class GetNeedsHandler
{
    private readonly IApplicationDbContext _context;

    public GetNeedsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<NeedDto>> Handle(CancellationToken cancellationToken = default)
    {
        var needs = await _context.Needs
            .Where(n => n.IsActive)
            .OrderBy(n => n.SortOrder)
            .Select(n => new NeedDto
            {
                Id = n.Id,
                Name = n.Name,
                Slug = n.Slug,
                Description = n.Description,
                Icon = n.Icon,
                ProductCount = n.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return needs;
    }
}

public record NeedDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Icon { get; init; }
    public int ProductCount { get; init; }
}
