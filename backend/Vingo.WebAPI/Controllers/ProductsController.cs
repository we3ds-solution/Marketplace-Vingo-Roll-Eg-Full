using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Catalog.Queries.GetProducts;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly GetProductsHandler _getProductsHandler;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        GetProductsHandler getProductsHandler,
        ILogger<ProductsController> logger)
    {
        _getProductsHandler = getProductsHandler;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of products
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? featured = null,
        [FromQuery] bool? bestseller = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetProductsQuery(page, pageSize, category, search, featured, bestseller);
        var result = await _getProductsHandler.Handle(query, cancellationToken);
        
        return Ok(result);
    }

    /// <summary>
    /// Get featured products
    /// </summary>
    [HttpGet("featured")]
    [ProducesResponseType(typeof(PaginatedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeaturedProducts(CancellationToken cancellationToken)
    {
        var query = new GetProductsQuery(Page: 1, PageSize: 12, IsFeatured: true);
        var result = await _getProductsHandler.Handle(query, cancellationToken);
        
        return Ok(result);
    }

    /// <summary>
    /// Get bestseller products
    /// </summary>
    [HttpGet("bestsellers")]
    [ProducesResponseType(typeof(PaginatedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBestsellers(CancellationToken cancellationToken)
    {
        var query = new GetProductsQuery(Page: 1, PageSize: 12, IsBestseller: true);
        var result = await _getProductsHandler.Handle(query, cancellationToken);
        
        return Ok(result);
    }
}
