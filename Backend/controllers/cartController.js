import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;
        
        if (!userId || !itemId || !size) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const cartData = userData.cartData || {};
        cartData[itemId] = cartData[itemId] || {};
        cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
        
        await userModel.findByIdAndUpdate(userId, { cartData });
        res.status(200).json({ success: true, message: "Added to cart" });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;
        
        if (!userId || !itemId || !size || typeof quantity !== "number") {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid input data", 
                received: { userId, itemId, size, quantity, quantityType: typeof quantity }
            });
        }
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const cartData = userData.cartData || {};
        
        if (quantity === 0) {
            if (cartData[itemId] && cartData[itemId][size]) {
                delete cartData[itemId][size];
                
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        } else {
            cartData[itemId] = cartData[itemId] || {};
            cartData[itemId][size] = quantity;
        }
        
        await userModel.findByIdAndUpdate(userId, { cartData });
        
        res.status(200).json({ 
            success: true, 
            message: "Cart updated",
            updatedCart: cartData 
        });
    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const cartData = userData.cartData || {};
        res.status(200).json({ success: true, cartData });
    } catch (error) {
        console.error('❌ Error fetching cart data:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart data.' });
    }
};

export { addToCart, updateCart, getUserCart };