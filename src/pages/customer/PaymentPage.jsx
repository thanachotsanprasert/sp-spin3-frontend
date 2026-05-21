import React, { useContext } from "react";
import { OrdersContext } from "../../context/ordersContext/OrdersContext";
import CheckoutSteps from "../../component/customer/CheckoutStep";
import OrderSummary from "../../component/customer/OrderSummary";
import { useLocation } from "react-router-dom"; // 1. import useLocation

export default function PaymentPage() {
  const { orderList } = useContext(OrdersContext);
  
  // 2. เรียกใช้งาน useLocation เพื่อรับข้อมูลจากหน้า Booking
  const location = useLocation();
  const bookingData = location.state; 
  // ตัวอย่างการดึงค่า: bookingData?.bookingDate

  const allCartItems = orderList
    ? orderList.flatMap((order) => order.List || order.orderList || [])
    : [];

  return (
    <div className="bg-[#eeeeee] min-h-screen py-10 font-['IBM_Plex_Sans_Thai'] text-[#242424] ">
      <main className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-['Bebas_Neue'] uppercase tracking-widest text-4xl mb-8 flex items-center gap-3 text-[#242424]">
          <span className="bg-[#e4002b] w-2 h-9 pt-12 rounded-full border-2 border-[#242424] shadow-[4px_4px_0_#242424]"></span>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-4xl border">
            {/* คุณสามารถส่ง bookingData ไปให้ CheckoutSteps นำไปแสดงต่อได้ด้วย เช่น <CheckoutSteps bookingData={bookingData} /> */}
            <CheckoutSteps />
          </div>

          <div className="lg:col-span-1 bg-red-400">
            <OrderSummary cartItems={allCartItems} />
          </div>
        </div>
      </main>
    </div>
  );
}