using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Orders.Commands.CreateOrder;

namespace Vingo.Application.Features.Orders.Queries.GetOrder;

public class GetOrderHandler
{
    private readonly IApplicationDbContext _context;

    public GetOrderHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto?> Handle(
        Guid id,
        Guid? userId,
        string? sessionId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order == null)
            return null;

        if (!isAdmin && !CanRead(order.UserId, order.SessionId, userId, sessionId))
            return null;

        return OrderMapper.Map(order);
    }

    /// <summary>Owner, guest session owner or admin may read an order.</summary>
    public static bool CanRead(Guid? orderUserId, string? orderSessionId, Guid? userId, string? sessionId)
    {
        if (orderUserId.HasValue)
        {
            return userId == orderUserId;
        }

        return orderSessionId != null && orderSessionId == sessionId;
    }
}
