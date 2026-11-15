using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Enums;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class MaterialsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public MaterialsController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Name,
        string Slug,
        string Tier,
        decimal PriceDelta,
        string? Description,
        string? SwatchImageUrl,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken = default)
    {
        var materials = await _context.Materials
            .OrderBy(m => m.SortOrder)
            .Select(m => new
            {
                m.Id, m.Name, m.Slug, Tier = m.Tier.ToString(), m.PriceDelta,
                m.Description, m.SwatchImageUrl, m.SortOrder, m.IsActive,
                ProductCount = m.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(materials);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var material = await _context.Materials
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (material == null)
        {
            return NotFound(new { error = "Material not found" });
        }

        return Ok(new
        {
            material.Id, material.Name, material.Slug, Tier = material.Tier.ToString(),
            material.PriceDelta, material.Description, material.SwatchImageUrl,
            material.SortOrder, material.IsActive
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

        var material = new Material(
            request.Name.Trim(),
            request.Slug.Trim().ToLowerInvariant(),
            Enum.Parse<MaterialTier>(request.Tier, ignoreCase: true),
            request.PriceDelta);

        material.UpdateDetails(
            request.Name, request.Slug,
            Enum.Parse<MaterialTier>(request.Tier, ignoreCase: true),
            request.PriceDelta, request.Description, request.SwatchImageUrl,
            request.SortOrder, request.IsActive);

        _context.Materials.Add(material);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { material.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var material = await _context.Materials
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (material == null)
        {
            return NotFound(new { error = "Material not found" });
        }

        var error = await ValidateAsync(request, material.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        material.UpdateDetails(
            request.Name, request.Slug,
            Enum.Parse<MaterialTier>(request.Tier, ignoreCase: true),
            request.PriceDelta, request.Description, request.SwatchImageUrl,
            request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { material.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var material = await _context.Materials
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (material == null)
        {
            return NotFound(new { error = "Material not found" });
        }

        _context.Materials.Remove(material);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<string?> ValidateAsync(UpsertRequest request, Guid? existingId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return "Name is required";

        if (string.IsNullOrWhiteSpace(request.Slug))
            return "Slug is required";

        if (request.PriceDelta < 0)
            return "Price delta cannot be negative";

        if (!Enum.TryParse<MaterialTier>(request.Tier, ignoreCase: true, out _))
            return "Tier must be Essential, Signature or Couture";

        var slug = request.Slug.Trim().ToLowerInvariant();
        var taken = await _context.Materials
            .AnyAsync(m => m.Slug == slug && m.Id != existingId, cancellationToken);

        if (taken)
            return $"A material with the slug '{slug}' already exists";

        return null;
    }
}
