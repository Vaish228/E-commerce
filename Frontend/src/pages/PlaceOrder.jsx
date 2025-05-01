import { useState, useContext, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({ ...data, [name]: value }))
  }

  const prepareOrderItems = () => {
    let orderItems = []
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          const itemInfo = structuredClone(products.find(product => product._id === items))
          if (itemInfo) {
            itemInfo.size = item
            itemInfo.quantity = cartItems[items][item]
            orderItems.push(itemInfo)
          }
        }
      }
    }
    return orderItems;
  }

  const handleRazorpayPayment = async (orderData) => {
    setLoading(true);
    try {
      // 1. First place the order using placeOrderRazorpay backend endpoint
      const orderResponse = await axios.post(
        `${backendUrl}/api/order/razorpay`, 
        {
          userId: localStorage.getItem("userId"),
          items: orderData.items,
          amount: orderData.amount,
          address: orderData.address
        }, 
        { headers: { token } }
      );
      
      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || "Failed to create order");
      }
      
      // Get the orderId from the response
      const orderId = orderResponse.data.orderId;
      
      // 2. Initiate Razorpay order
      const razorpayResponse = await axios.post(
        `${backendUrl}/api/payment/initiate`,
        {
          amount: orderData.amount,
          userId: localStorage.getItem("userId"),
          orderId: orderId
        },
        { headers: { token } }
      );
      
      if (!razorpayResponse.data.success) {
        throw new Error(razorpayResponse.data.message || "Failed to create Razorpay order");
      }
      
      // 3. Open Razorpay checkout
      const options = {
        key: "rzp_test_QCZLQtT2M48OsW", // Use environment variable
        amount: razorpayResponse.data.amount,
        currency: razorpayResponse.data.currency,
        name: "Fashion Shop",
        description: "Payment for your order",
        order_id: razorpayResponse.data.orderId,
        handler: async function (response) {
          try {
            // 4. Verify payment with backend
            await axios.post(
              `${backendUrl}/api/payment/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                userId: localStorage.getItem("userId"),
                orderId: orderId,
                amountPaid: orderData.amount
              },
              { headers: { token } }
            );
            
            // 5. Clear cart and redirect to orders page
            setCartItems({});
            toast.success("Payment successful!");
            navigate('/orders');
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipcode}, ${formData.country}`
        },
        theme: {
          color: "#000000"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response) {
        toast.error("Payment failed: " + response.error.description);
      });
      
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error(error.response?.data?.message || error.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCODOrder = async (orderData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/place`, 
        orderData, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        setCartItems({});
        toast.success("Order placed successfully!");
        navigate('/orders');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("COD order error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Prepare order data
    const orderItems = prepareOrderItems();
    const orderData = {
      address: formData,
      items: orderItems,
      amount: getCartAmount() + delivery_fee
    };

    // Process based on payment method
    switch (method) {
      case 'razorpay':
        await handleRazorpayPayment(orderData);
        break;
      case 'cod':
        await handleCODOrder(orderData);
        break;
      default:
        toast.error("Please select a payment method");
        break;
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='First name' />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Last name' />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='email' placeholder='Email address' />
        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Street' />
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='City' />
          <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='State' />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Zipcode' />
          <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Country' />
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Phone' />
      </div>

      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />

          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></div>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt="Razorpay" />
            </div>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></div>
              <p className='tex-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>

          <div className='w-full text-end mt-8'>
            <button 
              type='submit' 
              disabled={loading}
              className={`${loading ? 'bg-gray-400' : 'bg-black'} text-white px-16 py-3 text-sm`}
            >
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;