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
public class RoomsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public RoomsController(IApplicationDbContext context)
    {
        _context = context;
    }

    public sealed record UpsertRequest(
        string Name,
        string Slug,
        string? Description,
        string? ImageUrl,
        string[] RecommendedCategorySlugs,
        int SortOrder,
        bool IsActive);

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Rooms.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLowerInvariant();
            query = query.Where(r => r.Name.ToLower().Contains(q) || r.Slug.Contains(q));
        }

        var rooms = await query
            .OrderBy(r => r.SortOrder)
            .ThenBy(r => r.Name)
            .Select(r => new
            {
                r.Id, r.Name, r.Slug, r.Description, r.ImageUrl,
                RecommendedCategorySlugs = r.RecommendedCategorySlugs,
                r.SortOrder, r.IsActive,
                ProductCount = r.Products.Count(p => p.IsActive)
            })
            .ToListAsync(cancellationToken);

        return Ok(rooms);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (room == null)
        {
            return NotFound(new { error = "Room not found" });
        }

        return Ok(new
        {
            room.Id, room.Name, room.Slug, room.Description, room.ImageUrl,
            RecommendedCategorySlugs = room.RecommendedCategorySlugs,
            room.SortOrder, room.IsActive
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

        var room = new Room(
            request.Slug.Trim().ToLowerInvariant(),
            request.Name.Trim(),
            request.Description,
            request.ImageUrl,
            request.RecommendedCategorySlugs);

        room.UpdateDetails(
            request.Name, request.Slug, request.Description, request.ImageUrl,
            request.RecommendedCategorySlugs ?? [], request.SortOrder, request.IsActive);

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusCode(StatusCodes.Status201Created, new { room.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertRequest request, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (room == null)
        {
            return NotFound(new { error = "Room not found" });
        }

        var error = await ValidateAsync(request, room.Id, cancellationToken);
        if (error != null)
        {
            return BadRequest(new { error });
        }

        room.UpdateDetails(
            request.Name, request.Slug, request.Description, request.ImageUrl,
            request.RecommendedCategorySlugs ?? [], request.SortOrder, request.IsActive);

        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { room.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (room == null)
        {
            return NotFound(new { error = "Room not found" });
        }

        _context.Rooms.Remove(room);
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
        var taken = await _context.Rooms
            .AnyAsync(r => r.Slug == slug && r.Id != existingId, cancellationToken);

        if (taken)
            return $"A room with the slug '{slug}' already exists";

        return null;
    }
}
