 import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
 
const socket = io("https://7128-2409-40c1-43-9e0c-fb56-3b03-1901-a49b.ngrok-free.app/",{
  transports: ["websocket"]
});
 export default function Outfordelivery() {
   const [OutOrder, setOutOrder] = useState([])
  //  console.log(OutOrder)
    useEffect(()=>{
        socket.emit('delivery-list' , {})
        socket.on('delivery-list-response', (data)=>{
            setOutOrder(data.data)
        })
        const interval = setInterval(() => {
          socket.emit("delivery-list", {});
        }, 100000);
        return () => {
          clearInterval(interval);
          socket.off("delivery-list-response");
        };
    })
    
    const convertToIST = (utcTime) => {
      const options = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
    };
   return (
    <div className="Currant-Order p-3">
    <div className="orders-container">
  <h2 className="section-heading"> out for delivery orders
     ({OutOrder.length})
     </h2>
  <div className="order-list">
    { OutOrder.map((v, i) => (
      <div className="order-card" >
        <p className="order-id d-flex justify-content-around">
          <strong><span className="timer">ORDER ID  :
             {v.result.orderIds}
              </span>
              {v.orderId}
             </strong>
          <p className="order-time"><span className="timer">PICKED ON:
            </span>&nbsp;
             {convertToIST(v.deliveryEndTime)}
            </p>
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
          
          <span className="timer">DELIVERY : </span> 
          {v.result.deliveryAddress}
        </p>
        <p className="delivery-boy">
          <span className="timer">DELIVERY BOY: </span>
          {v.deliveryBoyName}
       
        </p>
      </div>
    ))} 
  </div>
</div>
</div>
   )
 }
 