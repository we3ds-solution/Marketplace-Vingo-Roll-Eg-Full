using Vingo.Domain.Common;
using Vingo.Domain.Enums;

namespace Vingo.Domain.Entities.Orders;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; private set; }
    public OrderStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public Guid? CreatedByUserId { get; private set; }

    private OrderStatusHistory() { } // EF Core

    public OrderStatusHistory(Guid orderId, OrderStatus status, string? notes = null, Guid? createdBy = null)
    {
        OrderId = orderId;
        Status = status;
        Notes = notes;
        CreatedByUserId = createdBy;
    }
}
