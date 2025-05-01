import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, currency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingError, setTrackingError] = useState('');

  // Define all possible statuses in order
  const statusSteps = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  // Special statuses that don't follow the normal flow
  const specialStatuses = ['Cancelled', 'Refund Initiated', 'Refunded'];

  const loadOrderData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );
      let allOrdersItem = [];

      if (response.data.success) {
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id;
            allOrdersItem.push(item);
          });
        });
        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, []);

  const trackOrder = async (orderId) => {
    try {
      setTrackingError('');
      const response = await axios.get(`${backendUrl}/api/order/status/${orderId}`);
      
      if (response.data && response.data.status) {
        setTrackingStatus(response.data.status);
        setTrackingOrder(orderId);
      } else {
        setTrackingError('Unable to fetch tracking information');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setTrackingError('Failed to track order. Please try again later.');
    }
  };

  const getStatusProgress = (status) => {
    // For special statuses
    if (specialStatuses.includes(status)) {
      return { 
        progressPercent: 0,
        isSpecialStatus: true
      };
    }
    
    // For regular statuses
    const currentIndex = statusSteps.indexOf(status);
    if (currentIndex === -1) return { progressPercent: 0, isSpecialStatus: false };
    
    // Calculate percentage (number of completed steps / total regular steps * 100)
    const progressPercent = ((currentIndex + 1) / statusSteps.length) * 100;
    return { progressPercent, isSpecialStatus: false };
  };

  const StatusProgressBar = ({ status }) => {
    const { progressPercent, isSpecialStatus } = getStatusProgress(status);
    
    // Special status handling (cancelled or refund)
    if (isSpecialStatus) {
      let bgColor = 'bg-yellow-500';
      
      if (status === 'Cancelled') {
        bgColor = 'bg-red-500';
      } else if (status === 'Refunded') {
        bgColor = 'bg-purple-500';
      }
      
      return (
        <div className="relative mt-6 mb-8">
          <div className="h-1 w-full bg-gray-200 rounded"></div>
          <div className="absolute flex items-center justify-center w-full top-0 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${bgColor}`}>
              {status}
            </span>
          </div>
        </div>
      );
    }
    
    // Regular status progress bar
    const currentIndex = statusSteps.indexOf(status);
    
    return (
      <div className="relative mt-6 mb-12">
        {/* Progress bar background */}
        <div className="h-1 w-full bg-gray-200 rounded">
          {/* Progress bar fill */}
          <div 
            className="h-1 bg-green-500 rounded transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        
        {/* Status steps */}
        <div className="flex justify-between w-full mt-1">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={index} className="flex flex-col items-center relative">
                {/* Status dot/circle */}
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs
                    ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'} 
                    ${isCurrent ? 'ring-2 ring-green-300' : ''}`}
                >
                  {isActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : index + 1}
                </div>
                
                {/* Status label */}
                <span className={`text-xs mt-1 ${isActive ? 'text-green-500 font-medium' : 'text-gray-500'} max-w-[60px] md:max-w-[80px] text-center`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDER'} />
      </div>

      {trackingError && (
        <div className="my-4 p-3 bg-red-100 text-red-700 rounded">
          {trackingError}
        </div>
      )}

      <div>
        {orderData.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No orders found. Start shopping to see your orders here.
          </div>
        ) : (
          orderData.map((item, index) => (
            <div
              key={index}
              className="py-6 border-b text-gray-700 flex flex-col gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img className="w-16 sm:w-20 object-cover" src={item.image[0]} alt="" />
                <div className="flex-1">
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-base text-gray-700">
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size} </p>
                  </div>
                  <p className="mt-1">
                    Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span>
                  </p>
                  <p className="mt-1">
                    Payment: <span className="text-gray-400">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      specialStatuses.includes(item.status) 
                        ? item.status === 'Cancelled' 
                          ? 'bg-red-500' 
                          : item.status === 'Refunded' 
                            ? 'bg-purple-500' 
                            : 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}></div>
                    <p className="text-sm md:text-base font-medium">{item.status}</p>
                  </div>
                  <button 
                    onClick={() => trackOrder(item.orderId)} 
                    className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    Track Order
                  </button>
                </div>
                
                {/* Show progress bar only for tracked order */}
                {trackingOrder === item.orderId && (
                  <StatusProgressBar status={trackingStatus || item.status} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;