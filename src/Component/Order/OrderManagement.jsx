import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Initialize socket
const socket = io("https://7128-2409-40c1-43-9e0c-fb56-3b03-1901-a49b.ngrok-free.app/",{
  transports: ["websocket" ]
});

function OrderManagement() {
  const [NewOrder, setNewOrder] = useState([]);

  const [selectedOrders, setSelectedOrders] = useState([]); // Track selected orders
  const [selectAll, setSelectAll] = useState(false); // Track "Select All" checkbox state

  console.log(selectedOrders);

  // Function to convert UTC to IST
  const convertToIST = (utcTime) => {
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  useEffect(() => {
    socket.emit("placed-list", {});
    socket.on("placed-list-response", (data) => {
      console.log("Pending orders received from server:", data);
      setNewOrder(data.data);
    });

    const interval = setInterval(() => {
      socket.emit("placed-list", {});
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("pending-list-response");
    };
  }, []);

  // Handle individual checkbox selection
  const handleCheckboxChange = (orderId) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId) // Deselect if already selected
        : [...prevSelected, orderId] // Add if not already selected
    );
  };

  // Handle "Select All" functionality
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedOrders([]); // Deselect all orders
    } else {
      setSelectedOrders(NewOrder.map((order) => order._id)); // Select all orders
    }
    setSelectAll(!selectAll); // Toggle "Select All" checkbox
  };

  // Sync "Select All" checkbox with individual selections
  useEffect(() => {
    if (selectedOrders.length === NewOrder.length && NewOrder.length > 0) {
      setSelectAll(true); // All orders selected
    } else {
      setSelectAll(false); // Not all orders selected
    }
  }, [selectedOrders, NewOrder]);

  // Handle "Accept All" functionality
  const handleAcceptAll = () => {
    console.log("Accepted All Orders: ", selectedOrders);
    socket.emit("store-accept", {
      orderIds: selectedOrders,
      storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
    });
    socket.on("order-accepted-by-manager", (data) => {
      console.log(data);
    });
  };

  // Handle "Accept" for individual order
  const handleAcceptSingle = (orderId) => {
    console.log("Accepted Order ID: ", orderId);
    setSelectedOrders((prevSelected) => [...prevSelected, orderId]);
    socket.emit("store-accept", {
      orderIds: [orderId], // Send only the selected order's ID
      storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
    });
    socket.on("order-accepted-by-manager", (data) => {
      console.log(data);
    });
  };

  return (
    <>
      <div className="order-container m-0 p-0">
        <div className="row ">
          {/* <div className="col-md-12"> */}
            {/* <div className="dashboard-container p-0"> */}
              <div className="dashboard-content mt-3">
                {/* Checkbox Container */}
                <div className="checkbox-container d-flex  justify-content-around ">
                  <label >
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      className="mx-2"
                    />
                    Select All
                  </label>
                  <span style={{ marginLeft: "20px" }}>
                    Selected: {selectedOrders.length}
                  </span>
                  <button
                    onClick={handleAcceptAll}
                    disabled={selectedOrders.length === 0} // Disable if no checkboxes are selected
                  >
                    Accept All
                  </button>
                </div>

                <div className="orders-container">
                  <h2 className="section-heading">
                    New Orders ({NewOrder.length})
                  </h2>
                  <div className="order-list">
                    {NewOrder.map((v, i) => (
                      <div className="order-card" key={`received-${i}`}>
                        <p className="order-id d-flex ">
                          <input
                            id={`checkbox-${v._id}`}
                            className="Checkbox "
                            type="checkbox"
                            checked={selectedOrders.includes(v._id)}
                            onChange={() => handleCheckboxChange(v._id)}
                          />
                          <label htmlFor={`checkbox-${v._id}`}></label>
                          <div className="d-flex justify-content-between w-100">
                            <strong>
                              <span className="timer mx-2">ORDER ID:</span>
                              {v.orderIds}
                            </strong>
                            <p className="order-time">
                              Time: {convertToIST(v.createdAt)}
                            </p>
                          </div>
                        </p>
                        {v.items.map((Item, index) => (
                          <p className="order-item" key={`item-${index}`}>
                            <strong>
                              {Item.quantity}
                              <span>X&nbsp; &nbsp;</span>
                              {Item.itemName}
                            </strong>
                          </p>
                        ))}
                        <p className="order-delivery">
                          Address: {v.deliveryAddress}
                        </p>
                        <div className="order-actions">
                          <button className="reject-order-btn">Reject</button>
                          {/* Accept button for individual order */}
                          <button
                            className="accept-order-btn"
                            onClick={() => handleAcceptSingle(v._id)}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {NewOrder.length === 0 ? (
                <h1 className="text-center">No order Found</h1>
              ) : (
                ""
              )}
            {/* </div> */}
          {/* </div> */}
        </div>
      </div>
    </>
  );
}

export default OrderManagement;
