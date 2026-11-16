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
public class StatsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public StatsController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Dashboard overview counts
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var products = await _context.Products.CountAsync(cancellationToken);
        var activeProducts = await _context.Products.CountAsync(p => p.IsActive, cancellationToken);
        var categories = await _context.Categories.CountAsync(cancellationToken);
        var collections = await _context.Collections.CountAsync(cancellationToken);
        var orders = await _context.Orders.CountAsync(cancellationToken);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending, cancellationToken);
        var leads = await _context.Leads.CountAsync(cancellationToken);
        var newLeads = await _context.Leads.CountAsync(l => l.Status == LeadStatus.New, cancellationToken);
        var pendingVendors = await _context.VendorApplications.CountAsync(
            v => v.Status == Vingo.Domain.Enums.VendorApplicationStatus.Pending, cancellationToken);
        var vendors = await _context.VendorApplications.CountAsync(
            v => v.Status == Vingo.Domain.Enums.VendorApplicationStatus.Approved, cancellationToken);
        var subscribers = await _context.NewsletterSubscribers.CountAsync(s => s.IsActive, cancellationToken);
        var reviews = await _context.Reviews.CountAsync(cancellationToken);
        var stories = await _context.InspirationStories.CountAsync(cancellationToken);

        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                status = o.Status.ToString(),
                customerName = o.CustomerName,
                totalAmount = o.TotalAmount.Amount,
                o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            products,
            activeProducts,
            categories,
            collections,
            orders,
            pendingOrders,
            leads,
            newLeads,
            pendingVendors,
            vendors,
            subscribers,
            reviews,
            stories,
            recentOrders
        });
    }
}
