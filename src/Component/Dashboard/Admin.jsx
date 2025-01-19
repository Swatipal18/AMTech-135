import React, { useState } from 'react';
import { Plus, Clock, ChevronDown, LineChart } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bar } from "react-chartjs-2";
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
} from "chart.js";

import { Tooltip as tooltip } from 'chart.js';



ChartJS.register(BarElement, CategoryScale, LinearScale, tooltip, Legend);

function Admin() {
    const data = {
        labels: ["01", "02", "03", "04", "05", "06"],
        datasets: [
          {
            label: "Total Orders",
            data: [30, 50, 40, 70, 60, 80],
            backgroundColor: "#002D5B", // Dark blue
            borderRadius: 5, // Rounded bar corners
            barPercentage: 0.6, // Adjust bar width
          },
        ],
      };
    
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false, // Hide vertical grid lines
            },
            ticks: {
              color: "#9CA3AF", // Light gray for x-axis labels
            },
          },
          y: {
            grid: {
              color: "#E5E7EB", // Light gray for horizontal grid lines
            },
            ticks: {
              color: "#9CA3AF", // Light gray for y-axis labels
              stepSize: 20, // Fixed y-axis step
            },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false, // Hide legend
          },
          tooltip: {
            enabled: true,
            backgroundColor: "#002D5B",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
          },
        },
      };
    

















    const [stats, setStats] = useState({
        totalSales: 50000,
        salesChange: 10,
        totalOrders: 43276,
        ordersChange: -0.2,
        businessAccounts: 185,
        businessAccountsChange: 5.6,
        personalAccounts: 1209,
        personalAccountsChange: -0.1
    });

    const chartData = [
        { name: 'Dec 1', value: 30000 },
        { name: 'Dec 5', value: 25000 },
        { name: 'Dec 10', value: 35000 },
        { name: 'Dec 15', value: 28000 },
        { name: 'Dec 20', value: 22000 },
        { name: 'Dec 25', value: 45000 },
        { name: 'Dec 30', value: 32000 },
        { name: 'Jan 5', value: 42000 }
    ];

    return (
        <div className="dashboard-container" >
            {/* Main Content */}
            <div className="dashboard-header">
                {/* Action Buttons */}

                <div className="action-buttons">
                    <button className="action-btn">
                        <Plus size={18} />
                        Add New Item
                    </button>
                    <button className="action-btn">
                        <Plus size={18} />
                        Add New Staff
                    </button>
                    <button className="action-btn">Order Management</button>
                    <button className="action-btn">Staff Management</button>
                    <div className="time-selector">
                        <Clock size={18} />
                        All Time
                        <ChevronDown size={18} />
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <h2 className="section-title">Overview</h2>

                <div className="stats-grid">
                    <div className="stat-card text-center">
                        <h3>Total Sales</h3>
                        <div className="stat-value">₹ {stats.totalSales.toLocaleString()}</div>
                        <div className={`stat-change ${stats.salesChange >= 0 ? 'positive' : 'negative'}`}>
                            {Math.abs(stats.salesChange)}% {stats.salesChange >= 0 ? 'MORE' : 'LESS'}
                            <span className="change-period">Since Last Week</span>
                        </div>
                    </div>

                    <div className="stat-card text-center">
                        <h3>Total Orders</h3>
                        <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                        <div className={`stat-change ${stats.ordersChange >= 0 ? 'positive' : 'negative'}`}>
                            {Math.abs(stats.ordersChange)}% {stats.ordersChange >= 0 ? 'MORE' : 'LESS'}
                            <span className="change-period">Since Last Week</span>
                        </div>
                    </div>

                    <div className="stat-card text-center">
                        <h3>Total Business Accounts</h3>
                        <div className="stat-value">{stats.businessAccounts.toLocaleString()}</div>
                        <div className={`stat-change ${stats.businessAccountsChange >= 0 ? 'positive' : 'negative'}`}>
                            {Math.abs(stats.businessAccountsChange)}% {stats.businessAccountsChange >= 0 ? 'MORE' : 'LESS'}
                            <span className="change-period">Since Last Week</span>
                        </div>
                    </div>

                    <div className="stat-card text-center">
                        <h3>Total Personal Accounts</h3>
                        <div className="stat-value">{stats.personalAccounts.toLocaleString()}</div>
                        <div className={`stat-change ${stats.personalAccountsChange >= 0 ? 'positive' : 'negative'}`}>
                            {Math.abs(stats.personalAccountsChange)}% {stats.personalAccountsChange >= 0 ? 'MORE' : 'LESS'}
                            <span className="change-period">Since Last Week</span>
                        </div>
                    </div>
                </div>

                <div className="analytics-section">
                    <h2 className="section-title">Analytics</h2>
                    <div className="chart-header">
                        <h3>Total Sales</h3>
                        <div className="chart-period">from 1.5 Dec, 2020</div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0066FF"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#0066FF" }}
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>




            <div style={{ width: "100%", height: "300px", padding: "20px" }}>
      <h4 style={{ color: "#4B5563" }}>Total Orders</h4>
      <p style={{ color: "#9CA3AF", fontSize: "12px" }}>from 1-6 Dec, 2020</p>
      <Bar data={data} options={options} />
    </div>
        </div >
    );
};

export default Admin



