using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public NotificationsController(IApplicationDbContext context)
    {
        _context = context;
    }

    private sealed record NotificationItem(
        Guid Id, string Title, string Body, bool IsRead, DateTime CreatedAt);

    /// <summary>
    /// Get the current user's notifications, newest first
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Mine(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var notifications = await _context.AppNotifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationItem(n.Id, n.Title, n.Body, n.IsRead, n.CreatedAt))
            .ToListAsync(cancellationToken);

        var unreadCount = notifications.Count(n => !n.IsRead);

        return Ok(new { items = notifications, unreadCount });
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var notification = await _context.AppNotifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);

        if (notification == null)
        {
            return NotFound(new { error = "Notification not found" });
        }

        notification.MarkRead();
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { notification.Id, notification.IsRead });
    }

    /// <summary>
    /// Mark every unread notification as read
    /// </summary>
    [HttpPost("read-all")]
    public async Task<IActionResult> ReadAll(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var unread = await _context.AppNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in unread)
        {
            notification.MarkRead();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { marked = unread.Count });
    }

    private Guid? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
