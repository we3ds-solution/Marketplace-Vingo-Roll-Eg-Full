using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Catalog.Queries.GetProductBySlug;

namespace Vingo.Application.Features.Content.Queries.GetInspirationStories;

public class GetInspirationStoriesHandler
{
    private readonly IApplicationDbContext _context;

    public GetInspirationStoriesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StoryDto>> Handle(
        string? roomSlug = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.InspirationStories
            .Where(s => s.IsPublished)
            .OrderBy(s => s.SortOrder)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(roomSlug))
        {
            query = query.Where(s => s.RoomSlug == roomSlug);
        }

        var stories = await query
            .Select(s => new StoryDto
            {
                Id = s.Id,
                Slug = s.Slug,
                Title = s.Title,
                Excerpt = s.Excerpt,
                ImageUrl = s.HeroImageUrl,
                RoomSlug = s.RoomSlug,
                Style = s.Style,
                Treatment = s.Treatment,
                ProductCount = s.Products.Count()
            })
            .ToListAsync(cancellationToken);

        return stories;
    }
}

public class GetStoryBySlugHandler
{
    private readonly IApplicationDbContext _context;

    public GetStoryBySlugHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StoryDetailDto?> Handle(
        string slug,
        CancellationToken cancellationToken = default)
    {
        var story = await _context.InspirationStories
            .Include(s => s.Sections.OrderBy(x => x.SortOrder))
            .Include(s => s.Products)
            .ThenInclude(p => p.Images)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Slug == slug && s.IsPublished, cancellationToken);

        if (story == null)
            return null;

        return new StoryDetailDto
        {
            Id = story.Id,
            Slug = story.Slug,
            Title = story.Title,
            Excerpt = story.Excerpt,
            ImageUrl = story.HeroImageUrl,
            RoomSlug = story.RoomSlug,
            Style = story.Style,
            Treatment = story.Treatment,
            Sections = story.Sections
                .Select(x => new StorySectionDto(x.Heading, x.Body, x.ImageUrl))
                .ToList(),
            Products = story.Products.Select(p => new RelatedProductDto
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
            }).ToList()
        };
    }
}

public record StoryDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Excerpt { get; init; }
    public string? ImageUrl { get; init; }
    public string? RoomSlug { get; init; }
    public string? Style { get; init; }
    public string? Treatment { get; init; }
    public int ProductCount { get; init; }
}

public record StorySectionDto(string? Heading, string Body, string? ImageUrl);

public record StoryDetailDto
{
    public Guid Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Excerpt { get; init; }
    public string? ImageUrl { get; init; }
    public string? RoomSlug { get; init; }
    public string? Style { get; init; }
    public string? Treatment { get; init; }
    public List<StorySectionDto> Sections { get; init; } = [];
    public List<RelatedProductDto> Products { get; init; } = [];
}
