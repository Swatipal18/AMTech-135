import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io("https://7128-2409-40c1-43-9e0c-fb56-3b03-1901-a49b.ngrok-free.app/",{
  transports: ["websocket"]
});

export default function PreperingOrder() {
   const [CurrentOrder, setCurrentOrder] = useState([])
   const [selectedOrders, setSelectedOrders] = useState([]);  
      const [selectAll, setSelectAll] = useState(false);


  //       console.log(selectedOrders)
  //  console.log(CurrentOrder)
      
      useEffect(() => {
        socket.emit("current-list", {});
        socket.on("current-list-response", (data) => {
         
          setCurrentOrder(data.data)
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
   
      
      // Track "Select All" checkbox state
      const handleCheckboxChange = (orderId) => {
        setSelectedOrders((prevSelected) =>
          prevSelected.includes(orderId)
            ? prevSelected.filter((id) => id !== orderId) // Deselect if already selected
            : [...prevSelected, orderId] // Add if not already selected
        );
      };
      const handleSelectAllChange = () => {
          if (selectAll) {
            setSelectedOrders([]); // Deselect all orders
          } else {
            setSelectedOrders(CurrentOrder.map((order) => order.result._id)); // Select all orders
          }
          setSelectAll(!selectAll); // Toggle "Select All" checkbox
        };
      
        // Sync "Select All" checkbox with individual selections
        useEffect(() => {
          if (selectedOrders.length === CurrentOrder.length && CurrentOrder.length > 0) {
            setSelectAll(true); // All orders selected
          } else {
            setSelectAll(false); // Not all orders selected
          }
        }, [selectedOrders, CurrentOrder]);

        const handleAcceptAll = () => {
          // console.log("Accepted All Orders: ", selectedOrders);
          socket.emit("ready-accept", {
            orderIds: selectedOrders,
            storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
          });
          socket.on("order-ready-for-delivery", (data) => {
            // console.log(data);
          });
        };
      
        // Handle "Accept" for individual order
        const handleAcceptSingle = (orderId) => {
          // console.log("Accepted Order ID: ", orderId);
          setSelectedOrders((prevSelected) => [...prevSelected, orderId]);
          socket.emit("ready-accept", {
            orderIds: [orderId], 
            storeManagerId: "6789fa0a5f0f9cdc7ee5f897",
          });
          socket.on("order-ready-for-delivery", (data) => {
            // console.log(data);
          });
        };

    const [DELIVERYBOY,SETDELIVERYBOY] = useState([])

  return (
  <div className="Currant-Order mt-5">
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

                  {/* Accept All Button - Disabled if no checkboxes are selected */}
                  <button
                    onClick={handleAcceptAll}
                    disabled={selectedOrders.length === 0} // Disable if no checkboxes are selected
                  >
                    Accept All
                  </button>
                </div>
                    <div className="orders-container">
                  <h2 className="section-heading">current orders ({CurrentOrder.length})</h2>
                  <div className="order-list">
                    {CurrentOrder.map((v, i) => (
                      <div className="order-card" key={`received-${i}`}>
                        <p className="order-id d-flex justify-content-around">
                        <input
                            id={`checkbox-${v.result._id}`}
                            className="Checkbox "
                            type="checkbox"
                            checked={selectedOrders.includes(v.result._id)}
                            onChange={() => handleCheckboxChange(v.result._id)}
                          />
                          <label htmlFor={`checkbox-${v.result._id}`}></label>
                          <strong><span className="timer">ORDER ID  : {v.result.orderIds} </span>{v.orderId}</strong>
                          <p className="order-time"><span className="timer">RECEIVED ON:</span>&nbsp; {convertToIST(v.result.acceptedAt)}</p>
                        </p>
                        {v.result.items?.map((Item, index) => {
                          return (
                            <>
                            <p className="order-item">
                              <strong>
                                {Item.quantity}
                                <span>X&nbsp; &nbsp;</span>
                                {Item.itemName}
                              </strong>
                             </p>
                             </>
                          );
                        })}

                        <p className="order-delivery  ">
                          
                          <span className="timer">DELIVERY : </span> {v.result.deliveryAddress}
                        </p>
                        <p className="delivery-boy">
                          <span className="timer">DELIVERY BOY: </span>{v.deliveryBoyName}<span className='ressign'>REASSIGN ANOTHER</span>
                        </p>
                        
                        <div className="order-actions">
                          <button  
                          onClick={()=>handleAcceptSingle(v.result._id)}
                           className="accept-order-btn w-100">READY TO PICKUP</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  </div>
  )
}
