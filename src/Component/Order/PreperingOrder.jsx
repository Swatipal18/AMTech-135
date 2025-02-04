import axios from "axios";
import React, { useEffect, useState, useRef,useCallback } from "react";
import { io } from "socket.io-client";

// const socket = io("http://192.168.1.12:3000/", {
({
  transports: ["websocket"],
});

export default function PreperingOrder() {
  const [CurrentOrder, setCurrentOrder] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
 
  const [selectAll, setSelectAll] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null); // State to track which order has the box open
  const [toggleCheckbox , settoggleCheckbox] = useState(false)

   
  useEffect(() => {
    socket.emit("current-list", {});
    socket.on("current-list-response", (data) => {
      setCurrentOrder(data.data);
    });

    const interval = setInterval(() => {
      socket.emit("current-list", {});
    }, 1000000000000);

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

  // const handleCheckboxChange = (orderId ) => {
  //   setSelectedOrders((prevSelected) =>
  //     prevSelected.includes(orderId)
  //       ? prevSelected.filter((id) => id !== orderId)
  //       : [...prevSelected, orderId]
  //   );
  // };

  const handleCheckboxChange = useCallback((orderId) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId)
        : [...prevSelected, orderId]
    );
  }, []);

  
  
  

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(CurrentOrder.map((order) => order._id));
    setSelectAll(!selectAll);
    
    }
  };


  // const handleAcceptAll = async() => {
     
  //   const isConfirmed = window.confirm("Are you sure you want to accept all orders?");
    
  //   if (isConfirmed) {
  //     socket.emit("ready-accept", {
  //       orderIds: selectedOrders,
  //       storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
  //     });
  //     socket.on("order-ready-for-delivery", (data) => {
  //       console.log(data)
  //     });
  //     try {
  //       const response = await axios.post("http://192.168.1.12:9000/pickup-time", {
  //         "type": "start",
  //         "orderId": [selectedOrders],
  //       });
  //     } catch (error) {
  //       console.error("An error occurred:", error);
  //       alert("Something went wrong, please try again.");
  //     }
  //   } else {
  //     console.log("Action canceled by the user.");
  //   }
  // };

  const handleAcceptAll = async () => {
    const isConfirmed = window.confirm("Are you sure you want to accept all orders?");
    
    if (isConfirmed) {
      try {
        socket.emit("ready-accept", {
          orderIds: selectedOrders,
          storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
        });
         
        socket.on("order-ready-for-delivery", (data) => {
         
        });
        await axios.post("http://192.168.1.12:9000/pickup-time", {
          type: "start",
          orderId: selectedOrders,
        });
      } catch (error) {
        console.error("An error occurred:", error);
        alert("Something went wrong, please try again.");
      }
    } else {
      console.log("Action canceled by the user.");
    }
  };
  


  const handleAcceptSingle = async (orderId, deliveryBoyName) => {
     
      const isConfirmed = window.confirm("Are you sure you want to accept this order?");
      if (isConfirmed) {
        socket.emit("ready-accept", {
          orderIds: [orderId],
          storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
        });
        socket.on("order-ready-for-delivery", (data) => {
          // const updatedOrders = CurrentOrder.map((order) =>
          //   order._id === orderId
          //     ? { ...order, result: { ...order, orderStatus: "Prepared" } }
          //     : order
          // );
          // setCurrentOrder(updatedOrders);
          setCurrentOrder((prevOrders) => prevOrders.map(order =>
            order._id === orderId ? { ...order, result: { ...order, orderStatus: "Prepared" } } : order
          ));
          
        });
        try {
          const response = await axios.post("http://192.168.1.12:9000/pickup-time", {
            "type": "start",
            "orderId": [orderId],
          });
          // Handle the response if needed
          console.log(response.data); // Example: log the response
        } catch (error) {
          console.error("An error occurred:", error);
          alert("Something went wrong, please try again.");
        }
      } 
      else {
        console.log("Action canceled by the user.");
      }
    
    // Add confirmation before accepting a single order
    
  };

  const currentOrders = CurrentOrder.filter(
    (order) => order.currentStatus === "Confirmed"
  );
  const preparedOrders = CurrentOrder.filter(
    (order) => order.currentStatus === "Prepared"
  );
  
  useEffect(() => {
    if (currentOrders.length === 0) {
      setSelectAll(false); // If there are no orders, uncheck the 'Select All' checkbox
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

  return (
    <>
      <div className="Currant-Order mt-2">
        <div className="checkbox-container d-flex justify-content-around  align-items-center">
          <p className="mt-3 fs-5">Current Orders({currentOrders.length})</p>
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAllChange}
              className="mx-2"
              onClick={()=>settoggleCheckbox(!toggleCheckbox)}
            />
            Select All
          </label>
          <span style={{ marginLeft: "20px" }}>
            <button onClick={()=>settoggleCheckbox(!toggleCheckbox)}>select</button>
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
        <div className="orders-container mt-5">
          <h2 className="section-heading text-center">
            <span className="line"></span>
            preparing Orders ({currentOrders.length})
            <span className="line"></span>
          </h2>

          <div className="order-list">
            {currentOrders.map((v, i) => (
              <div className="order-card" key={`received-${i}`}>
                <p className="order-id d-flex justify-content-around">
                  <strong>
                    <span className="timer">
                      ORDER ID : {v.orderIds}
                    </span>
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
                    onChange={() => handleCheckboxChange(v._id , )}
                  />
                  <label htmlFor={`checkbox-${v._id}`}  style={{display:`${toggleCheckbox ? 'block' :'none'}`}}></label>
                </p>
                {v.items?.map((Item, index) => (
                  <p className="order-item" key={index}>
                    <strong>
                      {Item.quantity} <span>X&nbsp; &nbsp;</span>
                      {Item.itemName}
                    </strong>
                  </p>
                ))}

                <p className="order-delivery">
                  <span className="timer delivery-timer">DELIVERY :  </span>{" "}
                  {v.deliveryAddress}
                </p>
                <p className="delivery-boy">
                  <span className={`timer `}>DELIVERY BOY: &nbsp; <span className={`${v.deliveryBoyName === "No delivery boy assign" ? 'status-red' :'thatus-white'}`}>{v.deliveryBoyName}  </span> </span> &nbsp;
                   &nbsp;
                  <span
                    className="ressign"
                    onClick={() => setAssignOrderId(v._id)} // Open only this specific box
                  >
                    {v.deliveryBoyName === "No delivery boy assign" ? 'ASSIGN NOW' : 'REASSIGN ANOTHER'}
                    
                  </span>
                  <div
                    className={`delivery-boy-box ${
                      assignOrderId === v._id
                        ? "delivery-boy-box"
                        : "box-close"
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
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Anmol Patel</td>
                          <td className="fw-bold text-center">4</td>
                        </tr>
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Dharm Kumar</td>
                          <td className="fw-bold text-center">6</td>
                        </tr>
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Rakesh Patel</td>
                          <td className="fw-bold text-center">9</td>
                        </tr>
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Ashish Kumar</td>
                          <td className="fw-bold text-center">11</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </p>
                <div className="order-actions">
                  <button
                    onClick={() => handleAcceptSingle(v._id , v.deliveryBoyName )}
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
          <div className="order-list">
            {preparedOrders.map((v, i) => (
              <div
                className="order-card"
                key={`prepared-${i}`}
                style={{ backgroundColor: "#0B2545"}}
              >
                <p className="order-id d-flex justify-content-around">
                  <strong>
                    <span className="timer1 ">
                      ORDER ID : {v.orderIds}
                    </span>
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
                      {Item.itemName}
                    </strong>
                  </p>
                ))}
                <p className="order-delivery">
                  <span className="timer1 ">DELIVERY : </span>{" "}
                  {v.deliveryAddress}
                </p>
                <p className="delivery-boy">
                <span className={`timer `}>DELIVERY BOY: &nbsp; <span className={`${v.deliveryBoyName === "No delivery boy assign" ? 'status-red' :'thatus-white'}`}>{v.deliveryBoyName}  </span> </span> &nbsp;
                   &nbsp;
                  <span
                    className="ressign"
                    onClick={() => setAssignOrderId(v._id)} // Open only this specific box
                  >
                    {v.deliveryBoyName === "No delivery boy assign" ? 'ASSIGN NOW' : 'REASSIGN ANOTHER'}
                    
                  </span>
                  <div
                    className={`delivery-boy-box ${
                      assignOrderId === v._id
                        ? "delivery-boy-box"
                        : "box-close"
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
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Anmol Patel</td>
                          <td className="fw-bold text-center">4</td>
                        </tr>
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Dharm Kumar</td>
                          <td className="fw-bold text-center">6</td>
                        </tr>
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Rakesh Patel</td>
                          <td className="fw-bold text-center">9</td>
                        </tr>
                        <tr className="order-table-row-box">
                          <td className="fw-bold text-start">Ashish Kumar</td>
                          <td className="fw-bold text-center">11</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </p>
                <div className="order-actions">
                  <button className="Prepering-order-btn w-100" disabled>
                    READY TO PICKUP
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
