using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Features.Orders.Commands.CreateOrder;
using Vingo.Application.Features.Orders.Queries.GetOrder;
using Vingo.WebAPI.Common;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly CreateOrderHandler _createOrderHandler;
    private readonly GetOrderHandler _getOrderHandler;
    private readonly IApplicationDbContext _context;

    public OrdersController(
        CreateOrderHandler createOrderHandler,
        GetOrderHandler getOrderHandler,
        IApplicationDbContext context)
    {
        _createOrderHandler = createOrderHandler;
        _getOrderHandler = getOrderHandler;
        _context = context;
    }

    /// <summary>
    /// Create an order from the current cart (guest session checkout)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Ensure(HttpContext);
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        Guid? userId = Guid.TryParse(sub, out var parsed) ? parsed : null;

        var command = new CreateOrderCommand(
            userId,
            sessionId,
            request.CustomerName,
            request.CustomerEmail,
            request.CustomerPhone,
            request.CustomerNotes,
            request.PaymentMethod ?? "quote",
            request.ShippingMethod ?? "standard",
            request.Street1,
            request.Street2,
            request.City,
            request.State,
            request.PostalCode,
            request.Country);

        var order = await _createOrderHandler.Handle(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, order);
    }

    /// <summary>
    /// Get an order by id (guests may only read their own session's orders)
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(
        Guid id,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Get(HttpContext);
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        Guid? userId = Guid.TryParse(sub, out var parsed) ? parsed : null;
        var isAdmin = User.IsInRole("Admin");

        var order = await _getOrderHandler.Handle(id, userId, sessionId, isAdmin, cancellationToken);

        if (order == null)
        {
            return NotFound(new { error = "Order not found" });
        }

        return Ok(order);
    }

    /// <summary>
    /// Get the current signed-in user's orders, newest first.
    /// Orders placed as a guest are not visible here — sign in before checkout to link them.
    /// </summary>
    [Authorize]
    [HttpGet("mine")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MyOrders(CancellationToken cancellationToken)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(sub, out var userId))
        {
            return Unauthorized();
        }

        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(20)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                status = o.Status.ToString(),
                totalAmount = o.TotalAmount.Amount,
                itemCount = o.Items.Sum(i => i.Quantity),
                o.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }
}

public record CreateOrderRequest(
    string CustomerName,
    string CustomerEmail,
    string? CustomerPhone = null,
    string? CustomerNotes = null,
    string? PaymentMethod = null,
    string? ShippingMethod = null,
    string? Street1 = null,
    string? Street2 = null,
    string? City = null,
    string? State = null,
    string? PostalCode = null,
    string? Country = null);
