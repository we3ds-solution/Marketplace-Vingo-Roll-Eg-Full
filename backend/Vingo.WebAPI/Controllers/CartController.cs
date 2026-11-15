using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Cart.Commands.AddToCart;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class CartController : ControllerBase
{
    private readonly AddToCartHandler _addToCartHandler;
    private readonly ILogger<CartController> _logger;

    public CartController(
        AddToCartHandler addToCartHandler,
        ILogger<CartController> logger)
    {
        _addToCartHandler = addToCartHandler;
        _logger = logger;
    }

    /// <summary>
    /// Add item to cart (guest or authenticated)
    /// </summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddToCart(
        [FromBody] AddToCartRequest request,
        CancellationToken cancellationToken)
    {
        // Get session ID from cookie or generate new one
        var sessionId = Request.Cookies["SessionId"];
        if (string.IsNullOrEmpty(sessionId))
        {
            sessionId = Guid.NewGuid().ToString();
            Response.Cookies.Append("SessionId", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(30)
            });
        }

        var command = new AddToCartCommand(
            UserId: null, // TODO: Get from authenticated user
            SessionId: sessionId,
            request.ProductId,
            request.Quantity,
            request.MaterialId,
            request.ColorId,
            request.WidthInches,
            request.HeightInches
        );

        var cart = await _addToCartHandler.Handle(command, cancellationToken);

        return CreatedAtAction(nameof(GetCart), new { id = cart.Id }, cart);
    }

    /// <summary>
    /// Get current cart
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public IActionResult GetCart()
    {
        // TODO: Implement get cart
        return Ok(new { message = "Get cart - coming soon" });
    }
}

public record AddToCartRequest(
    Guid ProductId,
    int Quantity,
    Guid? MaterialId = null,
    Guid? ColorId = null,
    decimal? WidthInches = null,
    decimal? HeightInches = null
);
