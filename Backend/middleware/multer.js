import multer from 'multer';
//import upload from './multer.js'

import fs from 'fs';


const storage = multer.diskStorage({ 
    // filename:function(req,file, callback){
    //     callback(null, file.originalname)
    // }
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const uploadInstance = multer({storage})
export const uploadFields = uploadInstance.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
]);

export default uploadInstance