import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useAscents } from '../contexts/AscentsContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ClimbStats.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * ClimbStats component visualizes user climbing statistics
 */
const ClimbStats = () => {
  const { user } = useAuth();
  const { ascents, loading, calculateStats } = useAscents();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);

  // Calculate and set stats when ascents change
  useEffect(() => {
    if (ascents && ascents.length) {
      const calculatedStats = calculateStats();
      setStats(calculatedStats);
    }
  }, [ascents, calculateStats]);

  /**
   * Get grade distribution for a specific climb type
   * @param {string} type - Climb type ('boulder' or 'route')
   * @returns {Object} - Data for grade distribution chart
   */
  const getGradeDistribution = (type) => {
    if (!ascents || !ascents.length) return { labels: [], data: [] };

    // Filter by climb type and group by grade
    const gradeMap = {};
    ascents.filter(a => a.climb_type === type).forEach(ascent => {
      const grade = ascent.personal_grade || 'Ungraded';
      gradeMap[grade] = (gradeMap[grade] || 0) + 1;
    });

    // Sort grades appropriately
    const sortedGrades = Object.keys(gradeMap).sort((a, b) => {
      if (a === 'Ungraded') return 1;
      if (b === 'Ungraded') return -1;
      return a.localeCompare(b);
    });

    return {
      labels: sortedGrades,
      data: sortedGrades.map(grade => gradeMap[grade])
    };
  };

  /**
   * Get send rate data (sent vs. project)
   * @returns {Object} - Data for send rate chart
   */
  const getSendRateData = () => {
    if (!stats) return { labels: ['Sent', 'Project'], data: [0, 0] };
    return {
      labels: ['Sent', 'Project'],
      data: [stats.sent, stats.project]
    };
  };

  /**
   * Get climbing activity over time
   * @returns {Object} - Data for activity chart
   */
  const getActivityData = () => {
    if (!ascents || !ascents.length) return { labels: [], data: [] };

    // Group ascents by month
    const monthMap = {};
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    // Initialize all months with zero
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap[monthKey] = 0;
    }

    // Count ascents by month
    ascents.forEach(ascent => {
      const date = new Date(ascent.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[monthKey] !== undefined) {
        monthMap[monthKey] += 1;
      }
    });

    // Format labels for display
    const labels = Object.keys(monthMap).map(key => {
      const [year, month] = key.split('-');
      return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]} ${year}`;
    });

    return {
      labels,
      data: Object.values(monthMap)
    };
  };

  /**
   * Render the grade distribution chart
   * @returns {JSX.Element} - Bar chart component
   */
  const renderGradeDistribution = () => {
    const boulderData = getGradeDistribution('boulder');
    const routeData = getGradeDistribution('route');

    return (
      <div className="chart-container">
        <h3>Boulder Grades</h3>
        {boulderData.labels.length > 0 ? (
          <Bar
            data={{
              labels: boulderData.labels,
              datasets: [
                {
                  label: 'Boulder Grades',
                  data: boulderData.data,
                  backgroundColor: '#3498db',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
            }}
          />
        ) : (
          <p className="no-data">No boulder data available</p>
        )}

        <h3 className="mt-4">Route Grades</h3>
        {routeData.labels.length > 0 ? (
          <Bar
            data={{
              labels: routeData.labels,
              datasets: [
                {
                  label: 'Route Grades',
                  data: routeData.data,
                  backgroundColor: '#e74c3c',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
            }}
          />
        ) : (
          <p className="no-data">No route data available</p>
        )}
      </div>
    );
  };

  /**
   * Render the send rate chart
   * @returns {JSX.Element} - Pie chart component
   */
  const renderSendRate = () => {
    const { labels, data } = getSendRateData();

    return (
      <div className="chart-container">
        <h3>Send Rate</h3>
        <div className="pie-container">
          <Pie
            data={{
              labels,
              datasets: [
                {
                  data,
                  backgroundColor: ['#2ecc71', '#f1c40f'],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </div>
    );
  };

  /**
   * Render the climbing activity chart
   * @returns {JSX.Element} - Line chart component
   */
  const renderActivityOverTime = () => {
    const { labels, data } = getActivityData();

    return (
      <div className="chart-container">
        <h3>Climbing Activity (6 Months)</h3>
        <Line
          data={{
            labels,
            datasets: [
              {
                label: 'Climbs Logged',
                data,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                tension: 0.2,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
          }}
        />
      </div>
    );
  };

  /**
   * Render the overview section with key stats
   * @returns {JSX.Element} - Stats overview component
   */
  const renderOverview = () => {
    if (!stats) return <p className="loading">Loading stats...</p>;

    return (
      <div className="stats-overview">
        <div className="stats-card">
          <h3>Total Ascents</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stats-card">
          <h3>Send Streak</h3>
          <p className="stat-value">{stats.sendStreak} day(s)</p>
        </div>
        <div className="stats-card">
          <h3>Hardest Boulder</h3>
          <p className="stat-value">{stats.hardestBoulder}</p>
        </div>
        <div className="stats-card">
          <h3>Hardest Route</h3>
          <p className="stat-value">{stats.hardestRoute}</p>
        </div>
        <div className="stats-card">
          <h3>Send Rate</h3>
          <p className="stat-value">
            {stats.total ? Math.round((stats.sent / stats.total) * 100) : 0}%
          </p>
        </div>
        <div className="stats-card">
          <h3>Unique Climbs</h3>
          <p className="stat-value">{stats.uniqueClimbs}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading stats...</div>;
  }

  if (!user) {
    return <div className="login-required">Please log in to view your stats</div>;
  }

  if (!ascents || ascents.length === 0) {
    return <div className="no-ascents">No climbs logged yet. Start logging to see your stats!</div>;
  }

  return (
    <div className="climb-stats">
      <h2>Climbing Statistics</h2>
      
      <div className="stats-tabs" role="tablist">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
          role="tab"
          aria-selected={activeTab === 'overview'}
          aria-controls="overview-tab"
        >
          Overview
        </button>
        <button 
          className={activeTab === 'grades' ? 'active' : ''} 
          onClick={() => setActiveTab('grades')}
          role="tab"
          aria-selected={activeTab === 'grades'}
          aria-controls="grades-tab"
        >
          Grades
        </button>
        <button 
          className={activeTab === 'sendrate' ? 'active' : ''} 
          onClick={() => setActiveTab('sendrate')}
          role="tab"
          aria-selected={activeTab === 'sendrate'}
          aria-controls="sendrate-tab"
        >
          Send Rate
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
          role="tab"
          aria-selected={activeTab === 'activity'}
          aria-controls="activity-tab"
        >
          Activity
        </button>
      </div>

      <div className="tab-content">
        <div 
          id="overview-tab" 
          role="tabpanel" 
          aria-labelledby="overview-tab" 
          className={activeTab === 'overview' ? 'active' : 'hidden'}
        >
          {renderOverview()}
        </div>
        <div 
          id="grades-tab" 
          role="tabpanel" 
          aria-labelledby="grades-tab" 
          className={activeTab === 'grades' ? 'active' : 'hidden'}
        >
          {renderGradeDistribution()}
        </div>
        <div 
          id="sendrate-tab" 
          role="tabpanel" 
          aria-labelledby="sendrate-tab" 
          className={activeTab === 'sendrate' ? 'active' : 'hidden'}
        >
          {renderSendRate()}
        </div>
        <div 
          id="activity-tab" 
          role="tabpanel" 
          aria-labelledby="activity-tab" 
          className={activeTab === 'activity' ? 'active' : 'hidden'}
        >
          {renderActivityOverTime()}
        </div>
      </div>
    </div>
  );
};

export default ClimbStats;
