namespace Vingo.Application.Features.Orders.Commands.CreateOrder;

public record CreateOrderCommand(
    Guid UserId,
    string PaymentMethod,
    string ShippingMethod = "standard",
    string? CustomerNotes = null
);
