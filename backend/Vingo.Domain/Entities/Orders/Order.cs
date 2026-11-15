using Vingo.Domain.Common;
using Vingo.Domain.Enums;
using Vingo.Domain.ValueObjects;

namespace Vingo.Domain.Entities.Orders;

public class Order : BaseEntity
{
    public string OrderNumber { get; private set; } = string.Empty;
    public Guid? UserId { get; private set; }
    public string? SessionId { get; private set; }

    public OrderStatus Status { get; private set; }

    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }

    public ShippingAddress? ShippingAddress { get; private set; }

    public Money Subtotal { get; private set; } = Money.Zero;
    public Money ShippingCost { get; private set; } = Money.Zero;
    public Money TaxAmount { get; private set; } = Money.Zero;
    public Money DiscountAmount { get; private set; } = Money.Zero;
    public Money TotalAmount { get; private set; } = Money.Zero;
    
    public string? ShippingMethod { get; private set; }
    public string? TrackingNumber { get; private set; }
    public DateTime? EstimatedDeliveryDate { get; private set; }
    
    public string? PaymentMethod { get; private set; }
    
    public string? CustomerNotes { get; private set; }
    public string? InternalNotes { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private readonly List<OrderStatusHistory> _statusHistory = new();
    public IReadOnlyCollection<OrderStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

    private Order() { } // EF Core

    public static Order Create(
        Guid? userId,
        string? sessionId,
        List<OrderItem> items,
        string paymentMethod,
        string? shippingMethod = null,
        string? customerName = null,
        string? customerEmail = null,
        string? customerPhone = null,
        ShippingAddress? shippingAddress = null)
    {
        if (items == null || !items.Any())
            throw new DomainException("Order must have at least one item");

        if (userId == null && string.IsNullOrWhiteSpace(sessionId))
            throw new DomainException("An order requires a user or a guest session");

        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            SessionId = sessionId,
            Status = OrderStatus.Pending,
            PaymentMethod = paymentMethod,
            ShippingMethod = shippingMethod ?? "standard",
            CustomerName = customerName,
            CustomerEmail = customerEmail,
            CustomerPhone = customerPhone,
            ShippingAddress = shippingAddress
        };

        foreach (var item in items)
        {
            order._items.Add(item);
        }

        order.RecalculateTotals();
        order.AddStatusHistory(OrderStatus.Pending, "Order created");

        return order;
    }

    public void RecalculateTotals()
    {
        Subtotal = _items.Aggregate(Money.Zero,
            (sum, item) => sum + item.TotalPrice);

        // Demo storefront rules (match the frontend cart): flat shipping,
        // free over $500, no tax line. Replace with real rules at launch.
        ShippingCost = Subtotal.Amount >= 500 ? Money.Zero : new Money(45.00m);
        TaxAmount = Money.Zero;

        TotalAmount = Subtotal + ShippingCost + TaxAmount - DiscountAmount;
    }

    public void UpdateStatus(OrderStatus newStatus, string? notes = null, Guid? userId = null)
    {
        if (Status == newStatus)
            return;

        Status = newStatus;
        AddStatusHistory(newStatus, notes, userId);
    }

    public void SetTrackingNumber(string trackingNumber, DateTime? estimatedDelivery = null)
    {
        if (string.IsNullOrWhiteSpace(trackingNumber))
            throw new DomainException("Tracking number is required");

        TrackingNumber = trackingNumber;
        EstimatedDeliveryDate = estimatedDelivery;
        UpdateStatus(OrderStatus.Shipped, $"Tracking number: {trackingNumber}");
    }

    public void SetInternalNotes(string? notes)
    {
        InternalNotes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Delivered)
            throw new DomainException("Cannot cancel a delivered order");

        if (Status == OrderStatus.Cancelled)
            throw new DomainException("Order is already cancelled");

        UpdateStatus(OrderStatus.Cancelled, reason);
    }

    private void AddStatusHistory(OrderStatus status, string? notes = null, Guid? userId = null)
    {
        _statusHistory.Add(new OrderStatusHistory(Id, status, notes, userId));
    }

    private static string GenerateOrderNumber()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = new Random().Next(10000, 99999);
        return $"ORD-{timestamp}-{random}";
    }
}
