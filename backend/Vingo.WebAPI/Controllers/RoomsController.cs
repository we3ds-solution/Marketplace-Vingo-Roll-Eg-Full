using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Vingo.Application.Features.Catalog.Queries.GetRooms;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class RoomsController : ControllerBase
{
    private readonly GetRoomsHandler _getRoomsHandler;
    private readonly GetRoomBySlugHandler _getRoomBySlugHandler;

    public RoomsController(
        GetRoomsHandler getRoomsHandler,
        GetRoomBySlugHandler getRoomBySlugHandler)
    {
        _getRoomsHandler = getRoomsHandler;
        _getRoomBySlugHandler = getRoomBySlugHandler;
    }

    /// <summary>
    /// Get all rooms with recommended category slugs
    /// </summary>
    [HttpGet]
    [OutputCache(Duration = 300)]
    [ProducesResponseType(typeof(List<RoomDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRooms(CancellationToken cancellationToken)
    {
        var rooms = await _getRoomsHandler.Handle(cancellationToken);
        return Ok(rooms);
    }

    /// <summary>
    /// Get a single room and its products
    /// </summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoomBySlug(
        string slug,
        [FromQuery] string? sort,
        CancellationToken cancellationToken)
    {
        var room = await _getRoomBySlugHandler.Handle(slug, sort, cancellationToken);

        if (room == null)
        {
            return NotFound(new { error = "Room not found" });
        }

        return Ok(room);
    }
}
