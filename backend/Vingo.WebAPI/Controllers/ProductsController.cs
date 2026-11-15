using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Catalog.Queries.GetProducts;
using Vingo.Application.Features.Catalog.Queries.GetProductBySlug;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly GetProductsHandler _getProductsHandler;
    private readonly GetProductBySlugHandler _getProductBySlugHandler;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        GetProductsHandler getProductsHandler,
        GetProductBySlugHandler getProductBySlugHandler,
        ILogger<ProductsController> logger)
    {
        _getProductsHandler = getProductsHandler;
        _getProductBySlugHandler = getProductBySlugHandler;
        _logger = logger;
    }

    /// <summary>
    /// Get a paginated list of products with filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? category = null,
        [FromQuery] string? collection = null,
        [FromQuery] string? room = null,
        [FromQuery] string? need = null,
        [FromQuery] string? search = null,
        [FromQuery] string? lightControl = null,
        [FromQuery] string? materialTier = null,
        [FromQuery] string? style = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] bool? isBestseller = null,
        [FromQuery] bool? isOnSale = null,
        [FromQuery] string? sort = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetProductsQuery(
            page,
            pageSize,
            category,
            collection,
            room,
            need,
            search,
            lightControl,
            materialTier,
            style,
            minPrice,
            maxPrice,
            isFeatured,
            isBestseller,
            isOnSale,
            sort);

        var result = await _getProductsHandler.Handle(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get full product detail by slug (options, images, reviews, related products)
    /// </summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var product = await _getProductBySlugHandler.Handle(slug, cancellationToken);

        if (product == null)
        {
            return NotFound(new { error = "Product not found" });
        }

        return Ok(product);
    }
}
