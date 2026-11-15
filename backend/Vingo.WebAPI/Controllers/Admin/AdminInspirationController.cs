using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Content;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class InspirationController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public InspirationController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record StorySection(string? Heading, string Body, string? ImageUrl);

    public sealed record UpsertRequest(
        string Slug,
        string Title,
        string? Excerpt,
        string? HeroImageUrl,
        string? RoomSlug,
        string? Style,
        string? Treatment,
        int SortOrder,
        bool IsPublished,
        List<StorySection> Sections,
        string[] ProductSlugs);

    private sealed record StoryListItem(
        Guid Id, string Slug, string Title, string? Excerpt, string? HeroImageUrl,
        string? RoomSlug, string? Style, string? Treatment,
        int SortOrder, bool IsPublished, int SectionCount, int ProductCount);

    private sealed record StoryDetail(
        Guid Id, string Slug, string Title, string? Excerpt, string? HeroImageUrl,
        string? RoomSlug, string? Style, string? Treatment,
        int SortOrder, bool IsPublished,
        List<StorySection> Sections, string[] ProductSlugs);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken = default)
    {
        var stories = await _context.InspirationStories
            .Include(s => s.Sections)
            .Include(s => s.Products)
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);

        var items = stories.Select(s => new StoryListItem(
            s.Id, s.Slug, s.Title, s.Excerpt, s.HeroImageUrl,
            s.RoomSlug, s.Style, s.Treatment,
            s.SortOrder, s.IsPublished,
            s.Sections.Count, s.Products.Count)).ToList();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var story = await _context.InspirationStories
            .Include(s => s.Sections.OrderBy(x => x.SortOrder))
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (story == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        return Ok(MapDetail(story));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var error = await ValidateAsync(request, null, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        var story = new InspirationStory(
            request.Slug.Trim().ToLowerInvariant(),
            request.Title.Trim(),
            request.Excerpt,
            request.HeroImageUrl,
            request.RoomSlug,
            request.Style,
            request.Treatment);

        story.Id = Guid.NewGuid();
        story.UpdateDetails(
            request.Title, request.Excerpt, request.HeroImageUrl,
            request.RoomSlug, request.Style, request.Treatment,
            request.SortOrder, request.IsPublished);

        story.ReplaceSections(request.Sections
            .Select(s => (s.Heading, s.Body, s.ImageUrl))
            .ToList());

        await AssignProductsAsync(story, request.ProductSlugs, cancellationToken);

        _context.InspirationStories.Add(story);
        await _context.SaveChangesAsync(cancellationToken);

        var reloaded = await ReloadAsync(story.Id, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, MapDetail(reloaded!));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var story = await ReloadAsync(id, cancellationToken);
        if (story == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        var error = await ValidateAsync(request, story.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        story.UpdateDetails(
            request.Title, request.Excerpt, request.HeroImageUrl,
            request.RoomSlug, request.Style, request.Treatment,
            request.SortOrder, request.IsPublished);

        story.ReplaceSections(request.Sections
            .Select(s => (s.Heading, s.Body, s.ImageUrl))
            .ToList());

        await AssignProductsAsync(story, request.ProductSlugs, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        var reloaded = await ReloadAsync(story.Id, cancellationToken);
        return Ok(MapDetail(reloaded!));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var story = await _context.InspirationStories
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (story == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        _context.InspirationStories.Remove(story);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<InspirationStory?> ReloadAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.InspirationStories
            .Include(s => s.Sections)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    private async Task AssignProductsAsync(
        InspirationStory story,
        string[]? productSlugs,
        CancellationToken cancellationToken)
    {
        var slugs = (productSlugs ?? [])
            .Select(s => s.Trim().ToLowerInvariant())
            .Distinct()
            .ToList();

        var products = slugs.Count == 0
            ? new List<Domain.Entities.Catalog.Product>()
            : await _context.Products
                .Where(p => slugs.Contains(p.Slug))
                .ToListAsync(cancellationToken);

        story.ReplaceProducts(products);
    }

    private async Task<string?> ValidateAsync(UpsertRequest request, Guid? existingId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Slug))
            return "Slug is required";

        if (string.IsNullOrWhiteSpace(request.Title))
            return "Title is required";

        if (request.Sections == null || request.Sections.Count == 0)
            return "Add at least one body section";

        var emptySection = request.Sections.Any(s => string.IsNullOrWhiteSpace(s.Body));
        if (emptySection)
            return "Every section needs a body";

        var slug = request.Slug.Trim().ToLowerInvariant();
        var taken = await _context.InspirationStories
            .AnyAsync(s => s.Slug == slug && s.Id != existingId, cancellationToken);

        if (taken)
            return $"A story with the slug '{slug}' already exists";

        return null;
    }

    private static StoryDetail MapDetail(InspirationStory story) => new(
        story.Id, story.Slug, story.Title, story.Excerpt, story.HeroImageUrl,
        story.RoomSlug, story.Style, story.Treatment,
        story.SortOrder, story.IsPublished,
        story.Sections
            .OrderBy(s => s.SortOrder)
            .Select(s => new StorySection(s.Heading, s.Body, s.ImageUrl))
            .ToList(),
        story.Products.Select(p => p.Slug).OrderBy(s => s).ToArray());
}
