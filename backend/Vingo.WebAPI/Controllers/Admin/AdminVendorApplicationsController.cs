using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Enums;
using Vingo.Infrastructure.Identity;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/vendor-applications")]
[Produces("application/json")]
public class VendorApplicationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<VingoUser> _userManager;

    public VendorApplicationsController(IApplicationDbContext context, UserManager<VingoUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    private sealed record VendorApplicationItem(
        Guid Id, Guid UserId, string CompanyName, string Message, string Status,
        string UserEmail, string UserDisplayName, DateTime CreatedAt, DateTime? DecidedAt);

    /// <summary>
    /// List vendor applications, newest first, optionally filtered by status
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.VendorApplications.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<VendorApplicationStatus>(status, ignoreCase: true, out var parsed))
        {
            query = query.Where(v => v.Status == parsed);
        }

        var applications = await query
            .OrderByDescending(v => v.CreatedAt)
            .Take(200)
            .ToListAsync(cancellationToken);

        var userIds = applications.Select(a => a.UserId).Distinct().ToList();
        var users = await _userManager.Users
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.Email, u.DisplayName })
            .ToListAsync(cancellationToken);

        var userMap = users.ToDictionary(u => u.Id);

        var items = applications.Select(a => new VendorApplicationItem(
            a.Id, a.UserId, a.CompanyName, a.Message, a.Status.ToString(),
            userMap.GetValueOrDefault(a.UserId)?.Email ?? "unknown",
            userMap.GetValueOrDefault(a.UserId)?.DisplayName ?? "unknown",
            a.CreatedAt, a.DecidedAt)).ToList();

        return Ok(items);
    }

    /// <summary>
    /// Approve a vendor application — the user becomes a Vendor immediately
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var application = await _context.VendorApplications
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (application == null)
        {
            return NotFound(new { error = "Application not found" });
        }

        if (application.Status != VendorApplicationStatus.Pending)
        {
            return BadRequest(new { error = $"Application is already {application.Status.ToString().ToLowerInvariant()}" });
        }

        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var adminId = Guid.TryParse(sub, out var parsedAdmin) ? parsedAdmin : Guid.Empty;

        application.Approve(adminId);

        var user = await _userManager.FindByIdAsync(application.UserId.ToString());
        if (user != null && !await _userManager.IsInRoleAsync(user, "Vendor"))
        {
            await _userManager.AddToRoleAsync(user, "Vendor");
        }

        _context.AppNotifications.Add(new Domain.Entities.Account.AppNotification(
            application.UserId,
            "Welcome aboard, vendor!",
            $"Your vendor application for {application.CompanyName} has been approved. Your account is now a Vendor account — sign out and back in to see it."));

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { application.Id, status = application.Status.ToString() });
    }

    /// <summary>
    /// Reject a vendor application with an optional reason
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(
        Guid id,
        [FromBody] RejectRequest request,
        CancellationToken cancellationToken)
    {
        var application = await _context.VendorApplications
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (application == null)
        {
            return NotFound(new { error = "Application not found" });
        }

        if (application.Status != VendorApplicationStatus.Pending)
        {
            return BadRequest(new { error = $"Application is already {application.Status.ToString().ToLowerInvariant()}" });
        }

        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var adminId = Guid.TryParse(sub, out var parsedAdmin) ? parsedAdmin : Guid.Empty;

        application.Reject(adminId, request.Reason);

        _context.AppNotifications.Add(new Domain.Entities.Account.AppNotification(
            application.UserId,
            "Vendor application update",
            request.Reason is { Length: > 0 }
                ? $"Your vendor application was not approved: {request.Reason}"
                : "Your vendor application was not approved at this time. Please contact the studio for details."));

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { application.Id, status = application.Status.ToString() });
    }

    public sealed record RejectRequest(string? Reason);
}
