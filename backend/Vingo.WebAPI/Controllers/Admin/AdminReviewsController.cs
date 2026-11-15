using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/v1/admin/[controller]")]
[Produces("application/json")]
public class ReviewsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ReviewsController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// List reviews with product info, newest first
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var reviews = await _context.Reviews
            .AsNoTracking()
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                productSlug = r.Product.Slug,
                productName = r.Product.Name,
                author = r.AuthorName,
                r.Rating,
                r.Title,
                r.Body,
                verified = r.IsVerifiedPurchase,
                r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(reviews);
    }

    /// <summary>
    /// Delete a review
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (review == null)
        {
            return NotFound(new { error = "Review not found" });
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
