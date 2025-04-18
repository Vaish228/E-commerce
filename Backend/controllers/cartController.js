import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;

        // Validate inputs
        if (!userId || !itemId || !size) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        // Find user and initialize cartData if needed
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        cartData[itemId] = cartData[itemId] || {};
        cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

        // Update the database
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.status(200).json({ success: true, message: "Added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        // Validate inputs
        if (!userId || !itemId || !size || typeof quantity !== "number") {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        // Find user and initialize cartData if needed
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        cartData[itemId] = cartData[itemId] || {};
        cartData[itemId][size] = quantity;

        // Update the database
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.status(200).json({ success: true, message: "Cart updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// backend-side (Express controller)
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.params; // Get from URL params
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