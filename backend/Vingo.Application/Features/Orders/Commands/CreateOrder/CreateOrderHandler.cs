using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Orders;
using Vingo.Domain.ValueObjects;

namespace Vingo.Application.Features.Orders.Commands.CreateOrder;

public record CreateOrderCommand(
    Guid? UserId,
    string? SessionId,
    string CustomerName,
    string CustomerEmail,
    string? CustomerPhone,
    string? CustomerNotes,
    string PaymentMethod = "quote",
    string ShippingMethod = "standard",
    string? AddressLine1 = null,
    string? AddressLine2 = null,
    string? City = null,
    string? State = null,
    string? PostalCode = null,
    string? Country = null
);

public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.CustomerEmail).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.CustomerPhone).MaximumLength(40);
        RuleFor(x => x.CustomerNotes).MaximumLength(1000);
        // Address required for real orders, optional for "quote" inquiries
        RuleFor(x => x.AddressLine1)
            .NotEmpty().When(x => !string.Equals(x.PaymentMethod, "quote", StringComparison.OrdinalIgnoreCase))
            .MaximumLength(200);
        RuleFor(x => x.City)
            .NotEmpty().When(x => !string.Equals(x.PaymentMethod, "quote", StringComparison.OrdinalIgnoreCase))
            .MaximumLength(100);
        RuleFor(x => x.State)
            .NotEmpty().When(x => !string.Equals(x.PaymentMethod, "quote", StringComparison.OrdinalIgnoreCase))
            .MaximumLength(50);
        RuleFor(x => x.PostalCode)
            .NotEmpty().When(x => !string.Equals(x.PaymentMethod, "quote", StringComparison.OrdinalIgnoreCase))
            .MaximumLength(20);
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.SessionId))
            .WithMessage("An order requires a user or a guest session");
    }
}

public class CreateOrderHandler
{
    private readonly IApplicationDbContext _context;
    private readonly CreateOrderValidator _validator = new();

    public CreateOrderHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        // Get the cart (user or guest session)
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(
                c => (command.UserId != null && c.UserId == command.UserId)
                     || (command.SessionId != null && c.SessionId == command.SessionId),
                cancellationToken);

        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("Cart is empty");

        // Create order items with product snapshots; prices are
        // recalculated server-side — never trusted from the client.
        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cart.Items)
        {
            var product = await _context.Products
                .Include(p => p.Materials)
                .Include(p => p.Sizes)
                .FirstOrDefaultAsync(p => p.Id == cartItem.ProductId, cancellationToken);

            if (product == null)
                throw new KeyNotFoundException($"Product {cartItem.ProductId} not found");

            var unitPrice = product.CalculateFinalPrice(cartItem.MaterialId, cartItem.SizeId);

            string? materialName = null;
            if (cartItem.MaterialId.HasValue)
            {
                materialName = product.Materials.FirstOrDefault(m => m.Id == cartItem.MaterialId.Value)?.Name;
            }

            string? colorName = null;
            if (cartItem.ColorId.HasValue)
            {
                colorName = await _context.Colors
                    .Where(c => c.Id == cartItem.ColorId.Value)
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            string? sizeLabel = null;
            if (cartItem.SizeId.HasValue)
            {
                sizeLabel = product.Sizes.FirstOrDefault(s => s.Id == cartItem.SizeId.Value)?.Label;
            }

            orderItems.Add(new OrderItem(
                cartItem.ProductId,
                product.Name,
                product.Slug,
                cartItem.Quantity,
                unitPrice,
                materialName,
                colorName,
                sizeLabel,
                cartItem.Mount,
                cartItem.WidthInches,
                cartItem.HeightInches
            ));
        }

        var shippingAddress = string.IsNullOrWhiteSpace(command.AddressLine1)
            ? null
            : new ShippingAddress(
                command.AddressLine1,
                command.AddressLine2,
                command.City!,
                command.State!,
                command.PostalCode!,
                command.Country ?? "US");

        var order = Order.Create(
            command.UserId,
            command.SessionId,
            orderItems,
            command.PaymentMethod,
            command.ShippingMethod,
            command.CustomerName,
            command.CustomerEmail,
            command.CustomerPhone,
            shippingAddress);

        _context.Orders.Add(order);

        // Clear cart
        cart.Clear();

        await _context.SaveChangesAsync(cancellationToken);

        return OrderMapper.Map(order);
    }
}

public record OrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public decimal Subtotal { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string? ShippingMethod { get; init; }
    public DateTime CreatedAt { get; init; }
    public int ItemCount { get; init; }
    public List<OrderItemDto> Items { get; init; } = [];
    public ShippingAddressDto? ShippingAddress { get; init; }
}

public record ShippingAddressDto
{
    public string Line1 { get; init; } = string.Empty;
    public string? Line2 { get; init; }
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string Country { get; init; } = "US";
}

public record OrderItemDto
{
    public string ProductName { get; init; } = string.Empty;
    public string ProductSlug { get; init; } = string.Empty;
    public string? MaterialName { get; init; }
    public string? ColorName { get; init; }
    public string? SizeLabel { get; init; }
    public string? Mount { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal TotalPrice { get; init; }
}

public static class OrderMapper
{
    public static OrderDto Map(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status.ToString(),
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            Subtotal = order.Subtotal.Amount,
            ShippingCost = order.ShippingCost.Amount,
            TaxAmount = order.TaxAmount.Amount,
            TotalAmount = order.TotalAmount.Amount,
            ShippingMethod = order.ShippingMethod,
            CreatedAt = order.CreatedAt,
            ItemCount = order.Items.Sum(i => i.Quantity),
            ShippingAddress = order.ShippingAddress == null
                ? null
                : new ShippingAddressDto
                {
                    Line1 = order.ShippingAddress.Line1,
                    Line2 = order.ShippingAddress.Line2,
                    City = order.ShippingAddress.City,
                    State = order.ShippingAddress.State,
                    PostalCode = order.ShippingAddress.PostalCode,
                    Country = order.ShippingAddress.Country
                },
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductName = i.ProductName,
                ProductSlug = i.ProductSlug,
                MaterialName = i.MaterialName,
                ColorName = i.ColorName,
                SizeLabel = i.SizeLabel,
                Mount = i.Mount,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice.Amount,
                TotalPrice = i.TotalPrice.Amount
            }).ToList()
        };
    }
}
