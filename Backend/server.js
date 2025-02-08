import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import { registerUser } from './controllers/userController.js';
import cartRouter from './routes/cartRoute.js'
//import { updateCart } from './controllers/cartController.js';
//import orderRouter from './routes/orderRoute.js'

const app = express()
const port = process.env.PORT || 5000
await connectDB()
connectCloudinary()

app.use(express.json())
app.use(cors())
// app.use(cors({
//     origin: 'http://localhost:5173',  // Allow requests from localhost
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],  
//     allowedHeaders: 'Content-Type,Authorization,token',      // Allow these methods
//     credentials: true                // Allow cookies or headers (if needed)
//   }));
  
app.use('/api/users',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
//app.post('/api/cart/update', updateCart);
//app.use('/api/order',orderRouter)


app.get('/',(req,res)=>{
    res.send("API Working")
})
app.post('/api/users', registerUser);


app.listen(port, ()=> console.log('Server started on PORT : '+ port))