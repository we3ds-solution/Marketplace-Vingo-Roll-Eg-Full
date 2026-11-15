using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Catalog.Queries.GetCategories;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class CategoriesController : ControllerBase
{
    private readonly GetCategoriesHandler _getCategoriesHandler;

    public CategoriesController(GetCategoriesHandler getCategoriesHandler)
    {
        _getCategoriesHandler = getCategoriesHandler;
    }

    /// <summary>
    /// Get all categories
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _getCategoriesHandler.Handle(cancellationToken);
        return Ok(categories);
    }
}
