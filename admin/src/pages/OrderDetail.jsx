import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/admin/orders/${orderId}`);
        
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        setError(err.message || 'Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!order) return <div className="not-found">Order not found</div>;

  return (
    <div className="order-detail-container">
      <div className="order-header">
        <div className="order-header-left">
          <h1>Order #{order.orderId.substring(0, 8)}</h1>
          <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <div className="order-header-right">
          <span className={`status status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="order-sections">
        <div className="order-section customer-info">
          <h2>Customer Information</h2>
          <div className="info-content">
            <p><strong>Name:</strong> {order.customer.name}</p>
            <p><strong>Email:</strong> {order.customer.email}</p>
          </div>
        </div>

        <div className="order-section shipping-info">
          <h2>Shipping Address</h2>
          <div className="info-content">
            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipcode}</p>
            <p>{order.shippingAddress.country}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="order-section payment-info">
          <h2>Payment Information</h2>
          <div className="info-content">
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            <p><strong>Status:</strong> 
              <span className={`payment-status ${order.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                {order.paymentStatus}
              </span>
            </p>
            <p><strong>Total Amount:</strong> ₹{order.amount}</p>
          </div>
        </div>
      </div>

      <div className="order-items">
        <h2>Order Items</h2>
        <table className="items-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Size</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="item-image">
                  {item.image && item.image.length > 0 ? (
                    <img 
                      src={item.image[0]} 
                      alt={item.name} 
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </td>
                <td className="item-name">
                  <p>{item.name}</p>
                  <span className="item-category">{item.category} / {item.subCategory}</span>
                </td>
                <td>{item.size}</td>
                <td>₹{item.price}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{order.amount - 40}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>₹40</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>₹{order.amount}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;