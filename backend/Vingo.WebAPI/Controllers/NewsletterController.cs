using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Vingo.Application.Features.Marketing.Commands.SubscribeNewsletter;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class NewsletterController : ControllerBase
{
    private readonly SubscribeNewsletterHandler _subscribeHandler;

    public NewsletterController(SubscribeNewsletterHandler subscribeHandler)
    {
        _subscribeHandler = subscribeHandler;
    }

    /// <summary>
    /// Subscribe to the newsletter (idempotent — re-activates unsubscribed emails)
    /// </summary>
    [HttpPost("subscribe")]
    [EnableRateLimiting("marketing")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Subscribe(
        [FromBody] SubscribeNewsletterRequest request,
        CancellationToken cancellationToken)
    {
        await _subscribeHandler.Handle(
            new SubscribeNewsletterCommand(request.Email),
            cancellationToken);

        return Ok(new { subscribed = true });
    }
}

public record SubscribeNewsletterRequest(string Email);
