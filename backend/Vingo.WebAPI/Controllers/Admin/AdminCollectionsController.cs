using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class CollectionsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CollectionsController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Name,
        string Slug,
        string? Mood,
        string? Story,
        string? Description,
        string? ImageUrl,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Collections.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLowerInvariant();
            query = query.Where(c => c.Name.ToLower().Contains(q) || c.Slug.Contains(q));
        }

        var collections = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Mood, c.Story, c.Description, c.ImageUrl,
                c.SortOrder, c.IsActive,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(collections);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (collection == null)
        {
            return NotFound(new { error = "Collection not found" });
        }

        return Ok(new
        {
            collection.Id, collection.Name, collection.Slug, collection.Mood, collection.Story,
            collection.Description, collection.ImageUrl, collection.SortOrder, collection.IsActive
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var error = await ValidateAsync(request, null, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        var collection = new Collection(
            request.Name.Trim(),
            request.Slug.Trim().ToLowerInvariant(),
            request.Description,
            request.Mood,
            request.Story);

        collection.UpdateDetails(
            request.Name, request.Slug, request.Mood, request.Story, request.Description,
            request.ImageUrl, request.SortOrder, request.IsActive);

        _context.Collections.Add(collection);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { collection.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (collection == null)
        {
            return NotFound(new { error = "Collection not found" });
        }

        var error = await ValidateAsync(request, collection.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        collection.UpdateDetails(
            request.Name, request.Slug, request.Mood, request.Story, request.Description,
            request.ImageUrl, request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { collection.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (collection == null)
        {
            return NotFound(new { error = "Collection not found" });
        }

        _context.Collections.Remove(collection);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<string?> ValidateAsync(UpsertRequest request, Guid? existingId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return "Name is required";

        if (string.IsNullOrWhiteSpace(request.Slug))
            return "Slug is required";

        var slug = request.Slug.Trim().ToLowerInvariant();
        var taken = await _context.Collections
            .AnyAsync(c => c.Slug == slug && c.Id != existingId, cancellationToken);

        if (taken)
            return $"A collection with the slug '{slug}' already exists";

        return null;
    }
}
