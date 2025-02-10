import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const socket_url = import.meta.env.VITE_SOCKET_URL
console.log('socket_url: ', socket_url);

const socket = io(socket_url, {
  transports: ["websocket"],
});

export default function PreperingOrder() {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [CurrentOrder, setCurrentOrder] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [toggleCheckbox, settoggleCheckbox] = useState(false);
  const [DeliveryBoy, setDeliveryBoy] = useState([]);

  useEffect(() => {
    socket.emit("current-list", {});
    socket.on("current-list-response", (data) => {
      setCurrentOrder(data.data);
    });
    const interval = setInterval(() => {
      socket.emit("current-list", {});
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("current-list-response");
    };
  }, []);


  const convertToIST = (utcTime) => {
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  const handleCheckboxChange = useCallback((orderId) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId)
        : [...prevSelected, orderId]
    );
   
  }, []);
  const handleSelectAllChange = () => {
    // setLoading(true)
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(CurrentOrder.map((order) => order._id));
      setSelectAll(!selectAll);
    }
  
  };
  const handleAcceptAll = async () => {
    // setLoading(true)
    const isConfirmed = window.confirm(
      "Are you sure you want to accept all orders?"
    );
    if (isConfirmed) {
      try {
        socket.emit("ready-accept", {
          orderIds: selectedOrders,
          storeManagerId: "6799c2f16bcd2e26260498eb",
        });
        socket.on("order-ready-for-delivery", (data) => {});
        const response = await axios.post(
          "http://192.168.1.12:9000/pickup-time",
          {
            type: "start",
            orderId: selectedOrders,
          }
        );
      } catch (error) {
        console.error("An error occurred:", error);
        alert("Something went wrong, please try again.");
      } finally {
      }
    } else {
    }
  };

  const handleAcceptSingle = async (orderId, deliveryBoyName) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to accept this order?"
    );
    if (isConfirmed) {
      // setLoading(true)
      socket.emit("ready-accept", {
        orderIds: [orderId],
        storeManagerId: "6799c2f16bcd2e26260498eb",
      });
      socket.on("order-ready-for-delivery", (data) => {
        setCurrentOrder((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, result: { ...order, orderStatus: "Prepared" } }
              : order
          )
        );
        // setLoading(false)
      });

      if (deliveryBoyName !== "No delivery boy assign") {
        const response = await axios.post(
          "http://192.168.1.12:9000/pickup-time",
          {
            type: "start",
            orderId: [orderId],
          }
        );
      }
      try {
      } catch (error) {
        console.error("An error occurred:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
    }
  };

  const currentOrders = CurrentOrder.filter(
    (order) => order.currentStatus === "Confirmed"
  );
  const preparedOrders = CurrentOrder.filter(
    (order) => order.currentStatus === "Prepared"
  );
  console.log(preparedOrders)

  /*  this logic for delivery boy time API calling  */

  const prevDeliveryBoyRef = useRef(new Map()); // Store previous delivery boy names
  const handledOrders = useRef(new Set());
  useEffect(() => {
    if (!CurrentOrder.length) return;
    CurrentOrder.forEach((order) => {
      if (order.currentStatus !== "Prepared") return;

      const prevDeliveryBoy = prevDeliveryBoyRef.current.get(order._id);
      const isDeliveryBoyAssigned =
        order.deliveryBoyName &&
        order.deliveryBoyName !== "No delivery boy assign" &&
        order.deliveryBoyName !== prevDeliveryBoy;
      if (isDeliveryBoyAssigned && !handledOrders.current.has(order._id)) {
        prevDeliveryBoyRef.current.set(order._id, order.deliveryBoyName);
        handledOrders.current.add(order._id); // Mark this order as handled

        // ✅ API call for this specific order
        (async () => {
          console.log("Starting pickup timer for Order:", order._id);
          try {
            const response = await axios.post(
              "http://192.168.1.12:9000/pickup-time",
              {
                type: "start",
                orderId: [order._id], // Send single orderId
              }
            );
          } catch (error) {
            console.log("error): ", error);
            console.error(`Error calling API for Order ${order._id}:`, error);
          }
        })();
      }
    });
  }, [JSON.stringify(CurrentOrder)]); // ✅ Detect actual changes
  useEffect(() => {
    if (currentOrders.length === 0) {
      setSelectAll(false);
    } else if (
      selectedOrders.length === CurrentOrder.length &&
      CurrentOrder.length > 0
    ) {
      setSelectAll(true); // If all orders are selected, check 'Select All'
    } else {
      setSelectAll(false); // Otherwise, uncheck 'Select All'
    }
  }, [selectedOrders, CurrentOrder]);
  const mainSectionRef = useRef(null);

  // Handle the dropdown change event
  const handleChange = (event) => {
    const value = event.target.value;

    if (value === "Prepared" && mainSectionRef.current) {
      // Scroll to the element with ref
      mainSectionRef.current.scrollIntoView({
        behavior: "smooth", // Smooth scrolling effect
        block: "start", // Aligns to the start of the viewport
      });
    }
  };

  function AssignedDeliveryBoy(d_id, old_id, order_id, delivery_boy_name) {
    if (delivery_boy_name === "No delivery boy assign") {
      socket.emit("assign-delivery-boy", {
        adminId: "67518bbd9e282cc015c3c04a",
        deliveryBoyId: d_id,
        orderId: order_id,
      });
      socket.on("delivery-boy-assigned", (data) => {
        console.log("data: ", data);
      });
    } else {
      socket.emit("assign-delivery-boy", {
        adminId: "67518bbd9e282cc015c3c04a",
        deliveryBoyId: d_id,
        orderId: order_id,
        oldDeliveryBoyId: old_id,
      });
      socket.on("delivery-boy-assigned", (data) => {
        console.log("data: ", data);
      });
    }
    console.log(" order_id: ", order_id);
  }
  function AssignDeliveryBoy(v) {
    socket.emit("delivery-list", {});
    socket.on("delivery-boy-list", (data) => {
      setDeliveryBoy(data.data);
    });
    setAssignOrderId(v._id);
  }
  return (
    <>
      <div className="checkbox-container d-flex justify-content-around  align-items-center">
        <p className="mt-3 fs-5">Current Orders({CurrentOrder.length})</p>
        <label>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAllChange}
            className="mx-2"
            onClick={() => settoggleCheckbox(true)}
          />
          Select All
        </label>
        <span style={{ marginLeft: "20px" }}>
          <label>
            <input
              type="checkbox"
              onClick={() => settoggleCheckbox(!toggleCheckbox)}
            />
            Select
          </label>
        </span>
        <button
          onClick={handleAcceptAll}
          disabled={selectedOrders.length === 0}
        >
          Accept All
        </button>
        <select
          className="prepering-drop-down text-center"
          onChange={handleChange}
        >
          <option value="all">All</option>
          <option value="Prepared">Prepared</option>
        </select>
      </div>
      <div className="Currant-Order mt-2">
        <div className="orders-container mt-5">
          <h2 className="section-heading text-center">
            <span className="line"></span>
            preparing Orders ({currentOrders.length})
            <span className="line"></span>
          </h2>
          <h1 className="text-center">
            {currentOrders.length === 0 ? "No Preparing Order Found" : ""}
          </h1>

          {/* {loading && (
            <div className="loader-container d-flex justify-content-center">
              <div className="loader"></div>
            </div>
          )} */}
          <div className="order-list">
            {currentOrders.map((v, i) => (
              <div className="order-card" key={`received-${i}`}>
                <p className="order-id d-flex justify-content-around">
                  <strong>
                    <span className="timer">ORDER ID : {v.orderIds}</span>
                    {v.orderId}
                  </strong>
                  <p className="order-time">
                    <span className="timer">RECEIVED ON:</span>&nbsp;
                    {convertToIST(v.acceptedAt)}
                  </p>
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
                {v.items?.map((Item, index) => (
                  <p className="order-item" key={index}>
                    <strong>
                      {Item.quantity} <span>X&nbsp; &nbsp;</span>
                      {Item.itemName} ({Item.size.sizeName})
                    </strong>
                  </p>
                ))}

                <p className="order-delivery">
                  <span className="timer delivery-timer">DELIVERY : </span>{" "}
                  {v.deliveryAddress}
                </p>
                <p className="delivery-boy">
                  <span className={`timer `}>
                    DELIVERY BOY: &nbsp;{" "}
                    <span
                      className={`${
                        v.deliveryBoyName === "No delivery boy assign"
                          ? "status-red"
                          : "thatus-white"
                      }`}
                    >
                      {v.deliveryBoyName}{" "}
                    </span>{" "}
                  </span>{" "}
                  &nbsp; &nbsp;
                  <span
                    className="ressign"
                    onClick={() => AssignDeliveryBoy(v)} // Open only this specific box
                  >
                    {v.deliveryBoyName === "No delivery boy assign"
                      ? "ASSIGN NOW"
                      : "REASSIGN ANOTHER"}
                  </span>
                  <div
                    className={`delivery-boy-box ${
                      assignOrderId === v._id ? "delivery-boy-box" : "box-close"
                    }`}
                  >
                    <div className="delivery-boy-detail">
                      <p className="delivery-boy-heading">
                        online delivery boys
                      </p>
                      <button
                        className="delivery-close-btn"
                        onClick={() => setAssignOrderId(null)} // Close the box
                      >
                        X
                      </button>
                    </div>
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th className="box-table-heading text-start">Name</th>
                          <th className="box-table-heading text-center">
                            Active orders
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DeliveryBoy.map((DeliveryBoy) => {
                          return (
                            <tr
                              className="order-table-row-box"
                              onClick={() =>
                                AssignedDeliveryBoy(
                                  DeliveryBoy._id,
                                  v.deliveryBoyId,
                                  v._id,
                                  v.deliveryBoyName
                                )
                              }
                            >
                              <td className="fw-bold text-start">
                                {DeliveryBoy.username}
                              </td>
                              <td className="fw-bold text-center">
                                {DeliveryBoy.activeOrders}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </p>
                <div className="order-actions">
                  <button
                    onClick={() => handleAcceptSingle(v._id, v.deliveryBoyName)}
                    className="accept-order-btn w-100"
                  >
                    READY TO PICKUP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prepared Orders Section */}

      <div className="prepering-orders" id="main" ref={mainSectionRef}>
        <div className="orders-container">
          <h2 className="section-heading text-center">
            <span className="line"></span>
            Prepared Orders ({preparedOrders.length})
            <span className="line"></span>
          </h2>
          <h1 className="text-center no-order">
            {preparedOrders.length === 0 ? "No prepared Order Found" : ""}
          </h1>
          <div className="order-list">
            {preparedOrders.map((v, i) => (
              <div
                className="order-card"
                key={`prepared-${i}`}
                style={{ backgroundColor: "#0B2545" }}
              >
                <p className="order-id d-flex justify-content-around">
                  <strong>
                    <span className="timer1 ">ORDER ID : {v.orderIds}</span>
                    {v.orderId}
                  </strong>
                  <p className="order-time">
                    <span className="timer1 ">RECEIVED ON:</span>&nbsp;
                    {convertToIST(v.acceptedAt)}
                  </p>
                </p>
                {v.items?.map((Item, index) => (
                  <p className="order-item" key={index}>
                    <strong>
                      {Item.quantity} <span>x&nbsp; &nbsp;</span>
                      {Item.itemName} ({Item.size.sizeName})
                    </strong>
                  </p>
                ))}
                <p className="order-delivery">
                  <span className="timer1 ">DELIVERY : </span>{" "}
                  {v.deliveryAddress}
                </p>
                <p className="delivery-boy">
                  <span className={`timer `}>
                    DELIVERY BOY: &nbsp;{" "}
                    <span
                      className={`${
                        v.deliveryBoyName === "No delivery boy assign"
                          ? "status-red"
                          : "thatus-white"
                      }`}
                    >
                      {v.deliveryBoyName}{" "}
                    </span>{" "}
                  </span>{" "}
                  &nbsp; &nbsp;
                  <span
                    className="ressign"
                    onClick={() => AssignDeliveryBoy(v)} // Open only this specific box
                  >
                    {v.deliveryBoyName === "No delivery boy assign"
                      ? "ASSIGN NOW"
                      : "REASSIGN ANOTHER"}
                  </span>
                  <div
                    className={`delivery-boy-box ${
                      assignOrderId === v._id ? "delivery-boy-box" : "box-close"
                    }`}
                  >
                    <div className="delivery-boy-detail">
                      <p className="delivery-boy-heading">
                        online delivery boys
                      </p>
                      <button
                        className="delivery-close-btn"
                        onClick={() => setAssignOrderId(null)} // Close the box
                      >
                        X
                      </button>
                    </div>
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th className="box-table-heading text-start">Name</th>
                          <th className="box-table-heading text-center">
                            Active orders
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DeliveryBoy.map((DeliveryBoy) => {
                          return (
                            <tr
                              className="order-table-row-box"
                              onClick={() =>
                                AssignedDeliveryBoy(
                                  DeliveryBoy._id,
                                  v.deliveryBoyId,
                                  v._id,
                                  v.deliveryBoyName
                                  
                                )
                              }
                            >
                              <td className="fw-bold text-start">
                                {DeliveryBoy.username}
                              </td>
                              <td className="fw-bold text-center">
                                {DeliveryBoy.activeOrders}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </p>
                <div className={`order-actions `} >
                  <button className={`Prepering-order-btn w-100 ${v.colour === "Red" ? 'red' : v.colour === "Yellow" ? 'Yellow' : ''}`} disabled>
                   {` ${v.colour === "Red" ? 'REASSIGNED FOR PICKUP' : v.colour === "Yellow" ? 'DELAYED FOR PICKUP' : 'READY TO PICKUP'}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
