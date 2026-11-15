namespace Vingo.Application.Features.Cart.Commands.AddToCart;

public record AddToCartCommand(
    Guid? UserId,
    string? SessionId,
    Guid ProductId,
    int Quantity,
    Guid? MaterialId = null,
    Guid? ColorId = null,
    decimal? WidthInches = null,
    decimal? HeightInches = null
);
