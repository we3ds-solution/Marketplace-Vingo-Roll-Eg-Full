using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class SubscribersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SubscribersController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// List newsletter subscribers
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken = default)
    {
        var subscribers = await _context.NewsletterSubscribers
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.Email,
                s.IsActive,
                s.UnsubscribedAt,
                s.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(subscribers);
    }

    /// <summary>
    /// Unsubscribe a subscriber (keeps the row for consent evidence)
    /// </summary>
    [HttpPatch("{id:guid}/unsubscribe")]
    public async Task<IActionResult> Unsubscribe(Guid id, CancellationToken cancellationToken)
    {
        var subscriber = await _context.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (subscriber == null)
        {
            return NotFound(new { error = "Subscriber not found" });
        }

        subscriber.Unsubscribe();
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { subscriber.Id, subscriber.IsActive });
    }

    /// <summary>
    /// Delete a subscriber record entirely
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var subscriber = await _context.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (subscriber == null)
        {
            return NotFound(new { error = "Subscriber not found" });
        }

        _context.NewsletterSubscribers.Remove(subscriber);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
