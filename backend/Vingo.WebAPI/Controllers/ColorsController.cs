using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ColorsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ColorsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetColors()
    {
        var colors = await _context.Colors
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.HexCode,
                c.Family
            })
            .ToListAsync();

        return Ok(colors);
    }
}
