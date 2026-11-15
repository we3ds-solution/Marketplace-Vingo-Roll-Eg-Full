using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Cart.Commands.AddToCart;
using Vingo.Application.Features.Cart.Commands.RemoveCartItem;
using Vingo.Application.Features.Cart.Commands.UpdateCartItem;
using Vingo.Application.Features.Cart.Common;
using Vingo.Application.Features.Cart.Queries.GetCart;
using Vingo.WebAPI.Common;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class CartController : ControllerBase
{
    private readonly GetCartHandler _getCartHandler;
    private readonly AddToCartHandler _addToCartHandler;
    private readonly UpdateCartItemHandler _updateCartItemHandler;
    private readonly RemoveCartItemHandler _removeCartItemHandler;
    private readonly ClearCartHandler _clearCartHandler;

    public CartController(
        GetCartHandler getCartHandler,
        AddToCartHandler addToCartHandler,
        UpdateCartItemHandler updateCartItemHandler,
        RemoveCartItemHandler removeCartItemHandler,
        ClearCartHandler clearCartHandler)
    {
        _getCartHandler = getCartHandler;
        _addToCartHandler = addToCartHandler;
        _updateCartItemHandler = updateCartItemHandler;
        _removeCartItemHandler = removeCartItemHandler;
        _clearCartHandler = clearCartHandler;
    }

    /// <summary>
    /// Get the current cart (guest session or signed-in user)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Get(HttpContext);
        var cart = await _getCartHandler.Handle(null, sessionId, cancellationToken);
        return Ok(cart);
    }

    /// <summary>
    /// Add an item to the cart
    /// </summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddToCart(
        [FromBody] AddToCartRequest request,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Ensure(HttpContext);

        var command = new AddToCartCommand(
            null,
            sessionId,
            request.ProductId,
            request.Quantity,
            request.MaterialId,
            request.ColorId,
            request.SizeId,
            request.Mount,
            request.WidthInches,
            request.HeightInches);

        var cart = await _addToCartHandler.Handle(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, cart);
    }

    /// <summary>
    /// Change the quantity of a cart item (0 removes the item)
    /// </summary>
    [HttpPut("items/{itemId:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCartItem(
        Guid itemId,
        [FromBody] UpdateCartItemRequest request,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Ensure(HttpContext);

        var command = new UpdateCartItemCommand(null, sessionId, itemId, request.Quantity);
        var cart = await _updateCartItemHandler.Handle(command, cancellationToken);
        return Ok(cart);
    }

    /// <summary>
    /// Remove a single item from the cart
    /// </summary>
    [HttpDelete("items/{itemId:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveCartItem(
        Guid itemId,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Ensure(HttpContext);

        var command = new RemoveCartItemCommand(null, sessionId, itemId);
        var cart = await _removeCartItemHandler.Handle(command, cancellationToken);
        return Ok(cart);
    }

    /// <summary>
    /// Clear the entire cart
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Get(HttpContext);

        // Nothing to clear and no session — return an empty cart
        var cart = await _clearCartHandler.Handle(new ClearCartCommand(null, sessionId), cancellationToken);
        return Ok(cart);
    }
}

public record AddToCartRequest(
    Guid ProductId,
    int Quantity,
    Guid? MaterialId = null,
    Guid? ColorId = null,
    Guid? SizeId = null,
    string? Mount = null,
    decimal? WidthInches = null,
    decimal? HeightInches = null);

public record UpdateCartItemRequest(int Quantity);
