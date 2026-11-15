using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Cart.Common;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Application.Features.Cart.Queries.GetCart;

public class GetCartHandler
{
    private readonly IApplicationDbContext _context;

    public GetCartHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Loads the current session/user cart. Returns an empty cart DTO when none exists.</summary>
    public async Task<CartDto> Handle(
        Guid? userId,
        string? sessionId,
        CancellationToken cancellationToken = default)
    {
        var cart = await FindCartAsync(userId, sessionId, cancellationToken);

        if (cart == null)
        {
            return new CartDto { Id = Guid.Empty, ItemCount = 0, Subtotal = 0, Shipping = 0, Total = 0, Items = [] };
        }

        return await CartMapper.MapAsync(_context, cart, cancellationToken);
    }

    public static async Task<Domain.Entities.Shopping.Cart?> FindCartAsync(
        IApplicationDbContext context,
        Guid? userId,
        string? sessionId,
        CancellationToken cancellationToken = default)
    {
        if (userId.HasValue)
        {
            return await context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId.Value, cancellationToken);
        }

        if (!string.IsNullOrWhiteSpace(sessionId))
        {
            return await context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.SessionId == sessionId, cancellationToken);
        }

        return null;
    }

    private async Task<Domain.Entities.Shopping.Cart?> FindCartAsync(Guid? userId, string? sessionId, CancellationToken cancellationToken)
    {
        return await FindCartAsync(_context, userId, sessionId, cancellationToken);
    }
}
