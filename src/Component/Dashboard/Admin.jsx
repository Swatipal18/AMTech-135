 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, ChevronDown, LineChart } from "lucide-react";
import { Bar } from "react-chartjs-2";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
} from "chart.js";
import { Tooltip as tooltip } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, tooltip, Legend);
const Admin = () => {
  const [data, setdata] = useState([
    { name: "Item 1", quantity: 10, money: 100 },
    { name: "Item 2", quantity: 5, money: 50 },
    { name: "Item 3", quantity: 8, money: 80 },
    { name: "Item 3", quantity: 8, money: 80 },
    { name: "Item 3", quantity: 8, money: 80 },
    // { name: 'Item 3', quantity: 8, money: 80 },
  ]);
  const [NewOrders, setNewOrder] = useState([
    { name: "Anup Parekh", value: "₹1,00,00,000" },
    { name: "Mahmed Hussain", value: "₹1,00,00,000" },
    { name: "AMTech Design", value: "₹1,00,00,000" },
    { name: "Vikas Soni", value: "₹1,00,00,000" },
    { name: "Rahul Sharma", value: "₹1,00,00,000" },
    { name: "LoansMitra", value: "₹1,00,00,000" },
  ]);
  const [HighValueItem, SetHighValueItem] = useState([
    { name: "Anup Parekh", value: "₹1,00,00,000" },
    { name: "Mahmed Hussain", value: "₹1,00,00,000" },
    { name: "AMTech Design", value: "₹1,00,00,000" },
    { name: "Vikas Soni", value: "₹1,00,00,000" },
    { name: "Rahul Sharma", value: "₹1,00,00,000" },
    { name: "LoansMitra", value: "₹1,00,00,000" },
  ]);

  const chartData = [
    { name: "Jan", value: 30000 },
    { name: "Fab", value: 25000 },
    { name: "Mar", value: 35000 },
    { name: "Apr", value: 28000 },
    { name: "May", value: 22000 },
    { name: "Jun", value: 45000 },
    { name: "Jul", value: 32000 },
    { name: "Aug", value: 42000 },
    { name: "Sep", value: 12000 },
    { name: "Oct", value: 28000 },
    { name: "Nov", value: 2000 },
    { name: "Dec", value: 35000 },
  ];
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
  const url = useNavigate();
  const maindata = {
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
  return (
    <>
      <div className="main-deshboard-container">
        <div className="D-header">
          <div className="btn-container d-flex justify-content-around gap-5">
            <button className="Admin-header-button"  onClick={()=>url("/AddNewItem")}><b> + New Item</b></button>
            <button className="Admin-header-button"  onClick={()=>url("#")}> <b>+ New Store</b></button>
            <button className="Admin-header-button" onClick={()=>url("/AddStaff")}><b>+ New Staff</b></button>
            <button className="Admin-header-button" onClick={()=>url("/OrderManagement")}><b>Order Managment</b></button>
            <button className="Admin-header-button" onClick={()=>url("#")}><b>Customer</b></button>
          </div>
        </div>
        <div className="Deshboard-main-content mt-4">
          <div className="First-line-container row d-flex justify-content-around mt-5">
            <div className="over-view col-6">
              <div className="over-view-header d-flex justify-content-around mt-4 align-items-center">
                <div className="Headername">
                  <h3 className="fw-bold">Overview</h3>
                </div>
                   <select name="select" id="" className="date p-2">
                    <option value="All Time">All Time</option>
                    <option value="All Time">Last 7 days</option>
                    <option value="All Time">Last Month</option>
                    <option value="Custom">Custom</option>
                   </select>
              </div>
              <hr />
              <div className="over-view-detail d-flex flex-column justify-content-around ">
                <div className="row d-flex justify-content-around">
                  <div className="total-sales col-5">
                    <h2 className="fs-3">Total Sales</h2>
                    <h2 className="fs-3">
                      ₹ <b>500,00,000 </b>
                    </h2>
                    <span>since last weak 10% ^</span>
                  </div>
                  <hr className="vertical-hr p-0" />
                  <div className="total-sales col-5">
                    <h2 className="fs-3">Total Orders</h2>
                    <h2 className="fs-3">
                      ₹ <b>100,000 </b>
                    </h2>
                    <span>since last weak 10% ^</span>
                  </div>
                </div>
                <hr />
                <div className="row d-flex justify-content-around ">
                  <div className="total-sales col-5">
                    <h2 className="fs-3">
                      Total Users <span>(b)</span>
                    </h2>
                    <h2 className="fs-3">
                      ₹ <b>10,000 </b>
                    </h2>
                    <span>since last weak 10% ^</span>
                  </div>
                  <hr className="vertical-hr p-0" />
                  <div className="total-sales col-5">
                    <h2 className="fs-3">Total Users</h2>
                    <h2 className="fs-3">
                      ₹ <b>7000 </b>
                    </h2>
                    <span>since last weak 10% ^</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="New-Orders col-5">
              <div className="high-value-users-box">
                <div className="over-view-header d-flex justify-content-around  align-items-center">
                  <div className="Headername">
                    <h3 className="fw-bold">New Orders</h3>
                  </div>
                  <select name="select" id="" className="date p-2">
                    <option value="All Time">All Time</option>
                    <option value="All Time">Last 7 days</option>
                    <option value="All Time">Last Month</option>
                    <option value="Custom">Custom</option>
                   </select>
                </div>

                <hr />
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Quntity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NewOrders.slice(0, 7).map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}.</td>
                        <td>{user.name}</td>
                        <td>{user.value}</td>
                        <td>{user.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="view-all"
                  onClick={() => url("/OrderManagement")}
                  style={{ cursor: "pointer" }}
                >
                  View All {"->"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="Second-line-container row d-flex justify-content-around mt-5">
          <div className="Top-delivery-boys col-6 ">
            <div className="high-value-users-box">
                <div className="over-view-header d-flex align-items-center">
                  <div className="Headername">
                    <h3 className="fw-bold ">Today Subscriptions</h3>
                  </div>
                </div>
                    <hr />
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Customer Name</th>
                      <th>Item name</th>
                      <th>Time Slot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HighValueItem.slice(0, 5).map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}.</td>
                        <td>{user.name}</td>
                        <td>{user.name}</td>
                        <td>{user.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="view-all"
                  onClick={() => url("/OrderManagement")}
                  style={{ cursor: "pointer" }}
                >
                  View All {"->"}
                </div>
              </div>
            </div>
          <div className="New-Orders col-5">
              <div className="high-value-users-box">
                <div className="over-view-header d-flex   align-items-center">
                  <div className="Headername">
                    <h3 className="fw-bold">Next Day Subscriptions</h3>
                  </div>
                </div>
                <hr />
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Subscription Name</th>
                      <th>Quntity</th>
                      {/* <th>Price</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {NewOrders.slice(0, 7).map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}.</td>
                        <td>{user.name}</td>
                        <td>{user.value}</td>
                        {/* <td>{user.value}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="view-all"
                  onClick={() => url("/OrderManagement")}
                  style={{ cursor: "pointer" }}
                >
                  View All {"->"}
                </div>
              </div>
            </div>
          </div>
          <div className="Third-line-container row d-flex justify-content-center ">
            <div className="Analytics-Chart col-11">
              <div className="chart-container mt-5 ">
                <div className="d-flex justify-content-between mb-3">
              <h2 style={{color:"#134074"}} className="fw-bold">Total Sales & Customer Analytics</h2>
              <select name="select" id="" className="date p-2">
                    <option value="All Time">Total Sales</option>
                    <option value="All Time">Total Customer</option>
                   </select>
              </div>
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
          <div className="Fourth-line-container row d-flex justify-content-around mt-5">
            <div className="High-value-Users col-6 mt-5">
            <div className="high-value-users-box">
                <div className="over-view-header d-flex justify-content-around  align-items-center">
                  <div className="Headername">
                    <h3 className="fw-bold">High Value Orders</h3>
                  </div>
                  <select name="select" id="" className="date p-2">
                    <option value="All Time">All Time</option>
                    <option value="All Time">Last 7 days</option>
                    <option value="All Time">Last Month</option>
                    <option value="Custom">Custom</option>
                   </select>
                </div>
                <hr />
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Quntity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HighValueItem.slice(0, 7).map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}.</td>
                        <td>{user.name}</td>
                        <td>{user.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="view-all"
                  onClick={() => url("/OrderManagement")}
                  style={{ cursor: "pointer" }}
                >
                  View All {"->"}
                </div>
              </div>
            </div>
            <div className="High-Value-Itmes col-5 mt-5">
              <div className="high-value-users-box ">
                <div className="over-view-header d-flex justify-content-around  align-items-center">
                  <div className="Headername">
                    <h3 className="fw-bold">High Value Items</h3>
                  </div>
                  <select name="select" id="" className="date p-2">
                    <option value="All Time">All Time</option>
                    <option value="All Time">Last 7 days</option>
                    <option value="All Time">Last Month</option>
                    <option value="Custom">Custom</option>
                   </select>
                </div>
                  <hr />
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Quntity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HighValueItem.slice(0, 7).map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}.</td>
                        <td>{user.name}</td>
                        <td>{user.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="view-all"
                  onClick={() => url("/OrderManagement")}
                  style={{ cursor: "pointer" }}
                >
                  View All {"->"}
                </div>
              </div>
            </div>
          </div>
          <div className="Second-line-container row d-flex justify-content-center">
            <div className="Total-Order-Chart col-11">
            <div style={{ width: "100%", height: "300px", padding: "20px" }}>
         <h4 style={{ color: "#4B5563" }}>Total Orders</h4>
         <p style={{ color: "#9CA3AF", fontSize: "12px" }}>from 1-6 Dec, 2020</p>
         <Bar data={maindata} options={options} />
       </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
