using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Orders;
using Vingo.Domain.ValueObjects;

namespace Vingo.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderHandler
{
    private readonly IApplicationDbContext _context;

    public CreateOrderHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand command, CancellationToken cancellationToken = default)
    {
        // Get user's cart
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == command.UserId, cancellationToken);

        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("Cart is empty");

        // Create order items with product snapshots
        var orderItems = new List<OrderItem>();
        
        foreach (var cartItem in cart.Items)
        {
            var product = await _context.Products
                .Include(p => p.Materials)
                .FirstOrDefaultAsync(p => p.Id == cartItem.ProductId, cancellationToken);

            if (product == null)
                throw new KeyNotFoundException($"Product {cartItem.ProductId} not found");

            // Recalculate price (security - never trust client)
            var unitPrice = product.CalculateFinalPrice(cartItem.MaterialId, cartItem.WidthInches);

            var orderItem = new OrderItem(
                cartItem.ProductId,
                product.Name,
                product.Slug,
                cartItem.Quantity,
                unitPrice,
                null, // Material name - TODO
                null, // Color name - TODO
                cartItem.WidthInches,
                cartItem.HeightInches
            );

            orderItems.Add(orderItem);
        }

        // Create order
        var order = Order.Create(
            command.UserId,
            orderItems,
            command.PaymentMethod,
            command.ShippingMethod
        );

        _context.Orders.Add(order);

        // Clear cart
        cart.Clear();

        await _context.SaveChangesAsync(cancellationToken);

        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status.ToString(),
            Subtotal = order.Subtotal.Amount,
            ShippingCost = order.ShippingCost.Amount,
            TaxAmount = order.TaxAmount.Amount,
            TotalAmount = order.TotalAmount.Amount,
            CreatedAt = order.CreatedAt,
            ItemCount = order.Items.Count
        };
    }
}

public record OrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Subtotal { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public int ItemCount { get; init; }
}
