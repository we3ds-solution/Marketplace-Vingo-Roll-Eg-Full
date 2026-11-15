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
public class NeedsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public NeedsController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Name,
        string Slug,
        string? Description,
        string? Icon,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Needs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLowerInvariant();
            query = query.Where(n => n.Name.ToLower().Contains(q) || n.Slug.Contains(q));
        }

        var needs = await query
            .OrderBy(n => n.SortOrder)
            .ThenBy(n => n.Name)
            .Select(n => new
            {
                n.Id, n.Name, n.Slug, n.Description, n.Icon,
                n.SortOrder, n.IsActive,
                ProductCount = n.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(needs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var need = await _context.Needs
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (need == null)
        {
            return NotFound(new { error = "Need not found" });
        }

        return Ok(new
        {
            need.Id, need.Name, need.Slug, need.Description, need.Icon, need.SortOrder, need.IsActive
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

        var need = new Need(
            request.Slug.Trim().ToLowerInvariant(),
            request.Name.Trim(),
            request.Description,
            request.Icon);

        need.UpdateDetails(
            request.Name, request.Slug, request.Description, request.Icon,
            request.SortOrder, request.IsActive);

        _context.Needs.Add(need);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { need.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var need = await _context.Needs
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (need == null)
        {
            return NotFound(new { error = "Need not found" });
        }

        var error = await ValidateAsync(request, need.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        need.UpdateDetails(
            request.Name, request.Slug, request.Description, request.Icon,
            request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { need.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var need = await _context.Needs
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

        if (need == null)
        {
            return NotFound(new { error = "Need not found" });
        }

        _context.Needs.Remove(need);
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
        var taken = await _context.Needs
            .AnyAsync(n => n.Slug == slug && n.Id != existingId, cancellationToken);

        if (taken)
            return $"A need with the slug '{slug}' already exists";

        return null;
    }
}
