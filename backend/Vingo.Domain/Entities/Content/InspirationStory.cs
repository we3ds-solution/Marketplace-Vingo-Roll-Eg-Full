using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Content;

public class InspirationStory : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Excerpt { get; private set; }
    public string? HeroImageUrl { get; private set; }

    public string? RoomSlug { get; private set; }
    public string? Style { get; private set; }
    public string? Treatment { get; private set; }

    public int SortOrder { get; private set; }
    public bool IsPublished { get; private set; } = true;

    private readonly List<InspirationSection> _sections = new();
    public IReadOnlyCollection<InspirationSection> Sections => _sections.AsReadOnly();

    private readonly List<Catalog.Product> _products = new();
    public IReadOnlyCollection<Catalog.Product> Products => _products.AsReadOnly();

    private InspirationStory() { } // EF Core

    public InspirationStory(
        string slug,
        string title,
        string? excerpt = null,
        string? heroImageUrl = null,
        string? roomSlug = null,
        string? style = null,
        string? treatment = null)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Story slug is required");

        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Story title is required");

        Slug = slug.Trim().ToLowerInvariant();
        Title = title;
        Excerpt = excerpt;
        HeroImageUrl = heroImageUrl;
        RoomSlug = roomSlug;
        Style = style;
        Treatment = treatment;
    }

    public void AddSection(string body, string? heading = null, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(body))
            throw new DomainException("Section body is required");

        _sections.Add(new InspirationSection(Id, body, heading, imageUrl, _sections.Count));
    }

    public void AddProduct(Catalog.Product product)
    {
        if (!_products.Contains(product))
            _products.Add(product);
    }

    public void UpdateDetails(
        string title,
        string? excerpt,
        string? heroImageUrl,
        string? roomSlug,
        string? style,
        string? treatment,
        int sortOrder,
        bool isPublished)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Story title is required");

        Title = title.Trim();
        Excerpt = excerpt;
        HeroImageUrl = heroImageUrl;
        RoomSlug = roomSlug;
        Style = style;
        Treatment = treatment;
        SortOrder = sortOrder;
        IsPublished = isPublished;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Replace body sections wholesale (admin editor).</summary>
    public void ReplaceSections(IReadOnlyList<(string? Heading, string Body, string? ImageUrl)> sections)
    {
        _sections.Clear();

        foreach (var (heading, body, imageUrl) in sections)
        {
            if (!string.IsNullOrWhiteSpace(body))
            {
                _sections.Add(new InspirationSection(Id, body, heading, imageUrl, _sections.Count));
            }
        }
    }

    /// <summary>Replace featured products wholesale (admin editor).</summary>
    public void ReplaceProducts(IReadOnlyList<Catalog.Product> products)
    {
        _products.Clear();
        _products.AddRange(products);
    }
}
