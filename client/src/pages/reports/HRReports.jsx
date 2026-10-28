import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import PlaceholderNotice from '../../components/common/PlaceholderNotice.jsx';
import SummaryCard from '../../components/common/SummaryCard.jsx';

export const HRReports = () => {
  return (
    <div>
      <PageHeader
        title="HR Analytics & Executive Reports"
        subtitle="Workforce distribution analytics, monthly leave trend graphs, and organizational compliance summaries."
        breadcrumbs={[{ label: 'HR Reports', path: '/reports' }]}
      />

      <PlaceholderNotice
        featureName="Visual HR Analytics & Aggregations"
        targetPhase="Phase 11 (Dashboards, Notifications & Analytics)"
        description="Displays approved analytical dashboard layout. Chart.js visual graphs and CSV export pipelines will be implemented in Phase 11."
      />

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <SummaryCard
            label="Active Workforce"
            value="138"
            icon="👥"
            changeText="Total active employees"
          />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard
            label="Average Attendance Rate"
            value="94.2%"
            icon="📈"
            changeText="Across all 4 departments"
          />
        </div>
        <div className="col-12 col-md-4">
          <SummaryCard
            label="Total Leaves Taken (YTD)"
            value="187"
            icon="📅"
            changeText="Annual, casual & sick combined"
          />
        </div>
      </div>

      <div className="ss-card p-4">
        <h2 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.04em' }}>
          Monthly Leave Utilization Trends (YTD 2026)
        </h2>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th>May</th>
                <th>Jun</th>
                <th>Jul</th>
                <th>Aug</th>
                <th>Sep</th>
                <th>Oct</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>24 days</strong></td>
                <td><strong>38 days</strong></td>
                <td><strong>45 days</strong></td>
                <td><strong>29 days</strong></td>
                <td><strong>33 days</strong></td>
                <td><strong className="text-primary">18 days</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRReports;

