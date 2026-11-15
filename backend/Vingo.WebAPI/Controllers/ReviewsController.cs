using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Vingo.Application.Features.Catalog.Commands.AddReview;
using Vingo.Application.Features.Catalog.Queries.GetReviews;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ReviewsController : ControllerBase
{
    private readonly GetReviewsHandler _getReviewsHandler;
    private readonly AddReviewHandler _addReviewHandler;

    public ReviewsController(
        GetReviewsHandler getReviewsHandler,
        AddReviewHandler addReviewHandler)
    {
        _getReviewsHandler = getReviewsHandler;
        _addReviewHandler = addReviewHandler;
    }

    /// <summary>
    /// Get reviews for a product
    /// </summary>
    [HttpGet("{productSlug}")]
    [ProducesResponseType(typeof(List<ReviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(
        string productSlug,
        CancellationToken cancellationToken)
    {
        var reviews = await _getReviewsHandler.Handle(productSlug, cancellationToken);
        return Ok(reviews);
    }

    /// <summary>
    /// Add a review (recomputes the product's aggregate rating)
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("marketing")]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddReview(
        [FromBody] AddReviewRequest request,
        CancellationToken cancellationToken)
    {
        var command = new AddReviewCommand(
            request.ProductSlug,
            request.Author,
            request.Rating,
            request.Title,
            request.Body);

        var review = await _addReviewHandler.Handle(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, review);
    }
}

public record AddReviewRequest(
    string ProductSlug,
    string Author,
    int Rating,
    string? Title,
    string? Body);
