require('dotenv').config();
const mongoose=require('mongoose');

const url = process.env.url;


let connecttodatabase= async () => {
     try{
        await mongoose.connect(url);
         console.log('CONNECTED TO DATABASE');
         
     }catch(err){
       console.error(`Error connecting to the database: ${err}`);
     }
}

module.exports=connecttodatabase;