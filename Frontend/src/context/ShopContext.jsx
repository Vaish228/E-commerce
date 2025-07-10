import { useState, createContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';


export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = '₹';
  const delivery_fee = 40;
  const backendUrl = "https://e-commerce-backend-038m.onrender.com";

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    const userId = localStorage.getItem("userId"); 
    const token = localStorage.getItem("token");  
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
        { headers: { token } } 
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
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!userId || !token) {
      toast.error("User not authenticated!");
      return;
    }
    
    const cartData = structuredClone(cartItems);
    
    if (quantity === 0) {
      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];
        
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][size] = quantity;
    }
    
    setCartItems(cartData);

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/update`, 
        { userId, itemId, size, quantity },
        { headers: { token } }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update cart.");
      }
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error(error.response?.data?.message || "Failed to update cart quantity.");
      
      getUserCart(token);
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
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products); 
      } else {
        toast.error(response.data.message || 'Failed to fetch products.');
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error('Error fetching products.');
    }
  };
  
  const getUserCart = async (userToken) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = userToken || localStorage.getItem("token");
      
      if (!userId || !token) {
        console.warn("Missing userId or token for cart fetch");
        return;
      }
      
      const response = await axios.post(
        `${backendUrl}/api/cart/get`, 
        { userId }, 
        { headers: { token } }
      );
  
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        throw new Error(response.data.message || "Failed to fetch cart data");
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
    const fetchData = async () => {
      if (localStorage.getItem('token')) {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
        await getUserCart(storedToken);
      }
    };

    fetchData();
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