using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Vingo.Application.Features.Content.Queries.GetInspirationStories;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class InspirationController : ControllerBase
{
    private readonly GetInspirationStoriesHandler _getStoriesHandler;
    private readonly GetStoryBySlugHandler _getStoryBySlugHandler;

    public InspirationController(
        GetInspirationStoriesHandler getStoriesHandler,
        GetStoryBySlugHandler getStoryBySlugHandler)
    {
        _getStoriesHandler = getStoriesHandler;
        _getStoryBySlugHandler = getStoryBySlugHandler;
    }

    /// <summary>
    /// Get all published inspiration stories (optionally filtered by room)
    /// </summary>
    [HttpGet]
    [OutputCache(Duration = 300)]
    [ProducesResponseType(typeof(List<StoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStories(
        [FromQuery] string? room,
        CancellationToken cancellationToken)
    {
        var stories = await _getStoriesHandler.Handle(room, cancellationToken);
        return Ok(stories);
    }

    /// <summary>
    /// Get a single inspiration story with body sections and featured products
    /// </summary>
    [HttpGet("{slug}")]
    [OutputCache(Duration = 300)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStoryBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var story = await _getStoryBySlugHandler.Handle(slug, cancellationToken);

        if (story == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        return Ok(story);
    }
}
