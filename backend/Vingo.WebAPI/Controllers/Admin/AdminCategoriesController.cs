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
public class CategoriesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CategoriesController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Name,
        string Slug,
        string? Tagline,
        string? Description,
        string? ImageUrl,
        string? Group,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Categories.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLowerInvariant();
            query = query.Where(c => c.Name.ToLower().Contains(q) || c.Slug.Contains(q));
        }

        var categories = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Tagline, c.Description, c.ImageUrl, c.Group,
                c.SortOrder, c.IsActive, c.ParentId,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            return NotFound(new { error = "Category not found" });
        }

        return Ok(new
        {
            category.Id, category.Name, category.Slug, category.Tagline, category.Description,
            category.ImageUrl, category.Group, category.SortOrder, category.IsActive, category.ParentId
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

        var category = new Category(
            request.Name.Trim(),
            request.Slug.Trim().ToLowerInvariant(),
            request.Description,
            request.ImageUrl,
            request.Tagline,
            request.Group);

        category.UpdateDetails(
            request.Name, request.Slug, request.Tagline, request.Description,
            request.ImageUrl, request.Group, request.SortOrder, request.IsActive);

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { category.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            return NotFound(new { error = "Category not found" });
        }

        var error = await ValidateAsync(request, category.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        category.UpdateDetails(
            request.Name, request.Slug, request.Tagline, request.Description,
            request.ImageUrl, request.Group, request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { category.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            return NotFound(new { error = "Category not found" });
        }

        var hasChildren = await _context.Categories
            .AnyAsync(c => c.ParentId == category.Id, cancellationToken);

        if (hasChildren)
        {
            return Conflict(new { error = "Reassign or delete child categories first" });
        }

        _context.Categories.Remove(category);
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
        var taken = await _context.Categories
            .AnyAsync(c => c.Slug == slug && c.Id != existingId, cancellationToken);

        if (taken)
            return $"A category with the slug '{slug}' already exists";

        return null;
    }
}
