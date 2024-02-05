const mongoose = require('mongoose')

const connectDB=async()=>{
    try{
        const con = await mongoose.connect('mongodb+srv://vignesh:vignesh123@cluster0.9cqtctj.mongodb.net/chatpp')
        .then(() => console.log("DB Connected"))
        .catch((err) => console.log(err));
    }catch(error){

    }
}
module.exports = connectDB;