using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Enums;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class LeadsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public LeadsController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// List leads, newest first, optionally filtered by status or type
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        [FromQuery] string? type,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Leads.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<LeadStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            query = query.Where(l => l.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(type) &&
            Enum.TryParse<LeadType>(type, ignoreCase: true, out var parsedType))
        {
            query = query.Where(l => l.LeadType == parsedType);
        }

        var leads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(200)
            .Select(l => new
            {
                l.Id,
                type = l.LeadType.ToString(),
                status = l.Status.ToString(),
                l.Name,
                l.Email,
                l.Phone,
                l.Message,
                l.ProductSlug,
                l.Source,
                l.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(leads);
    }

    public sealed record StatusUpdateRequest(string Status);

    /// <summary>
    /// Update a lead's status
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] StatusUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<LeadStatus>(request.Status, ignoreCase: true, out var newStatus))
        {
            return BadRequest(new
            {
                error = $"Status must be one of: {string.Join(", ", Enum.GetNames<LeadStatus>())}"
            });
        }

        var lead = await _context.Leads
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

        if (lead == null)
        {
            return NotFound(new { error = "Lead not found" });
        }

        lead.SetStatus(newStatus);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { lead.Id, status = lead.Status.ToString() });
    }
}
