'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

export default function PromotionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [promotion, setPromotion] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotion();
    loadReport();
  }, [params.id]);

  const loadPromotion = async () => {
    try {
      const response = await api.get(`/admin/promotions/${params.id}`);
      setPromotion(response.data);
    } catch (error) {
      console.error('Failed to load promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      const response = await api.get(`/admin/promotions/${params.id}/report`);
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    }
  };

  const handleGenerateRakeback = async () => {
    try {
      await api.post(`/admin/promotions/${params.id}/generate-rakeback`);
      alert('Rakeback generated successfully');
      loadReport();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate rakeback');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-900 mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{promotion?.name}</h2>
      </div>

      {promotion && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Promotion Details</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{promotion.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">RBP</dt>
              <dd className="mt-1 text-sm text-gray-900">{promotion.rakebackPercentage}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Override %</dt>
              <dd className="mt-1 text-sm text-gray-900">{promotion.overridePercentage}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Period</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(promotion.startAt).toLocaleDateString()} - {new Date(promotion.endAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>

          {promotion.status === 'ENDED' && (
            <button
              onClick={handleGenerateRakeback}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Generate Rakeback
            </button>
          )}
        </div>
      )}

      {report && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Report</h3>
          <dl className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Players</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.summary?.totalPlayers || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Wager</dt>
              <dd className="mt-1 text-sm text-gray-900">${report.summary?.totalWager?.toFixed(2) || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Rakeback</dt>
              <dd className="mt-1 text-sm text-gray-900">${report.summary?.totalRakeback?.toFixed(2) || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Claimed</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.summary?.claimedCount || 0} / {report.summary?.totalPlayers || 0}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

