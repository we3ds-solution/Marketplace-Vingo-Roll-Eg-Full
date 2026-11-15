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
public class ColorsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ColorsController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Name,
        string HexCode,
        string? Family,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken = default)
    {
        var colors = await _context.Colors
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id, c.Name, c.HexCode, c.Family, c.SortOrder, c.IsActive,
                ProductCount = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(colors);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var color = await _context.Colors
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (color == null)
        {
            return NotFound(new { error = "Color not found" });
        }

        return Ok(new
        {
            color.Id, color.Name, color.HexCode, color.Family, color.SortOrder, color.IsActive
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var error = Validate(request);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        var color = new Color(
            request.Name.Trim(),
            request.HexCode.Trim(),
            request.Family);

        color.UpdateDetails(
            request.Name, request.HexCode, request.Family,
            request.SortOrder, request.IsActive);

        _context.Colors.Add(color);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { color.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var color = await _context.Colors
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (color == null)
        {
            return NotFound(new { error = "Color not found" });
        }

        var error = Validate(request);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        color.UpdateDetails(
            request.Name, request.HexCode, request.Family,
            request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { color.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var color = await _context.Colors
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (color == null)
        {
            return NotFound(new { error = "Color not found" });
        }

        _context.Colors.Remove(color);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static string? Validate(UpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return "Name is required";

        if (string.IsNullOrWhiteSpace(request.HexCode))
            return "Hex code is required";

        var hex = request.HexCode.Trim().TrimStart('#');
        if (hex.Length is not (3 or 6 or 8) || !hex.All(c => Uri.IsHexDigit(c)))
            return "Hex code must be a valid #RGB/#RRGGBB/#RRGGBBAA";

        return null;
    }
}
