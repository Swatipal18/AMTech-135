import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
// import { FaFileInvoice } from "react-icons/fa";
import axios from "axios";
import { Box, Button, Modal } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import FileSaver from "file-saver";
import { FaFileInvoice } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";

const baseUrl = import.meta.env.VITE_API_URL;

function HistoryManagement() {
  const [popup, setpopup] = useState(false);
  const [loding ,  setloding] = useState(false)
  const [dropdownValues, setDropdownValues] = useState({
    dateFilter: "all",
    paymentMethod: "",
    userType: "",
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  console.log("selectedOrders: ", selectedOrders);
  const [selectAll, setSelectAll] = useState(false);
  const [Invoice, setInvoice] = useState([]);

  const [customDates, setCustomDates] = useState({
    startDate: null,
    endDate: null,
  });

  // Function to make the API call using Axios
  const fetchData = async (filters) => {
    try {
      // Constructing the query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      console.log("queryParams: ", queryParams);
      // Example API endpoint, replace with your actual API endpoint
      const response = await axios.get(
        `${baseUrl}/order/invoice-store-list?${queryParams}`
      );
      console.log("response: ", response.data);

      // Reset the Invoice array before adding the new data to avoid duplicates
      setInvoice(response.data.data.invoices);
    } catch (error) {
      // Handle error (e.g., show a message or log it)
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const filters = {};

    if (customDates.startDate && customDates.endDate) {
      // Agar custom date select hai toh usi ko use karo
      filters.startDate = customDates.startDate;
      filters.endDate = customDates.endDate;
    } else {
      if (dropdownValues.dateFilter === "All") {
        filters.dateRange = "All";
      } else if (dropdownValues.dateFilter === "today") {
        filters.dateRange = "Today";
      } else if (dropdownValues.dateFilter === "yesterday") {
        filters.dateRange = "Yesterday";
      } else if (dropdownValues.dateFilter === "week") {
        filters.dateRange = "Last 7 days";
      } else if (dropdownValues.dateFilter === "month") {
        filters.dateRange = "Last Month";
      }
    }

    // Include other filters
    if (dropdownValues.paymentMethod !== "") {
      filters.paymentMethod = dropdownValues.paymentMethod;
    }
    if (dropdownValues.userType !== "") {
      filters.userType = dropdownValues.userType;
    }

    // Fetch data with the filters
    fetchData(filters);
  }, [dropdownValues, popup]);

  function main() {
    setpopup(true);
  }
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

  const handleCheckboxChange = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(Invoice.map((v) => v.orderId));
    }
    setSelectAll(!selectAll);
  };

  async function DownloadInvoice() {
    if(selectedOrders.length === 0){
      alert("please select invoice first")
    }else {
      try {
        setloding(true)
        let response = await axios.post(`${baseUrl}/order/invoice-generate-pdf`, {
          orderIds: selectedOrders, // Replace with actual order IDs
        });
  
        const url = response.data.data.url;
        console.log("url: ", url);
  
        // Fetch the file as a Blob
        const pdfResponse = await fetch(url);
        const blob = await pdfResponse.blob();
  
        // Save the file using FileSaver.js
        FileSaver.saveAs(blob, "invoice.pdf");
        setloding(false)
      } catch (error) {
        console.log("error: ", error);
      }
    }
  }

  async function DownloadCSV() {
    if(selectedOrders.length === 0){
      alert("please select invoice first")
    }else {
      try {
        setloding(true)
        let response = await axios.post(`${baseUrl}/order/invoice-generate-csv`, {
          orderIds: selectedOrders, // Replace with actual order IDs
        });
  
        const url = response.data.data.url;
        console.log("CSV URL: ", url);
  
        // Fetch the CSV file as a Blob
        const csvResponse = await fetch(url);
        const blob = await csvResponse.blob();
  
        // Save the file using FileSaver.js
        FileSaver.saveAs(blob, "invoice.csv");
        setloding(false)
      } catch (error) {
        console.log("Error downloading CSV: ", error);
      }
    }
   
  }

  return (
    <>
      <div className="transaction-container">
        <h1>Transaction history</h1>
        <div className="filter-section">
          <div className="dropdown-group">
            {/* Statement Period Dropdown */}
            <div className="custom-dropdown">
              <label className="form-label fs-6">Statement period</label>
              <div
                className="dropdown-display w-100"
                style={{ backgroundColor: "#0B2545", color: "white" }}
              >
                <Calendar
                  size={16}
                  className="calendar-icon"
                  onClick={main}
                  color="white"
                />
                <span>
                  {dropdownValues.dateFilter === "all"
                    ? "All"
                    : dropdownValues.dateFilter === "today"
                    ? "Today"
                    : dropdownValues.dateFilter === "yesterday"
                    ? "Yesterday"
                    : dropdownValues.dateFilter === "week"
                    ? "Last 7 days"
                    : "Last Month"}
                </span>
              </div>
              <select
                style={{ backgroundColor: "#8DA9C4" }}
                value={dropdownValues.dateFilter}
                onChange={(e) => {
                  setDropdownValues({
                    ...dropdownValues,
                    dateFilter: e.target.value,
                  });
                  setCustomDates({ startDate: null, endDate: null });
                }}
              >
                <option className="" value="all">
                  All
                </option>{" "}
                {/* Changed "ALL" to "all" */}
                <option className="" value="today">
                  Today
                </option>
                <option className="" value="yesterday">
                  Yesterday
                </option>
                <option className="" value="week">
                  Last 7 days
                </option>
                <option className="" value="month">
                  Last Month
                </option>
              </select>
            </div>
            {/* Transaction Category Dropdown */}
            <div className="custom-dropdown">
              <label className="form-label fs-6">Transaction category</label>
              <div
                className="dropdown-display"
                style={{ backgroundColor: "#0B2545", color: "white" }}
              >
                <span>
                  {dropdownValues.paymentMethod === ""
                    ? "All transactions"
                    : dropdownValues.paymentMethod}
                </span>
                <i className="arrow-down"></i>
              </div>
              <select
                style={{ backgroundColor: "#8DA9C4" }}
                value={dropdownValues.paymentMethod}
                onChange={(e) =>
                  setDropdownValues({
                    ...dropdownValues,
                    paymentMethod: e.target.value,
                  })
                }
              >
                <option value="">All transactions</option>
                <option value="UPI">UPI</option>
                <option value="Perks">Perks</option>
              </select>
            </div>
            {/* UserType Dropdown */}
            <div className="custom-dropdown">
              <label className="form-label fs-6">UserType</label>
              <div
                className="dropdown-display"
                style={{ backgroundColor: "#0B2545", color: "white" }}
              >
                <span>
                  {dropdownValues.userType === ""
                    ? "All userTypes"
                    : dropdownValues.userType}
                </span>
                <i className="arrow-down"></i>
              </div>
              <select
                style={{ backgroundColor: "#8DA9C4" }}
                value={dropdownValues.userType}
                onChange={(e) =>
                  setDropdownValues({
                    ...dropdownValues,
                    userType: e.target.value,
                  })
                }
              >
                <option value="">All userTypes</option>
                <option value="Business">Business</option>
                <option value="User">User</option>
              </select>
            </div>
          </div>
          <div className="button-group mt-4">
            <button className="download-btn" onClick={DownloadCSV}>
              Download CSV <FaFileCsv />
            </button>
            <button
              className="download-btn"
              onClick={DownloadInvoice}
               
            >
              {" "}
              Download invoices  <FaFileInvoice />
            </button>
          </div>
        </div>

        {Invoice.length > 0 && (
          <table className="order-table">
            <thead>
              <tr>
                <th
                  className="order-table-heading "
                  style={{ padding: "10px" }}
                >
                  {" "}
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectAll}
                  />
                </th>
                <th className="order-table-heading text-start">
                  Invoice Number
                </th>
                <th className="order-table-heading">User Name</th>
                <th className="order-table-heading">User Contact</th>
                <th className="order-table-heading">Generated Date</th>
              </tr>
            </thead>
            <tbody>
              {Invoice?.map((v, i) => {
                return (
                  <tr className="order-table-row" key={i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(v.orderId)}
                        onChange={() => handleCheckboxChange(v.orderId)}
                      />
                    </td>
                    <td className="fw-bold">{v.invoiceNumber}</td>
                    <td className="fw-bold">{v.userName}</td>
                    <td className="fw-bold">{v.userContact}</td>
                    <td className="fw-bold">{convertToIST(v.generatedDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
 
        {Invoice.length === 0 && (
          <div className="no-transactions">
            <div className="folder-icon">
              <FaFileInvoice />
            </div>
            <p className="fs-2">No invoice Found</p>
          </div>
        )}
      </div>

      {/* Modal for Custom Date Range */}
      <Modal
        open={popup}
        onClose={() => setpopup(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
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
          <h2 style={{ marginBottom: "10px", color: "#0B2545" }}>
            Select Date Range
          </h2>
          <div className="d-flex gap-5">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  label="Start Date"
                  value={
                    customDates.startDate
                      ? dayjs(customDates.startDate, "DD-MM-YYYY")
                      : null
                  }
                  sx={{
                    bgcolor: "",
                  }}
                  onChange={(newValue) => {
                    if (newValue) {
                      const formattedDate = new Date(newValue);
                      // Format date as "DD/MM/YYYY"
                      const formattedString = `${
                        formattedDate.getDate() < 10
                          ? "0" + formattedDate.getDate()
                          : formattedDate.getDate()
                      }-${
                        formattedDate.getMonth() + 1 < 10
                          ? "0" + (formattedDate.getMonth() + 1)
                          : formattedDate.getMonth() + 1
                      }-${formattedDate.getFullYear()}`;

                      setCustomDates({
                        ...customDates,
                        startDate: formattedString, // Store formatted date string
                      });
                    } else {
                      setCustomDates({
                        ...customDates,
                        startDate: null, // Handle case for no date selected
                      });
                    }
                  }}
                  className="custom-date-picker"
                />
              </DemoContainer>
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  label="End Date"
                  value={
                    customDates.endDate
                      ? dayjs(customDates.endDate, "DD-MM-YYYY")
                      : null
                  }
                  onChange={(newValue) => {
                    if (newValue) {
                      const formattedDate = new Date(newValue);
                      // Format date as "DD/MM/YYYY"
                      const formattedString = `${
                        formattedDate.getDate() < 10
                          ? "0" + formattedDate.getDate()
                          : formattedDate.getDate()
                      }-${
                        formattedDate.getMonth() + 1 < 10
                          ? "0" + (formattedDate.getMonth() + 1)
                          : formattedDate.getMonth() + 1
                      }-${formattedDate.getFullYear()}`;

                      setCustomDates({
                        ...customDates,
                        endDate: formattedString, // Store formatted date string
                      });
                    } else {
                      setCustomDates({
                        ...customDates,
                        endDate: null, // Handle case for no date selected
                      });
                    }
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="contained"
              onClick={() => {
                setpopup(false);
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                bgcolor: "#0B2545",
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setpopup(false)}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {loding && <div className="loader-container">
      <div className="loader"></div>
      </div>}
    </>
  );
}
export default HistoryManagement;
