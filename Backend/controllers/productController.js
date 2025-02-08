import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"


const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // Validate sizes
        let parsedSizes;
        try {
            parsedSizes = JSON.parse(sizes);
        } catch (err) {
            throw new Error('Invalid sizes JSON format');
        }

        // Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                if (!item.path) {
                    throw new Error('File path is undefined or invalid');
                }
                let result;
                try {
                    result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                } catch (err) {
                    throw new Error(`Cloudinary upload failed: ${err.message}`);
                }
                return result.secure_url;
            })
        );

        // Create product data
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true",
            sizes: parsedSizes,
            image: imagesUrl,
            date: Date.now(),
        };

        console.log(productData);

        // Save to database
        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
const listProducts = async(req,res) => {
    try{
        const products = await productModel.find({});
        //const products = await ProductModel.find();
        res.json({success:true, products})
        console.log("Success")

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
    
    }
}

const removeProduct = async(req,res)=>{
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true, message:"Product Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    
    }
}

const singleProduct = async(req,res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true, product})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct }