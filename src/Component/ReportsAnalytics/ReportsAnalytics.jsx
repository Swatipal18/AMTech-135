import React, { useState } from 'react'


function ReportsAnalytics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    return (
        <div className='page-container'>
            {loading ? (
                <div className="loader-container d-flex justify-content-center">
                    <div className="loader"></div>
                </div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="page-content">
                    {/* Your content */}
                </div>
            )}
        </div>
    )
}

export default ReportsAnalytics