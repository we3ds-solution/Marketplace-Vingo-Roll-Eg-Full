using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MaterialsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public MaterialsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMaterials()
    {
        var materials = await _context.Materials
            .Where(m => m.IsActive)
            .OrderBy(m => m.SortOrder)
            .Select(m => new
            {
                m.Id,
                m.Name,
                m.Slug,
                Tier = m.Tier.ToString(),
                m.PriceDelta,
                m.Description,
                m.SwatchImageUrl
            })
            .ToListAsync();

        return Ok(materials);
    }
}
