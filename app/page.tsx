import BTCPriceTracker from '@/components/btc-price-tracker';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <BTCPriceTracker />
        <footer className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Created by Ky Phan</h1>
          </div>
        </footer>
      </div>
    </main>
  );
}