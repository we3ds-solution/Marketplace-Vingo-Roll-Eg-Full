import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Vingo Roll Studio</h1>
        <p className="text-xl text-muted-foreground">
          Premium Made-to-Measure Window Treatments
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link 
            href="/shop" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Shop Now
          </Link>
          <Link 
            href="/about" 
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-2">🛍️ Products</h3>
            <p className="text-muted-foreground">Browse catalog</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🛒 Cart</h3>
            <p className="text-muted-foreground">Guest & user support</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📦 Orders</h3>
            <p className="text-muted-foreground">Full checkout flow</p>
          </div>
        </div>
      </div>
    </main>
  );
}
