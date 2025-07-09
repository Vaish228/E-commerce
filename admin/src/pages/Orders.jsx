import { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/admin/orders?page=${currentPage}&limit=10`);
        
        if (response.data.success) {
          setOrders(response.data.orders);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const viewOrderDetails = (orderId) => {
    window.location.href = `/order/${orderId}`;
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="orders-container">
      <h1>All Orders</h1>
      
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>#{order.orderId.substring(0, 8)}...</td>
                <td>{order.customer.name}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td>
                  <div className="item-preview">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    <div className="item-images">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img 
                          key={index}
                          src={item.image && item.image[0] ? item.image[0] : '/placeholder-image.png'} 
                          alt={item.name}
                          className="item-thumbnail"
                        />
                      ))}
                      {order.items.length > 3 && <span className="more-items">+{order.items.length - 3}</span>}
                    </div>
                  </div>
                </td>
                <td>₹{order.amount}</td>
                <td>
                  <span className={`status status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className={`payment-status ${order.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => viewOrderDetails(order.orderId)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            &lt; Prev
          </button>
          
          <div className="page-numbers">
            {[...Array(totalPages).keys()].map(page => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`page-number ${currentPage === page + 1 ? 'active' : ''}`}
              >
                {page + 1}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;