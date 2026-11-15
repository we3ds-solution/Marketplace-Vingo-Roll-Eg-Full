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
public class OrdersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public OrdersController(IApplicationDbContext context)
    {
        _context = context;
    }

    private sealed record OrderListItem(
        Guid Id, string OrderNumber, string Status, string? CustomerName, string? CustomerEmail,
        decimal TotalAmount, int ItemCount, DateTime CreatedAt, string? ShippingMethod);

    public sealed record StatusUpdateRequest(string Status, string? Notes);

    public sealed record NotesRequest(string? InternalNotes);

    /// <summary>
    /// List orders, optionally filtered by status
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var ordersQuery = _context.Orders
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsed))
        {
            ordersQuery = ordersQuery.Where(o => o.Status == parsed);
        }

        var total = await ordersQuery.CountAsync(cancellationToken);

        var orders = await ordersQuery
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = orders.Select(o => new OrderListItem(
            o.Id, o.OrderNumber, o.Status.ToString(),
            o.CustomerName, o.CustomerEmail,
            o.TotalAmount.Amount, o.Items.Sum(i => i.Quantity),
            o.CreatedAt, o.ShippingMethod)).ToList();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>
    /// Get an order with items and history
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory.OrderByDescending(h => h.CreatedAt))
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order == null)
        {
            return NotFound(new { error = "Order not found" });
        }

        return Ok(new
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            status = order.Status.ToString(),
            customerName = order.CustomerName,
            customerEmail = order.CustomerEmail,
            customerPhone = order.CustomerPhone,
            customerNotes = order.CustomerNotes,
            internalNotes = order.InternalNotes,
            shippingMethod = order.ShippingMethod,
            trackingNumber = order.TrackingNumber,
            subtotal = order.Subtotal.Amount,
            shippingCost = order.ShippingCost.Amount,
            taxAmount = order.TaxAmount.Amount,
            totalAmount = order.TotalAmount.Amount,
            order.CreatedAt,
            shippingAddress = order.ShippingAddress == null ? null : new
            {
                order.ShippingAddress.Line1,
                order.ShippingAddress.Line2,
                order.ShippingAddress.City,
                order.ShippingAddress.State,
                order.ShippingAddress.PostalCode,
                order.ShippingAddress.Country
            },
            items = order.Items.Select(i => new
            {
                i.ProductName, i.ProductSlug, i.MaterialName, i.ColorName, i.SizeLabel, i.Mount,
                i.Quantity,
                unitPrice = i.UnitPrice.Amount,
                totalPrice = i.TotalPrice.Amount
            }),
            statusHistory = order.StatusHistory.Select(h => new
            {
                status = h.Status.ToString(),
                h.Notes,
                h.CreatedAt
            })
        });
    }

    /// <summary>
    /// Update an order's status (Pending → Confirmed → Processing → Shipped → Delivered / Cancelled / Refunded)
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] StatusUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, ignoreCase: true, out var newStatus))
        {
            return BadRequest(new
            {
                error = $"Status must be one of: {string.Join(", ", Enum.GetNames<OrderStatus>())}"
            });
        }

        var order = await _context.Orders
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order == null)
        {
            return NotFound(new { error = "Order not found" });
        }

        order.UpdateStatus(newStatus, string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim());
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { order.Id, status = order.Status.ToString() });
    }

    /// <summary>
    /// Set or clear the internal notes on an order
    /// </summary>
    [HttpPatch("{id:guid}/notes")]
    public async Task<IActionResult> UpdateNotes(
        Guid id,
        [FromBody] NotesRequest request,
        CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order == null)
        {
            return NotFound(new { error = "Order not found" });
        }

        order.SetInternalNotes(request.InternalNotes);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { order.Id, internalNotes = order.InternalNotes });
    }
}
