using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Vingo.Application.Features.Marketing.Commands.CreateLead;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class LeadsController : ControllerBase
{
    private readonly CreateLeadHandler _createLeadHandler;

    public LeadsController(CreateLeadHandler createLeadHandler)
    {
        _createLeadHandler = createLeadHandler;
    }

    /// <summary>
    /// Capture a lead (quote request, swatch request, consultation or contact form)
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("marketing")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLead(
        [FromBody] CreateLeadRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateLeadCommand(
            request.LeadType,
            request.Name,
            request.Email,
            request.Phone,
            request.Message,
            request.ProductSlug,
            request.Source);

        var lead = await _createLeadHandler.Handle(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, lead);
    }
}

public record CreateLeadRequest(
    string LeadType,
    string Name,
    string Email,
    string? Phone = null,
    string? Message = null,
    string? ProductSlug = null,
    string? Source = null);
