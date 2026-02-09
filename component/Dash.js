// components/Dashboard/CoscoCombinedDashboard.jsx
'use client'; 

import React, { useState } from 'react';
// Recharts library handles the visual rendering logic
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Clock, FileText, Database, Zap, CheckCircle, AlertTriangle, Info, Activity, ArrowRight, Target } from 'lucide-react';

// --- HELPER FUNCTIONS ---

const getHeatmapClass = (level) => {
  const classes = {
    'none': 'heatmap-none',
    'low': 'heatmap-low',
    'medium': 'heatmap-medium',
    'high': 'heatmap-high'
  };
  return classes[level];
};

const getSeverityClass = (severity) => {
  const classes = {
    'Critical': 'label-critical',
    'High': 'label-high',
    'Medium': 'label-medium',
    'Low': 'label-low'
  };
  return classes[severity] || '';
};

const getStatusClass = (status) => {
    if (status.includes('Completed')) return 'label-green';
    if (status.includes('In Progress')) return 'label-blue';
    return 'label-yellow';
}

// --- METRIC CARD COMPONENT (Simplified) ---

const MetricCard = ({ title, value, change, trend, icon: Icon, alert }) => (
  // Apply base class and specific color/alert class
  <div className={`metric-card ${alert ? 'metric-card-alert' : 'metric-card-blue'}`}>
    <div className="metric-card-content">
      <div className="flex-1">
        <p className="metric-card-title">{title}</p>
        <p className="metric-card-value">{value}</p>
      </div>
      {/* Icon container now uses the shared background/color classes */}
      <div className={`metric-card-icon-container`}>
        <Icon />
      </div>
    </div>
    {change !== undefined && (
      <div className="trend-indicator">
        {trend === 'up' ? (
          <TrendingUp className="trend-up" />
        ) : (
          <TrendingDown className="trend-down" />
        )}
        <span className={`trend-text ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
          {change}% vs previous month
        </span>
      </div>
    )}
  </div>
);

// --- MAIN NEXT.JS CLIENT COMPONENT ---

const CoscoCombinedDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('full');
  const [activeView, setActiveView] = useState('executive');

  // --- DATA (Remains the same) ---
  const supportHoursData = [
    { month: 'May', hours: 25.0, change: 0, source: 'Both documents', incidents: 8, resolved: 8 },
    { month: 'Jun', hours: 41.0, change: 64, source: 'Both documents', incidents: 12, resolved: 11 },
    { month: 'Jul', hours: 62.5, change: 52, source: 'Both documents', incidents: 18, resolved: 16 },
    { month: 'Aug', hours: 68.0, change: 9, source: 'Both documents', incidents: 15, resolved: 14 },
    { month: 'Sep', hours: 147.0, change: 116, source: 'September document', incidents: 22, resolved: 20 }
  ];

  const issueTimeline = [
    { category: 'Excel / Cloud Excel Dependence', may: 'high', jun: 'high', jul: 'high', aug: 'high', sep: 'high', description: 'Most frequent source of incidents across all months', impact: 'Critical', trend: 'Stable High' },
    { category: 'Duplicate / Re-queue Records', may: 'low', jun: 'medium', jul: 'high', aug: 'high', sep: 'medium', description: 'Peaked in July-August, partially mitigated in September', impact: 'High', trend: 'Improving' },
    { category: 'Connector / API Throttling & OTP', may: 'medium', jun: 'medium', jul: 'medium', aug: 'medium', sep: 'medium', description: 'Stable but persistent, blocking queue processing', impact: 'Medium', trend: 'Stable' },
    { category: 'UI Element Changes (CBS)', may: 'none', jun: 'none', jul: 'high', aug: 'medium', sep: 'low', description: 'Emerged July, improved with selector hardening', impact: 'Medium', trend: 'Improving' },
    { category: 'Flow / Query Logic Errors', may: 'none', jun: 'medium', jul: 'medium', aug: 'low', sep: 'low', description: 'Fixed with query logic improvements', impact: 'Low', trend: 'Resolved' }
  ];

  const momComparison = [
    { transition: 'May → Jun', change: 64, hours: 16.0, color: '#ef4444' },
    { transition: 'Jun → Jul', change: 52, hours: 21.5, color: '#ef4444' },
    { transition: 'Jul → Aug', change: 9, hours: 5.5, color: '#f59e0b' },
    { transition: 'Aug → Sep', change: 116, hours: 79.0, color: '#dc2626' }
  ];

  const rootCauses = [
    { cause: 'Excel File Fragility', severity: 'Critical', frequency: 'Continuous', impact: 'Single largest driver of incidents', status: 'Migration planned (Medium-term)' },
    { cause: 'Queue Duplication Logic', severity: 'High', frequency: 'Peaked Jul-Aug', impact: 'Redundant processing & manual cleanup', status: 'Partially mitigated (Sep 2025)' },
    { cause: 'Platform Fragility (Connectors/OTP)', severity: 'Medium', frequency: 'Persistent', impact: 'Processing interruptions', status: 'API replacement planned' },
    { cause: 'UI Element Brittleness', severity: 'Medium', frequency: 'Emerged Jul 2025', impact: 'Automation exceptions', status: 'Selector hardening applied' }
  ];

  const actionItems = [
    { title: 'Excel / Cloud Excel Migration', status: 'In Progress (Medium-term)', icon: Database, details: 'Move processing logic away from fragile Excel dependencies. This is the **highest impact** planned action.' },
    { title: 'API Replacement for Throttling', status: 'Planned', icon: Zap, details: 'Replace current connectors/APIs to address throttling and OTP issues, improving stability.' },
    { title: 'Queue Duplication Mitigation', status: 'Mitigated/Monitoring', icon: AlertTriangle, details: 'Logic updates implemented in Q3 2025 (e.g., in September) to reduce duplicate record processing. Continuous monitoring required.' },
    { title: 'UI Selector Hardening', status: 'Completed', icon: CheckCircle, details: 'Applied robust selectors to mitigate exceptions caused by minor CBS UI changes. Reduced incident frequency from July peak.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="header-bg">
        <div className="container py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="header-title">COSCO Automation Monitoring</h1>
              <p className="header-subtitle">Comprehensive Analysis: May - September 2025</p>
            </div>
            <div className="header-right">
              <div className="header-info-label">Report Date</div>
              <div className="header-info-value">October 10, 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="quick-stats-banner">
        <div className="container">
          <div className="grid-cols-5 gap-4 py-4">
            <div className="quick-stat-item">
              <div className="quick-stat-value text-gray-900">343.5 hrs</div>
              <div className="quick-stat-label">Total Support Hours</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-value text-red-600">+488%</div>
              <div className="quick-stat-label">May to Sep Growth</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-value text-orange-600">5</div>
              <div className="quick-stat-label">Major Issue Categories</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-value text-blue-600">75</div>
              <div className="quick-stat-label">Total Incidents (est.)</div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-value text-green-600">93%</div>
              <div className="quick-stat-label">Resolution Rate (est.)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <div className="container">
          <div className="nav-tab-list">
            {[
              { id: 'executive', label: 'Executive Summary', icon: Target },
              { id: 'trends', label: 'Trends & Analytics', icon: TrendingUp },
              { id: 'issues', label: 'Issue Analysis', icon: AlertCircle },
              { id: 'rootcause', label: 'Root Causes', icon: Activity },
              { id: 'actions', label: 'Actions & Roadmap', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`nav-tab-button ${activeView === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Executive Summary View */}
        {activeView === 'executive' && (
          <div className="space-y-6">
            {/* Key Findings */}
            <div className="from-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                Key Findings (May - September 2025)
              </h3>
              <div className="grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Support Effort Escalation</h4>
                      <p className="text-sm text-gray-700">
                        Support hours increased from <strong>25 hrs in May</strong> to <strong>147 hrs in September</strong> 
                        — a nearly <strong>6x increase</strong>. Sharpest spike in September (+116%).
                      </p>
                    </div>
                  </div>
                </div>
                {/* ... (Other Key Findings - simplified for brevity, using same styling pattern) */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Recurring Root Causes</h4>
                      <p className="text-sm text-gray-700">
                        Same issues repeat month-to-month: <strong>Excel fragility</strong> remains the single largest driver, 
                        followed by queue duplication and platform brittleness.
                      </p>
                    </div>
                  </div>
                </div>
                 <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Stabilization Progress</h4>
                        <p className="text-sm text-gray-700">
                            July-August fixes (duplicate detection, UI hardening, retry logic) show positive impact. 
                            Some issues improving, but Excel dependence persists.
                        </p>
                        </div>
                    </div>
                </div>
                 <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Expected Improvement</h4>
                        <p className="text-sm text-gray-700">
                            Post-Excel migration: target <strong>50-70% reduction</strong> in reactive support hours. 
                            Event-driven architecture to improve resilience.
                        </p>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Monthly Metrics */}
            <div className="grid-cols-4 gap-4">
              <MetricCard title="September Support Hours" value="147 hrs" change={116} trend="up" icon={Clock} alert={true} />
              <MetricCard title="5-Month Total" value="343.5 hrs" icon={Activity} />
              <MetricCard title="Average Monthly Growth" value="+60%" icon={TrendingUp} alert={true} />
              <MetricCard title="Critical Issue: Excel" value="High" icon={FileText} alert={true} />
            </div>

            {/* Support Hours Trend */}
            <div className="card shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Support Hours Trend (May - September 2025)</h3>
              <ResponsiveContainer width="100%" height={300}>
                {/* ... (Recharts code remains the same as it's not HTML/CSS) */}
                <ComposedChart data={supportHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" label={{ value: '% Change', angle: 90, position: 'insideRight' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value, name) => {
                      if (name === 'hours') return [`${value} hrs`, 'Support Hours'];
                      if (name === 'change') return [`${value}%`, 'MoM Change'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="hours" />
                  <Line yAxisId="right" type="monotone" dataKey="change" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} name="change" />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Data Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Month</th>
                      <th className="text-right">Hours</th>
                      <th className="text-right">Change</th>
                      <th className="text-right">Δ Hours</th>
                      <th className="text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportHoursData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{row.month} 2025</td>
                        <td className="text-right font-semibold text-gray-900">{row.hours} hrs</td>
                        <td className="text-right">
                          {row.change > 0 ? (
                            <span className="text-red-600 font-medium">+{row.change}%</span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="text-right text-gray-600">
                          {idx > 0 ? `+${(row.hours - supportHoursData[idx-1].hours).toFixed(1)}` : '—'}
                        </td>
                        <td className="text-gray-600 text-xs">{row.source}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td className="">Total</td>
                      <td className="text-right">343.5 hrs</td>
                      <td className="text-right text-red-600">+488%</td>
                      <td className="text-right">{`+${(supportHoursData[supportHoursData.length - 1].hours - supportHoursData[0].hours).toFixed(1)} hrs`}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Issue Analysis View */}
        {activeView === 'issues' && (
            <div className="space-y-6">
                <div className="card shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Issue Frequency Heatmap (May - September 2025)</h3>
                        {/* Legend using the same CSS classes */}
                        <div className="flex gap-3 items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded heatmap-none"></div>
                                <span className="text-gray-600">None</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded heatmap-low"></div>
                                <span className="text-gray-600">Low</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded heatmap-medium"></div>
                                <span className="text-gray-600">Medium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded heatmap-high"></div>
                                <span className="text-gray-600">High</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="data-table w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left">Issue Category</th>
                                    <th className="text-center">May</th>
                                    <th className="text-center">Jun</th>
                                    <th className="text-center">Jul</th>
                                    <th className="text-center">Aug</th>
                                    <th className="text-center">Sep</th>
                                    <th className="text-center">Trend</th>
                                    <th className="text-left">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {issueTimeline.map((issue, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900 text-sm">{issue.category}</td>
                                        <td className="py-3 px-3">
                                            <div className={`heatmap-cell ${getHeatmapClass(issue.may)}`}>
                                                {issue.may !== 'none' && issue.may.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className={`heatmap-cell ${getHeatmapClass(issue.jun)}`}>
                                                {issue.jun !== 'none' && issue.jun.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className={`heatmap-cell ${getHeatmapClass(issue.jul)}`}>
                                                {issue.jul !== 'none' && issue.jul.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className={`heatmap-cell ${getHeatmapClass(issue.aug)}`}>
                                                {issue.aug !== 'none' && issue.aug.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className={`heatmap-cell ${getHeatmapClass(issue.sep)}`}>
                                                {issue.sep !== 'none' && issue.sep.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {/* Trend labels */}
                                            <span className={`label ${
                                                issue.trend === 'Improving' ? 'label-green-light' :
                                                issue.trend === 'Stable High' ? 'label-red' :
                                                issue.trend === 'Stable' ? 'label-yellow' :
                                                'label-blue'
                                            }`}>
                                                {issue.trend}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {/* Impact labels */}
                                            <span className={`label ${getSeverityClass(issue.impact)}`}>
                                                {issue.impact}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        
        {/* Root Cause Analysis View */}
        {activeView === 'rootcause' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Root Cause Synthesis (From August Document)
              </h3>
              <p className="text-sm text-gray-700">
                Analysis shows the same issues repeat month-to-month, indicating systemic rather than isolated problems.
              </p>
            </div>

            <div className="card shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Primary Root Causes</h3>
              <div className="space-y-4">
                {rootCauses.map((rc, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">{rc.cause}</h4>
                        <p className="text-sm text-gray-700 mb-2">{rc.impact}</p>
                      </div>
                      <span className={`label ${getSeverityClass(rc.severity)}`}>
                        {rc.severity}
                      </span>
                    </div>
                    <div className="grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Frequency:</span>
                        <span className="ml-2 text-gray-900">{rc.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className="ml-2 text-gray-900">{rc.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions & Roadmap View */}
        {activeView === 'actions' && (
          <div className="space-y-6">
            <div className="card shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Key Actions & Roadmap
              </h3>
              <div className="space-y-4">
                {actionItems.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                      </div>
                      <span className={`label ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CoscoCombinedDashboard;