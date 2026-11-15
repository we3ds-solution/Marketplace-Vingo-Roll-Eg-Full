using System.Reflection;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Seed-time helpers shared across seed classes.
/// </summary>
public static class SeedSupport
{
    /// <summary>Set a private/init-only setter (seed-time only).</summary>
    public static void Set<T>(T entity, string propertyName, object value) where T : class
        => typeof(T).GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance)!
            .SetValue(entity, value);
}
