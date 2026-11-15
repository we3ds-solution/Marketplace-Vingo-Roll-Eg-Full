namespace Vingo.WebAPI.Common;

/// <summary>
/// Guest session handling via an HttpOnly cookie. The storefront has no
/// sign-in (JWT is a later milestone), so carts, wishlists and orders are
/// keyed by an anonymous session identifier.
/// </summary>
public static class GuestSession
{
    public const string CookieName = "vingo_session";
    private const int CookieExpiryDays = 90;

    /// <summary>Returns the existing session, or creates one (sets cookie).</summary>
    public static string Ensure(HttpContext context)
    {
        if (TryGet(context, out var existing))
        {
            return existing;
        }

        var sessionId = Guid.NewGuid().ToString("N");
        context.Response.Cookies.Append(CookieName, sessionId, BuildOptions(context));
        return sessionId;
    }

    /// <summary>Returns the existing session, or null when the guest has none.</summary>
    public static string? Get(HttpContext context) =>
        TryGet(context, out var existing) ? existing : null;

    private static bool TryGet(HttpContext context, out string sessionId)
    {
        if (context.Request.Cookies.TryGetValue(CookieName, out var value) &&
            !string.IsNullOrWhiteSpace(value) &&
            value.Length <= 64)
        {
            sessionId = value;
            return true;
        }

        sessionId = string.Empty;
        return false;
    }

    private static CookieOptions BuildOptions(HttpContext context) => new()
    {
        HttpOnly = true,
        SameSite = SameSiteMode.Lax,
        Secure = context.Request.IsHttps,
        Expires = DateTimeOffset.UtcNow.AddDays(CookieExpiryDays),
        IsEssential = true,
        Path = "/"
    };
}
