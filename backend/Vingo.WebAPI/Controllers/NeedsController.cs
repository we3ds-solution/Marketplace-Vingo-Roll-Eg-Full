using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Vingo.Application.Features.Catalog.Queries.GetNeeds;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class NeedsController : ControllerBase
{
    private readonly GetNeedsHandler _getNeedsHandler;

    public NeedsController(GetNeedsHandler getNeedsHandler)
    {
        _getNeedsHandler = getNeedsHandler;
    }

    /// <summary>
    /// Get all shopper needs/use-cases with product counts
    /// </summary>
    [HttpGet]
    [OutputCache(Duration = 300)]
    [ProducesResponseType(typeof(List<NeedDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNeeds(CancellationToken cancellationToken)
    {
        var needs = await _getNeedsHandler.Handle(cancellationToken);
        return Ok(needs);
    }
}
