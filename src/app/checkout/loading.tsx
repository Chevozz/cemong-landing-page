import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CheckoutLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-300 px-4 py-12 md:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 bg-border rounded mb-6" />
            <div className="h-8 w-40 bg-border rounded mb-8" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Form skeleton */}
              <div className="lg:col-span-2 space-y-5">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-border rounded mb-1.5" />
                    <div className="h-11 w-full bg-border rounded-md" />
                  </div>
                ))}
                <div className="h-11 w-full bg-border rounded-md" />
              </div>

              {/* Summary skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-surface rounded-lg border border-border p-6">
                  <div className="h-6 w-24 bg-border rounded mb-4" />
                  <div className="space-y-2 mb-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-24 bg-border rounded" />
                        <div className="h-4 w-16 bg-border rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-border my-4" />
                  <div className="flex justify-between mb-6">
                    <div className="h-5 w-12 bg-border rounded" />
                    <div className="h-5 w-20 bg-border rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
