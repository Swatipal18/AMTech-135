import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import image from '../../../src/assets/Images/folder.png';

// Helper function to format dates
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

function HistoryManagement() {
    const [period, setPeriod] = useState('');
    const [category, setCategory] = useState('');
    const [client, setClient] = useState('');
    const [startDate, setStartDate] = useState(formatDate(new Date())); // Default to today
    const [endDate, setEndDate] = useState(formatDate(new Date())); // Default to today

    // Effect to handle setting default date range as the current month
    useEffect(() => {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        setStartDate(formatDate(startOfMonth));
        setEndDate(formatDate(endOfMonth));
    }, []);

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
        if (e.target.value === "today") {
            const today = new Date();
            setStartDate(formatDate(today));
            setEndDate(formatDate(today));
        } else if (e.target.value === "week") {
            const today = new Date();
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const endOfWeek = new Date(today.setDate(today.getDate() + 6));
            setStartDate(formatDate(startOfWeek));
            setEndDate(formatDate(endOfWeek));
        } else if (e.target.value === "month") {
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            setStartDate(formatDate(startOfMonth));
            setEndDate(formatDate(endOfMonth));
        } else if (e.target.value === "all") {
            setStartDate('');
            setEndDate('');
        }
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleClientChange = (e) => {
        setClient(e.target.value);
    };

    return (
        <div className="transaction-container">
            <h1>Transaction history</h1>

            <div className="filter-section">
                {/* Statement Period Dropdown */}
                <div className="dropdown-group">
                    <div className="custom-dropdown">
                        <label className='form-label fs-6' > Statement period</label>
                        <div className="dropdown-display w-100">

                            <span>{`${startDate} - ${endDate}`}</span>
                            <Calendar size={16} className="calendar-icon" />
                        </div>

                        <select value={period} onChange={handlePeriodChange}>

                            <option value="">Select period</option>
                            <option value="all">All</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 days</option>
                            <option value="month">Last Month</option>
                            <option value="year">Custom</option>
                        </select>
                    </div>

                    {/* Transaction Category Dropdown */}
                    <div className="custom-dropdown">
                        <label className='form-label fs-6' >Transaction category</label>
                        <div className="dropdown-display ">
                            <span>All transactions</span>
                            <i className="arrow-down"></i>
                        </div>
                        <select value={category} onChange={handleCategoryChange}>
                            <option value="">All transactions</option>
                            <option value="upi">UPI</option>
                            <option value="perks">Perks</option>
                        </select>
                    </div>

                    {/* Client Dropdown */}
                    <div className="custom-dropdown">
                        <label className='form-label fs-6' >Client</label>
                        <div className="dropdown-display">
                            <span>All clients</span>
                            <i className="arrow-down"></i>
                        </div>
                        <select value={client} onChange={handleClientChange}>
                            <option value="">All clients</option>
                            <option value="business">Business</option>
                            <option value="personal">Personal</option>
                        </select>
                    </div>
                </div>

                {/* Download Buttons */}
                <div className="button-group mt-4">

                    <button className="download-btn">Download CSV</button>
                    <button className="download-btn">Download invoices</button>
                </div>
            </div>

            {/* No Transactions Message */}
            <div className="no-transactions">
                <div className="folder-icon">
                    <img src={image} alt="" />
                </div>
                <p>No transactions meet your selected criteria</p>
            </div>
        </div>
    );
};

export default HistoryManagement;
