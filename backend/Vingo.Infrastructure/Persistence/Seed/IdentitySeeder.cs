using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vingo.Infrastructure.Identity;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Seeds the Admin/Customer roles and the initial admin account.
/// Admin credentials come from configuration (AdminSettings:Email/Password) —
/// override them for any deployment that matters.
/// </summary>
public static class IdentitySeeder
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<VingoUser>>();

        foreach (var role in new[] { "Admin", "Customer", "Vendor" })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        var email = (configuration["AdminSettings:Email"] ?? "admin@vingoroll.com").Trim().ToLowerInvariant();
        var password = configuration["AdminSettings:Password"] ?? "Admin!2026";
        var displayName = configuration["AdminSettings:DisplayName"] ?? "Vingo Admin";

        var admin = await userManager.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (admin == null)
        {
            admin = new VingoUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                NormalizedEmail = email.ToUpperInvariant(),
                NormalizedUserName = email.ToUpperInvariant(),
                DisplayName = displayName,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, password);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to seed admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        if (!await userManager.IsInRoleAsync(admin, "Admin"))
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
