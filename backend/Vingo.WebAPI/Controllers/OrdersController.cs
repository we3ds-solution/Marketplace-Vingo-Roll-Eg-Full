using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Orders.Commands.CreateOrder;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly CreateOrderHandler _createOrderHandler;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        CreateOrderHandler createOrderHandler,
        ILogger<OrdersController> logger)
    {
        _createOrderHandler = createOrderHandler;
        _logger = logger;
    }

    /// <summary>
    /// Create new order from cart
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        // TODO: Get userId from authenticated user
        var userId = Guid.NewGuid(); // Temporary - replace with real auth

        var command = new CreateOrderCommand(
            userId,
            request.PaymentMethod,
            request.ShippingMethod ?? "standard",
            request.CustomerNotes
        );

        var order = await _createOrderHandler.Handle(command, cancellationToken);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetOrder(Guid id)
    {
        // TODO: Implement
        return Ok(new { message = "Get order - coming soon" });
    }

    /// <summary>
    /// Get user's orders
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetMyOrders()
    {
        // TODO: Implement
        return Ok(new { message = "Get my orders - coming soon" });
    }
}

public record CreateOrderRequest(
    string PaymentMethod,
    string? ShippingMethod = null,
    string? CustomerNotes = null
);
