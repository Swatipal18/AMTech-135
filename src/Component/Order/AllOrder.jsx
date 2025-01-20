import React from "react";
// import "./AllOrder.css";

const AllOrder = () => {
  const tableHeadings = [
    "User Name",
    "Date",
    "Items",
    "Received Time",
    "Delivered Time",
    "Est. Delivery Time",
    "Total Amount",
  ];

  const tableData = [
    {
      userName: "AMTech Design",
      date: "1 Jan 2025",
      items: 5,
      receivedTime: "10:00 AM",
      deliveredTime: "10:20 AM",
      estimatedDeliveryTime: "20 Minutes",
      totalAmount: "₹250",
    },
    {
      userName: "John Doe",
      date: "2 Jan 2025",
      items: 3,
      receivedTime: "11:00 AM",
      deliveredTime: "11:30 AM",
      estimatedDeliveryTime: "30 Minutes",
      totalAmount: "₹150",
    },
    {
      userName: "Jane Smith",
      date: "3 Jan 2025",
      items: 8,
      receivedTime: "1:00 PM",
      deliveredTime: "1:45 PM",
      estimatedDeliveryTime: "45 Minutes",
      totalAmount: "₹400",
    },
    {
      userName: "Tech Solutions",
      date: "4 Jan 2025",
      items: 10,
      receivedTime: "9:00 AM",
      deliveredTime: "9:40 AM",
      estimatedDeliveryTime: "40 Minutes",
      totalAmount: "₹500",
    },
  ];

  return (
    <div className="order-container">
      {/* Filter Bar */}
      <div className="order-filters">
        
          <button  className="order-filter-btn">
            All
          </button>
     
          <button  className="order-filter-btn">
           All Users
          </button>
     
          <button  className="order-filter-btn">
           All
          </button>
          <button  className="order-filter-btn">
           All
          </button>
     
        <div className="order-summary">
          <span className="summary-details">Total Sales ₹10,000</span>
          <span className="summary-details">Total Orders 2,500</span>
        </div>
      </div>

      {/* Table */}
      <table className="order-table">
        <thead>
          <tr>
            {tableHeadings.map((heading, index) => (
              <th key={index} className="order-table-heading">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index} className="order-table-row">
              <td>{row.userName}</td>
              <td>{row.date}</td>
              <td>{row.items}</td>
              <td>{row.receivedTime}</td>
              <td>{row.deliveredTime}</td>
              <td>{row.estimatedDeliveryTime}</td>
              <td>{row.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllOrder;
