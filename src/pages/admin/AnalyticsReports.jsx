import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { KpiCard } from '../../components/common/KpiCard.jsx';
import { SVGLineChart, SVGBarChart, SVGDonutChart } from '../../components/charts/SVGCharts.jsx';
import { IconChart, IconDownload, IconClock, IconCheck, IconLayers, IconCalendar } from '../../components/icons/Icons.jsx';

export function AnalyticsReports() {
  const { kpis, addToast } = useApp();
  const [timeRange, setTimeRange] = useState('Month');

  const lineChartData = [
    { label: 'Week 1', value: 82 },
    { label: 'Week 2', value: 88 },
    { label: 'Week 3', value: 91 },
    { label: 'Week 4', value: 96 },
  ];

  const barChartData = [
    { label: 'Jan', value: 140 },
    { label: 'Feb', value: 165 },
    { label: 'Mar', value: 190 },
    { label: 'Apr', value: 210 },
    { label: 'May', value: 245 },
  ];

  const deptDonutData = [
    { label: 'Civil Track', value: 45, color: '#3b82f6' },
    { label: 'Signal & Telecom', value: 30, color: '#10b981' },
    { label: 'Electrical TRD', value: 25, color: '#f59e0b' },
  ];

  const handleExportPDF = () => {
    addToast('Generating Zonal Maintenance & AI Punctuality Report (PDF)...', 'info');
    setTimeout(() => {
      addToast('Report downloaded successfully: Zonal_RailTech_Summary_2026.pdf', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Page Header */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded">
                PERFORMANCE AUDIT
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <IconChart className="w-6 h-6 text-blue-700" />
              <span>Zonal Network Analytics & Performance Reports</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Historical analysis of corridor availability, block bundling efficiency & train delay mitigation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 border border-slate-300 rounded text-xs">
              {['Week', 'Month', 'Quarter', 'Year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded transition cursor-pointer font-bold text-xs ${timeRange === range
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <IconDownload className="w-4 h-4 text-blue-300" />
              <span>Export Zonal PDF</span>
            </button>
          </div>
        </div>

        {/* Analytics KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Track Slot Efficiency</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">94.2%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">↑ 8.4% vs single block</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Punctuality Index</div>
            <div className="text-2xl font-black text-blue-900 mt-1">91.8%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">↑ 5.1% preserved</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Shadow Block Adoption</div>
            <div className="text-2xl font-black text-slate-900 mt-1">88.5%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cross-dept utilization</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Emergency Work Rate</div>
            <div className="text-2xl font-black text-amber-700 mt-1">2.1%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">↓ 4.5% unscheduled breaks</div>
          </div>
        </div>
      </div>

      {/* Performance Summary Matrix Table */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden space-y-0">
        <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Corridor Performance & Delay Mitigation Audit
            </h2>
            <p className="text-xs text-slate-500">Official section breakdown and passenger minutes saved</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-semibold rounded">
            Audit Ready
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
                <th className="p-3.5 border-r border-slate-200">Corridor Code</th>
                <th className="p-3.5 border-r border-slate-200">Section Name</th>
                <th className="p-3.5 border-r border-slate-200 text-center">Total Executed Blocks</th>
                <th className="p-3.5 border-r border-slate-200 text-center">Bundled Window %</th>
                <th className="p-3.5 border-r border-slate-200 text-center">Delay Minutes Saved</th>
                <th className="p-3.5 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50 transition">
                <td className="p-3.5 font-mono font-bold text-blue-900 border-r border-slate-200">C1</td>
                <td className="p-3.5 font-medium text-slate-900 border-r border-slate-200">NDLS - AGC (New Delhi - Agra Cantt)</td>
                <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200">42 Blocks</td>
                <td className="p-3.5 text-center font-bold text-emerald-700 border-r border-slate-200">96.2%</td>
                <td className="p-3.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">620 mins</td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold text-[10px]">
                    Optimal Compliance
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="p-3.5 font-mono font-bold text-blue-900 border-r border-slate-200">C2</td>
                <td className="p-3.5 font-medium text-slate-900 border-r border-slate-200">HWH - BWN (Howrah - Burdwan Main)</td>
                <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200">38 Blocks</td>
                <td className="p-3.5 text-center font-bold text-emerald-700 border-r border-slate-200">92.0%</td>
                <td className="p-3.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">450 mins</td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold text-[10px]">
                    Optimal Compliance
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="p-3.5 font-mono font-bold text-blue-900 border-r border-slate-200">C3</td>
                <td className="p-3.5 font-medium text-slate-900 border-r border-slate-200">CSMT - KYN (Mumbai CSMT - Kalyan Fast)</td>
                <td className="p-3.5 text-center font-bold text-slate-900 border-r border-slate-200">55 Blocks</td>
                <td className="p-3.5 text-center font-bold text-amber-700 border-r border-slate-200">85.4%</td>
                <td className="p-3.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">380 mins</td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded font-semibold text-[10px]">
                    Review Recommended
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsReports;
