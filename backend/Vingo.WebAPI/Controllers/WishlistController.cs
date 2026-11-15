using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Wishlist.Commands.AddToWishlist;
using Vingo.Application.Features.Wishlist.Commands.RemoveFromWishlist;
using Vingo.Application.Features.Wishlist.Common;
using Vingo.WebAPI.Common;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class WishlistController : ControllerBase
{
    private readonly GetWishlistHandler _getWishlistHandler;
    private readonly AddToWishlistHandler _addToWishlistHandler;
    private readonly RemoveFromWishlistHandler _removeFromWishlistHandler;
    private readonly ClearWishlistHandler _clearWishlistHandler;

    public WishlistController(
        GetWishlistHandler getWishlistHandler,
        AddToWishlistHandler addToWishlistHandler,
        RemoveFromWishlistHandler removeFromWishlistHandler,
        ClearWishlistHandler clearWishlistHandler)
    {
        _getWishlistHandler = getWishlistHandler;
        _addToWishlistHandler = addToWishlistHandler;
        _removeFromWishlistHandler = removeFromWishlistHandler;
        _clearWishlistHandler = clearWishlistHandler;
    }

    /// <summary>
    /// Get the current wishlist (guest session or signed-in user)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWishlist(CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Get(HttpContext);
        var wishlist = await _getWishlistHandler.Handle(null, sessionId, cancellationToken);
        return Ok(wishlist);
    }

    /// <summary>
    /// Add a product to the wishlist by slug (idempotent)
    /// </summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddToWishlist(
        [FromBody] WishlistItemRequest request,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Ensure(HttpContext);

        var command = new AddToWishlistCommand(null, sessionId, request.ProductSlug);
        var wishlist = await _addToWishlistHandler.Handle(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, wishlist);
    }

    /// <summary>
    /// Remove a product from the wishlist by slug
    /// </summary>
    [HttpDelete("items/{productSlug}")]
    [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveFromWishlist(
        string productSlug,
        CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Ensure(HttpContext);

        var command = new RemoveFromWishlistCommand(null, sessionId, productSlug);
        var wishlist = await _removeFromWishlistHandler.Handle(command, cancellationToken);
        return Ok(wishlist);
    }

    /// <summary>
    /// Clear the entire wishlist
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(typeof(WishlistDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearWishlist(CancellationToken cancellationToken)
    {
        var sessionId = GuestSession.Get(HttpContext);

        var wishlist = await _clearWishlistHandler.Handle(
            new ClearWishlistCommand(null, sessionId),
            cancellationToken);
        return Ok(wishlist);
    }
}

public record WishlistItemRequest(string ProductSlug);
