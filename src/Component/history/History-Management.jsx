import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { FaFileInvoice } from "react-icons/fa";
import axios from "axios";
import { Box, Button, Modal } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
const baseUrl = import.meta.env.VITE_API_URL;

function HistoryManagement() {
  const [popup, setpopup] = useState(false);
  const [dropdownValues, setDropdownValues] = useState({
    dateFilter: "all",
    paymentMethod: "",
    userType: "",
  });
  const [Invoice, setInvoice] = useState([]);
//   const firstDropdownSelect = useRef(false);

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
      filters.startDate = customDates.startDate 
      filters.endDate = customDates.endDate
    } else {
        if(dropdownValues.dateFilter === "all"){
            filters.dateRange = "all";
        }
      else if (dropdownValues.dateFilter === "today") {
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
  }, [dropdownValues , popup]);

  function main() {
    setpopup(true);
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
              <div className="dropdown-display w-100">
                <Calendar size={16} className="calendar-icon" onClick={main} />
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
                value={dropdownValues.dateFilter}
                onChange={(e) => {
                  setDropdownValues({
                    ...dropdownValues,
                    dateFilter: e.target.value,
                  });

                  // Jab bhi dropdown se koi option select ho, custom date ko reset kar do
                  setCustomDates({ startDate: null, endDate: null });
                }}
              >
                
                <option value="ALL">ALL</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last Month</option>
              </select>
            </div>

            {/* Transaction Category Dropdown */}
            <div className="custom-dropdown">
              <label className="form-label fs-6">Transaction category</label>
              <div className="dropdown-display">
                <span>
                  {dropdownValues.paymentMethod === ""
                    ? "All transactions"
                    : dropdownValues.paymentMethod}
                </span>
                <i className="arrow-down"></i>
              </div>
              <select
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
              <div className="dropdown-display">
                <span>
                  {dropdownValues.userType === ""
                    ? "All userTypes"
                    : dropdownValues.userType}
                </span>
                <i className="arrow-down"></i>
              </div>
              <select
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
            <button className="download-btn">Download CSV</button>
            <button className="download-btn">Download invoices</button>
          </div>
        </div>

        {Invoice.length > 0 && (
          <table className="order-table">
            <thead>
              <tr>
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
                    <td className="fw-bold">{v.invoiceNumber}</td>
                    <td className="fw-bold">{v.userName}</td>
                    <td className="fw-bold">{v.userContact}</td>
                    <td className="fw-bold">{v.generatedDate}</td>
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
            width: 500,
            bgcolor: "white",
            p: 3,
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
      value={customDates.startDate ? dayjs(customDates.startDate, "DD-MM-YYYY") : null}
      onChange={(newValue) => {
        if (newValue) {
          const formattedDate = new Date(newValue);
          // Format date as "DD/MM/YYYY"
          const formattedString = `${formattedDate.getDate() < 10 ? '0' + formattedDate.getDate() : formattedDate.getDate()}-${formattedDate.getMonth() + 1 < 10 ? '0' + (formattedDate.getMonth() + 1) : formattedDate.getMonth() + 1}-${formattedDate.getFullYear()}`;
          
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
      value={customDates.endDate ? dayjs(customDates.endDate, "DD-MM-YYYY") : null}
      onChange={(newValue) => {
        if (newValue) {
          const formattedDate = new Date(newValue);
          // Format date as "DD/MM/YYYY"
          const formattedString = `${formattedDate.getDate() < 10 ? '0' + formattedDate.getDate() : formattedDate.getDate()}-${formattedDate.getMonth() + 1 < 10 ? '0' + (formattedDate.getMonth() + 1) : formattedDate.getMonth() + 1}-${formattedDate.getFullYear()}`;
          
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
              color="primary"
              onClick={() => {
                setpopup(false);
              }}
              sx={{ borderRadius: "8px", textTransform: "none" }}
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
    </>
  );
}

export default HistoryManagement;
