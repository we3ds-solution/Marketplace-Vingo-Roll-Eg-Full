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
public class SizesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SizesController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Slug,
        string Label,
        decimal WidthInches,
        decimal HeightInches,
        decimal PriceDelta,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken = default)
    {
        var sizes = await _context.Sizes
            .OrderBy(s => s.SortOrder)
            .Select(s => new
            {
                s.Id, s.Slug, s.Label, s.WidthInches, s.HeightInches, s.PriceDelta,
                s.SortOrder, s.IsActive,
                ProductCount = s.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(sizes);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var size = await _context.Sizes
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (size == null)
        {
            return NotFound(new { error = "Size not found" });
        }

        return Ok(new
        {
            size.Id, size.Slug, size.Label, size.WidthInches, size.HeightInches,
            size.PriceDelta, size.SortOrder, size.IsActive
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

        var size = new Size(
            request.Slug.Trim().ToLowerInvariant(),
            request.Label.Trim(),
            request.WidthInches,
            request.HeightInches,
            request.PriceDelta);

        size.UpdateDetails(
            request.Slug, request.Label, request.WidthInches, request.HeightInches,
            request.PriceDelta, request.SortOrder, request.IsActive);

        _context.Sizes.Add(size);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { size.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var size = await _context.Sizes
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (size == null)
        {
            return NotFound(new { error = "Size not found" });
        }

        var error = await ValidateAsync(request, size.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        size.UpdateDetails(
            request.Slug, request.Label, request.WidthInches, request.HeightInches,
            request.PriceDelta, request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { size.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var size = await _context.Sizes
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (size == null)
        {
            return NotFound(new { error = "Size not found" });
        }

        _context.Sizes.Remove(size);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<string?> ValidateAsync(UpsertRequest request, Guid? existingId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Slug))
            return "Slug is required";

        if (string.IsNullOrWhiteSpace(request.Label))
            return "Label is required";

        if (request.PriceDelta < 0)
            return "Price delta cannot be negative";

        var slug = request.Slug.Trim().ToLowerInvariant();
        var taken = await _context.Sizes
            .AnyAsync(s => s.Slug == slug && s.Id != existingId, cancellationToken);

        if (taken)
            return $"A size with the slug '{slug}' already exists";

        return null;
    }
}
