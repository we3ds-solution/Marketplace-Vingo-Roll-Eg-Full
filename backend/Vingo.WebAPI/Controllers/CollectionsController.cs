using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Vingo.Application.Features.Catalog.Queries.GetCollections;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class CollectionsController : ControllerBase
{
    private readonly GetCollectionsHandler _getCollectionsHandler;
    private readonly GetCollectionBySlugHandler _getCollectionBySlugHandler;

    public CollectionsController(
        GetCollectionsHandler getCollectionsHandler,
        GetCollectionBySlugHandler getCollectionBySlugHandler)
    {
        _getCollectionsHandler = getCollectionsHandler;
        _getCollectionBySlugHandler = getCollectionBySlugHandler;
    }

    /// <summary>
    /// Get all collections with product counts
    /// </summary>
    [HttpGet]
    [OutputCache(Duration = 300)]
    [ProducesResponseType(typeof(List<CollectionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCollections(CancellationToken cancellationToken)
    {
        var collections = await _getCollectionsHandler.Handle(cancellationToken);
        return Ok(collections);
    }

    /// <summary>
    /// Get a single collection and its products
    /// </summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCollectionBySlug(
        string slug,
        [FromQuery] string? sort,
        CancellationToken cancellationToken)
    {
        var collection = await _getCollectionBySlugHandler.Handle(slug, sort, cancellationToken);

        if (collection == null)
        {
            return NotFound(new { error = "Collection not found" });
        }

        return Ok(collection);
    }
}
