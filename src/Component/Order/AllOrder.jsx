import { Button, colors, TextField, Modal, Box } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// const socket_url = ''
const socket_url =  import.meta.env.VITE_SOCKET_URL
// console.log('socket_url: ', socket_url);
const socket = io(socket_url, {
  transports: ["websocket"],
});

const AllOrder = () => {
  const [allorder, setAllorder] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Loader state
  const [itemprice, setitemprice] = useState({
    TotalSales: 0,
    TotalOrders: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    firstDate: "",
    lastDate: "",
  });
  const [dropdownValues, setDropdownValues] = useState({
    dateFilter: "all",
    userType: "all",
    minTime: "all",
    paymentMethod: "all",
  });

  // Updated pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setLoading(true);
    socket.emit("complete-list", {});
    socket.on("all-order-complete-list-response", (data) => {
      setAllorder(data.data);
      setLoading(false);
      setitemprice({
        TotalSales: data.totalSales,
        TotalOrders: data.totalOrders,
      });
      setTotalItems(data.totalOrders || data.data.length);
    });
    return () => {
      socket.off("all-order-complete-list-response");
    };
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: limit,
    };
     
    setLoading(true);
    if (dropdownValues.dateFilter !== "all") {
      if (dropdownValues.dateFilter === "today") {
        filters.dateRange = "Today";
      } else if (dropdownValues.dateFilter === "last7days") {
        filters.dateRange = "Last 7 days";
      } else if (dropdownValues.dateFilter === "custom") {
        filters.selectedStartDate = dateRange.firstDate;
        filters.selectedEndDate = dateRange.lastDate;
      }
    }
     
    if (dropdownValues.userType !== "all") {
      filters.userType =
        dropdownValues.userType === "business" ? "BusinessUser" : "User";
    }

    if (dropdownValues.minTime !== "all") {
      if (dropdownValues.minTime === "minDelivery") {
        filters.minTime = 5;
      } else if (dropdownValues.minTime === "maxDelivery") {
        filters.maxTime = 20;
      }
    }

    if (dropdownValues.paymentMethod !== "all") {
     
      filters.paymentMethod =
        dropdownValues.paymentMethod === "perks" ? "Perks" : "UPI";
    }
    socket.emit("complete-list", filters)
    const handleOrderResponse = (Allorders) => {
      setAllorder(Allorders.data);
      setLoading(false);
      setTotalItems(Allorders.totalOrders || Allorders.data.length);
    };

    socket.on("all-order-complete-list-response", handleOrderResponse);
    return () => {
      socket.off("all-order-complete-list-response", handleOrderResponse);
    };
  }, [dropdownValues, currentPage, limit]);

  const convertToIST = (utcTime) => {
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };


  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "dateFilter" && value === "custom") {
      setIsModalOpen(true);
    } else {
      setDropdownValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
  };
  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleModalClose = () => {
    setIsModalOpen(false);
    setDropdownValues((prevValues) => ({
      ...prevValues,
      dateFilter: "all",
    }));
  };

  const applyCustomDateFilter = () => {
    setIsModalOpen(false);
    setDropdownValues((prevValues) => ({
      ...prevValues,
      dateFilter: "custom",
    }));
  };

  // Custom Pagination Component
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit + 1;
    const endIndex = Math.min(currentPage * limit, totalItems);
    const isNextButtonDisabled = currentPage >= totalPages;

    return (
      <div className="pagination-container ">
        <div className="d-flex align-items-center">
          <span className="showing-text">
            Showing {startIndex} Of
            <select
              className="me-1 text-center customselect border-0"
              value={limit}
              style={{ width: '-80px', border: 'none', backgroundColor: '#EEF4ED', color: '#0B2545' }}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                setCurrentPage(1);
              }}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>orders
          </span>
        </div>

        <div className="pagination-controls">
          <button
            className='pagination-button'
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          <span
            style={{
              fontWeight: 'bold',
              backgroundColor: '#8DA9C4',
              color: '#0B2545',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {currentPage}
          </span>
          <button
            className='pagination-button'
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={isNextButtonDisabled}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="order-container">
        <div className="order-filters">
          <select
            name="dateFilter"
            className="prepering-all-drop-down text-center"
            onChange={handleChange}
            value={dropdownValues.dateFilter}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="last7days">Last 7 days</option>
            <option value="custom">Custom</option>
          </select>

          <select
            name="userType"
            className="prepering-all-drop-down text-center"
            onChange={handleChange}
            value={dropdownValues.userType}
          >
            <option value="all">All Users</option>
            <option value="business">Business</option>
            <option value="individual">Individual</option>
          </select>
          <select
            name="minTime"
            className="prepering-all-drop-down text-center"
            onChange={handleChange}
            value={dropdownValues.minTime}
          >
            <option value="all">All</option>
            <option value="minDelivery">Min Delivery Time</option>
            <option value="maxDelivery">Max Delivery Time</option>
          </select>
          <select
            name="paymentMethod"
            className="prepering-all-drop-down text-center"
            onChange={handleChange}
            value={dropdownValues.paymentMethod}
          >
            <option value="all">All</option>
            <option value="perks">Perks</option>
            <option value="upi">UPI</option>
          </select>
          <div className="order-summary">
            <span className="summary-details">
              Total Sales {itemprice.TotalSales}
            </span>
            <span className="summary-details">
              Total Orders {itemprice.TotalOrders}
            </span>
          </div>
        </div>

        {loading && (
          <div className="loader-container d-flex justify-content-center">
            <div className="loader"></div>
          </div>
        )}

        {!loading && (
          <table className="order-table">
            <thead>
              <tr>
                <th className="order-table-heading text-start">User Name</th>
                <th className="order-table-heading">Date</th>
                <th className="order-table-heading">Payment Method</th>
                <th className="order-table-heading">Items</th>
                <th className="order-table-heading">Received Time</th>
                <th className="order-table-heading">Delivered Time</th>
                <th className="order-table-heading">Est. Delivery Time</th>
                <th className="order-table-heading">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {allorder.map((row, index) => (
                <tr key={index} className="order-table-row">
                  <td className="fw-bold text-start">
                    {row.businessName === "Unknown"
                      ? row.userFirstName + " " + row.userLastName
                      : row.businessName}
                  </td>
                  <td className="fw-bold">{convertToIST(row.createdAt)}</td>
                  <td className="fw-bold text-center">{row.paymentMethod}</td>
                  <td className="fw-bold">{row.items.length}</td>
                  <td className="fw-bold">
                    {convertToIST(row.orderReceivedTime)}
                  </td>
                  <td className="fw-bold">
                    {convertToIST(row.deliveryEndTime)}
                  </td>
                  <td className="fw-bold">
                    {row.timeTaken.minutes.toFixed(2)}&nbsp;&nbsp;Min
                  </td>
                  <td className="fw-bold">{row.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal
        open={isModalOpen}
        onClose={handleModalClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)", // Blurred background effect
          backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay
        }}
      >
        <Box
          sx={{
            width: 600,
            bgcolor: "#8DA9C4",
            p: 5,
            borderRadius: 2,
            boxShadow: 24,
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "10px", color: "#0B2545" }}>Select Date Range</h2>
          <div className="d-flex gap-5">
          <TextField
              type="date"
              label="First Date"
              name="firstDate"
              value={dateRange.firstDate}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              // Trigger the date picker on click
              sx={{
                '& input': {
                  '-webkit-text-fill-color': 'black', // Ensures text remains black while typing
                  caretColor: 'black',
                  color: 'black',
                },'& label': {
            transform: 'translate(14px, -16px) scale(0.75)', // Label ko upar set karna
            transformOrigin: 'top left',
          },
              }}
            />
            <TextField
              type="date"
              label="Last Date" 
              name="lastDate"
              value={dateRange.lastDate}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              sx={{
                '& input': {
                  color: 'black',
                  '-webkit-text-fill-color': 'black', // Ensures text remains black while typing
                  caretColor: 'black', // Keeps the cursor visible
                },'& label': {
            transform: 'translate(14px, -16px) scale(0.75)', // Label ko upar set karna
            transformOrigin: 'top left',
          },
              }}
            />
          </div>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={applyCustomDateFilter}
              sx={{ borderRadius: "8px", textTransform: "none" , width:200 }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleModalClose}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Pagination />
    </>
  );
};

export default AllOrder;  