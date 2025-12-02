'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Wish, Status, Priority } from '@/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, TrendingUp } from 'lucide-react';

type VisualizationType = 'bar' | 'line' | 'pie' | 'area' | 'summary';

interface YearlyStats {
  year: number;
  total: number;
  pending: number;
  in_progress: number;
  granted: number;
  denied: number;
  high: number;
  medium: number;
  low: number;
  totalValue: number;
}

interface CategoryStats {
  name: string;
  value: number;
  color: string;
}

const COLORS = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  granted: '#10b981',
  denied: '#64748b',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
};

export default function StatsPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('summary');

  useEffect(() => {
    loadWishes();
  }, []);

  const loadWishes = async () => {
    try {
      const data = await api.wishes.getAll();
      setWishes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load wishes:', error);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  };

  // Group wishes by year
  const getYearlyStats = (): YearlyStats[] => {
    const yearMap = new Map<number, YearlyStats>();

    wishes.forEach((wish) => {
      if (!wish.created_at) return;
      
      const year = new Date(wish.created_at).getFullYear();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          total: 0,
          pending: 0,
          in_progress: 0,
          granted: 0,
          denied: 0,
          high: 0,
          medium: 0,
          low: 0,
          totalValue: 0,
        });
      }

      const stats = yearMap.get(year)!;
      stats.total++;
      
      // Update status count
      switch (wish.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_progress':
          stats.in_progress++;
          break;
        case 'granted':
          stats.granted++;
          break;
        case 'denied':
          stats.denied++;
          break;
      }
      
      // Update priority count
      switch (wish.priority) {
        case 'high':
          stats.high++;
          break;
        case 'medium':
          stats.medium++;
          break;
        case 'low':
          stats.low++;
          break;
      }
      
      stats.totalValue += wish.product_price || 0;
    });

    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  };

  // Get status distribution
  const getStatusDistribution = (): CategoryStats[] => {
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      granted: 0,
      denied: 0,
    };

    wishes.forEach((wish) => {
      statusCounts[wish.status]++;
    });

    return [
      { name: 'Pending', value: statusCounts.pending, color: COLORS.pending },
      { name: 'In Progress', value: statusCounts.in_progress, color: COLORS.in_progress },
      { name: 'Granted', value: statusCounts.granted, color: COLORS.granted },
      { name: 'Denied', value: statusCounts.denied, color: COLORS.denied },
    ];
  };

  // Get priority distribution
  const getPriorityDistribution = (): CategoryStats[] => {
    const priorityCounts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    wishes.forEach((wish) => {
      priorityCounts[wish.priority]++;
    });

    return [
      { name: 'High', value: priorityCounts.high, color: COLORS.high },
      { name: 'Medium', value: priorityCounts.medium, color: COLORS.medium },
      { name: 'Low', value: priorityCounts.low, color: COLORS.low },
    ];
  };

  // Get overall summary stats
  const getSummaryStats = () => {
    const total = wishes.length;
    const granted = wishes.filter((w) => w.status === 'granted').length;
    const pending = wishes.filter((w) => w.status === 'pending').length;
    const totalValue = wishes.reduce((sum, w) => sum + (w.product_price || 0), 0);
    const grantedValue = wishes
      .filter((w) => w.status === 'granted')
      .reduce((sum, w) => sum + (w.product_price || 0), 0);

    return {
      total,
      granted,
      pending,
      totalValue,
      grantedValue,
      grantRate: total > 0 ? ((granted / total) * 100).toFixed(1) : '0',
    };
  };

  const yearlyStats = getYearlyStats();
  const statusDistribution = getStatusDistribution();
  const priorityDistribution = getPriorityDistribution();
  const summary = getSummaryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Wish Statistics</h1>
          <p className="text-slate-600">
            Analyze wishes grouped by year and meaningful categories
          </p>
        </div>
      </div>

      {/* Visualization Type Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setVisualizationType('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              visualizationType === 'summary'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Summary
          </button>
          <button
            onClick={() => setVisualizationType('bar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              visualizationType === 'bar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Bar Chart
          </button>
          <button
            onClick={() => setVisualizationType('line')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              visualizationType === 'line'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            Line Chart
          </button>
          <button
            onClick={() => setVisualizationType('pie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              visualizationType === 'pie'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Pie Chart
          </button>
          <button
            onClick={() => setVisualizationType('area')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              visualizationType === 'area'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AreaChartIcon className="w-4 h-4" />
            Area Chart
          </button>
        </div>
      </div>

      {/* Summary View */}
      {visualizationType === 'summary' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="text-sm text-slate-600 mb-1">Total Wishes</div>
              <div className="text-3xl font-bold text-slate-900">{summary.total}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="text-sm text-slate-600 mb-1">Granted</div>
              <div className="text-3xl font-bold text-emerald-600">{summary.granted}</div>
              <div className="text-xs text-slate-500 mt-1">{summary.grantRate}% grant rate</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="text-sm text-slate-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-amber-600">{summary.pending}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="text-sm text-slate-600 mb-1">Total Value</div>
              <div className="text-3xl font-bold text-slate-900">
                €{summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                €{summary.grantedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} granted
              </div>
            </div>
          </div>

          {/* Yearly Overview Table */}
          {yearlyStats.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Yearly Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        In Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Granted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Denied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {yearlyStats.map((stat) => (
                      <tr key={stat.year} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {stat.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {stat.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                          {stat.pending}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {stat.in_progress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600">
                          {stat.granted}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {stat.denied}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          €{stat.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bar Chart View */}
      {visualizationType === 'bar' && yearlyStats.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Wishes by Status per Year
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yearlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar dataKey="pending" stackId="a" fill={COLORS.pending} name="Pending" />
              <Bar dataKey="in_progress" stackId="a" fill={COLORS.in_progress} name="In Progress" />
              <Bar dataKey="granted" stackId="a" fill={COLORS.granted} name="Granted" />
              <Bar dataKey="denied" stackId="a" fill={COLORS.denied} name="Denied" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line Chart View */}
      {visualizationType === 'line' && yearlyStats.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Wishes Over Time by Status
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke={COLORS.pending}
                  strokeWidth={2}
                  name="Pending"
                />
                <Line
                  type="monotone"
                  dataKey="in_progress"
                  stroke={COLORS.in_progress}
                  strokeWidth={2}
                  name="In Progress"
                />
                <Line
                  type="monotone"
                  dataKey="granted"
                  stroke={COLORS.granted}
                  strokeWidth={2}
                  name="Granted"
                />
                <Line
                  type="monotone"
                  dataKey="denied"
                  stroke={COLORS.denied}
                  strokeWidth={2}
                  name="Denied"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Total Wishes Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Total Wishes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pie Chart View */}
      {visualizationType === 'pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Distribution by Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Distribution by Priority
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Area Chart View */}
      {visualizationType === 'area' && yearlyStats.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Wishes Over Time (Stacked Area)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={yearlyStats}>
              <defs>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.pending} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.pending} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.in_progress} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.in_progress} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGranted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.granted} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.granted} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.denied} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.denied} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke={COLORS.pending}
                fill="url(#colorPending)"
                name="Pending"
              />
              <Area
                type="monotone"
                dataKey="in_progress"
                stackId="1"
                stroke={COLORS.in_progress}
                fill="url(#colorInProgress)"
                name="In Progress"
              />
              <Area
                type="monotone"
                dataKey="granted"
                stackId="1"
                stroke={COLORS.granted}
                fill="url(#colorGranted)"
                name="Granted"
              />
              <Area
                type="monotone"
                dataKey="denied"
                stackId="1"
                stroke={COLORS.denied}
                fill="url(#colorDenied)"
                name="Denied"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {wishes.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">No wishes found. Statistics will appear here once wishes are created.</p>
        </div>
      )}
    </div>
  );
}

