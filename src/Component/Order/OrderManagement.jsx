import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket_url =  import.meta.env.VITE_SOCKET_URL
const socket = io(socket_url, { transports: ["websocket"] });

function OrderManagement() {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [toggleCheckbox, settoggleCheckbox] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loader state
  const tone = new Audio("/public/Audios/new-order-store-admin.mp3");
  const [NewOrder, setNewOrder] = useState([]);
  const prevOrderLength = useRef(0);
  
  useEffect(() => {
    if (NewOrder.length > prevOrderLength.current) {
      tone.play().catch((error) => {
        console.error("Audio play error:", error);
      });
    }
    prevOrderLength.current = NewOrder.length;
  }, [NewOrder]); // जब भी NewOrder बदलेगा, चेक होगा
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (NewOrder.length > 0) {
        tone.play().catch((error) => {
          console.error("Audio play error:", error);
        });
      }
    }, 10000);
  
    return () => clearInterval(interval);
  }, [NewOrder.length]); // हर 10 सेकंड में ऑर्डर चेक होगा
  

  const convertToIST = (utcTime) => {
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  useEffect(() => {
    setLoading(true);
    socket.emit("placed-list", {});
    socket.on("placed-list-response", (data) => {
      setNewOrder(data.data);
      setLoading(false); 
    });

    const interval = setInterval(() => {
      socket.emit("placed-list", {});
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("placed-list-response");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("length", NewOrder.length);
  }, [NewOrder]);

  // Handle individual checkbox selection
  const handleCheckboxChange = (orderId) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId)
        : [...prevSelected, orderId]
    );
  };

  // Handle "Select All" functionality
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(NewOrder.map((order) => order._id));
    }
    setSelectAll(!selectAll);
  };

  // Sync "Select All" checkbox with individual selections
  useEffect(() => {
    if (selectedOrders.length === NewOrder.length && NewOrder.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedOrders, NewOrder]);

  // Handle "Accept All" functionality
  const handleAcceptAll = () => {
    if (selectedOrders.length === 0) return;
    setLoading(true); // ✅ Show loader while accepting orders

    socket.emit("store-accept", {
      orderIds: selectedOrders,
      storeManagerId: "6799c2f16bcd2e26260498eb",
    });

    socket.on("order-accepted-by-manager", (data) => {
      setSelectedOrders([]); // Clear selection
      setLoading(false); // ✅ Hide loader after acceptance
    });
  };

  // Handle "Accept" for individual order
  const handleAcceptSingle = (orderId) => {
    setLoading(true); // ✅ Show loader while accepting a single order

    socket.emit("store-accept", {
      orderIds: [orderId],
      storeManagerId: "6799c2f16bcd2e26260498eb",
    });

    socket.on("order-accepted-by-manager", (data) => {
      setLoading(false); // ✅ Hide loader after acceptance
    });
  };

  return (
    <div className="order-container m-0 p-0">
      <div className="row">
        <div className="dashboard-content p-2">
          <div className="checkbox-container d-flex justify-content-around">
            <label>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
                className="mx-2"
              />
              Select All
            </label>
            <span style={{ marginLeft: "20px" }}>
              <label>
                <input
                  type="checkbox"
                  onClick={() => settoggleCheckbox(!toggleCheckbox)}
                />
                &nbsp;
                Select
              </label>
            </span>
            <button
              className={selectedOrders.length === 0 ? "blue" : ""}
              onClick={handleAcceptAll}
              disabled={selectedOrders.length === 0}
            >
              Accept All
            </button>
          </div>

          <div className="orders-container">
            <h2 className="section-heading">New Orders ({NewOrder.length})</h2>
          {loading && (
            <div className="loader-container d-flex justify-content-center">
              <div className="loader"></div>
            </div>
          )}
            {/* Orders List */}
            <div className="order-list">
              {NewOrder.map((v, i) => (
                <div className="order-card" key={`received-${i}`}>
                  <p className="order-id d-flex">
                    <div className="d-flex justify-content-between w-100">
                      <strong>
                        <span className="timer mx-2">ORDER ID:</span>
                        {v.orderIds}
                      </strong>
                      <p className="order-time">Time: {convertToIST(v.createdAt)}</p>
                    </div>
                    <input
                      id={`checkbox-${v._id}`}
                      className="Checkbox"
                      type="checkbox"
                      checked={selectedOrders.includes(v._id)}
                      onChange={() => handleCheckboxChange(v._id)}
                    />
                    <label
                      htmlFor={`checkbox-${v._id}`}
                      style={{ display: `${toggleCheckbox ? "block" : "none"}` }}
                    ></label>
                  </p>
                  {v.items.map((Item, index) => (
                    <p className="order-item" key={`item-${index}`}>
                      <strong>
                        {Item.quantity}
                        <span>&nbsp;x &nbsp;</span>
                        {Item.itemName} ({Item.size.sizeName})
                      </strong>
                    </p>
                  ))}
                  <p className="order-delivery " style={{fontSize:"12px"}}>
                    <span style={{opacity:"0.5"}}>DELIVERY:</span> {v.deliveryAddress.toUpperCase()}
                  </p>
                  <div className="order-actions">
                    <button className="reject-order-btn">Reject</button>
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

        {!loading && NewOrder.length === 0 ?  <h1 className="text-center">No orders Found</h1> : ''}
      </div>
    </div>
  );
}

export default OrderManagement;


