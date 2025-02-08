import { useState, createContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = '₹';
  const delivery_fee = 40;
 // console.log(import.meta.env);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  //console.log("Backend URL:", backendUrl);  

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    const userId = localStorage.getItem("userId"); // Ensure userId is available
    const token = localStorage.getItem("token");  // Get token from localStorage
  
    if (!userId || !token) {
      toast.error("User not authenticated!");
      return;
    }
  
    if (!size) {
      toast.error("Select Product Size");
      return;
    }
  
    const cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }
  
    setCartItems(cartData);
  
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { userId, itemId, size },
        { headers: { token } } // Send token in the header
      );
  
      if (response.data.success) {
        toast.success("Item added to cart successfully!");
      } else {
        throw new Error(response.data.message || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.response?.data?.message || "Failed to add item to the cart.");
    }
  };
  


  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, sizes) => total + Object.values(sizes).reduce((sum, count) => sum + count, 0),
      0
    );
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/update', {itemId, size, quantity}, {headers:{token}})
      } catch (error) {
        console.error(error);
        toast.error('Failed to update cart quantity.');
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((product) => product._id === itemId);
      if (!itemInfo) continue;
      for (const size in cartItems[itemId]) {
        totalAmount += itemInfo.price * cartItems[itemId][size];
      }
    }
    return totalAmount;
  };
  

const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      console.log("Fetched Products:", response.data);  // Log the full response from the API
      if (response.data.success) {
        setProducts(response.data.products); 
      } else {
        toast.error(response.data.message || 'Failed to fetch products.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching products.');
    }
  };
  
  const getUserCart = async (userToken) => {
    try {
      if (!userToken) {
        toast.error('No token found!');
        return;
      }
      
      const response = await axios.post(
        `${backendUrl}/api/cart/get`, 
        {},  // Sending an empty object as the body, if no specific parameters are needed
        { headers: { token: userToken } }
      );
  
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      toast.error('Error fetching cart data.');
    }
  };
  
  
        

  

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (products.length === 0) {
        console.log('Products are still loading...');
    } else {
        console.log('Products Loaded:', products);
    }
}, [products]);

useEffect(() => {
  const fetchData = async () => {
    if (token && localStorage.getItem('token')) {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      await getUserCart(storedToken);  // Ensure you're awaiting here
    }
  };

  fetchData();  // Call the async function
}, [token]);




  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
  };



  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
