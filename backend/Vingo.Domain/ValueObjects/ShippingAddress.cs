namespace Vingo.Domain.ValueObjects;

public record ShippingAddress
{
    public string Line1 { get; init; } = string.Empty;
    public string? Line2 { get; init; }
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string Country { get; init; } = "US";

    private ShippingAddress() { } // EF Core

    public ShippingAddress(
        string line1,
        string? line2,
        string city,
        string state,
        string postalCode,
        string country = "US")
    {
        if (string.IsNullOrWhiteSpace(line1))
            throw new ArgumentException("Address line 1 is required", nameof(line1));

        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City is required", nameof(city));

        if (string.IsNullOrWhiteSpace(state))
            throw new ArgumentException("State is required", nameof(state));

        if (string.IsNullOrWhiteSpace(postalCode))
            throw new ArgumentException("Postal code is required", nameof(postalCode));

        Line1 = line1.Trim();
        Line2 = string.IsNullOrWhiteSpace(line2) ? null : line2.Trim();
        City = city.Trim();
        State = state.Trim().ToUpperInvariant();
        PostalCode = postalCode.Trim();
        Country = string.IsNullOrWhiteSpace(country) ? "US" : country.Trim().ToUpperInvariant();
    }
}
