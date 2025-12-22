import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Manage rakeback configuration and simulate bets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/config">
            <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration</h2>
              <p className="text-sm text-gray-600">Configure rakeback settings, percentages, and floors</p>
            </div>
          </Link>

          <Link href="/admin/simulator">
            <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulator</h2>
              <p className="text-sm text-gray-600">Simulate casino and sportsbook wagers</p>
            </div>
          </Link>

          <Link href="/admin/audit">
            <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit</h2>
              <p className="text-sm text-gray-600">View all wagers and rakeback generated</p>
            </div>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/player/rakeback">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:bg-indigo-100 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-indigo-900">View Player Rakeback Dashboard →</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

