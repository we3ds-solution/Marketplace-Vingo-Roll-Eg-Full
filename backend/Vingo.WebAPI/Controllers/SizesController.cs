using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SizesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SizesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [OutputCache(Duration = 300)]
    public async Task<IActionResult> GetSizes(CancellationToken cancellationToken)
    {
        var sizes = await _context.Sizes
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .Select(s => new
            {
                s.Id,
                s.Slug,
                s.Label,
                s.WidthInches,
                s.HeightInches,
                s.PriceDelta
            })
            .ToListAsync(cancellationToken);

        return Ok(sizes);
    }
}
