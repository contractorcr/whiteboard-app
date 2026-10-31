const mongoose=require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection:'users'
});
userSchema.statics.userregister = async function(name,email, password) {
    try{
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this({
        name:name,
        email: email,
        password:hashedPassword,
    });

    await user.save();
    return user;
    
    }catch(err){
         throw  err;
    }
};
userSchema.statics.userlogin = async function(email, password) {
    const user = await this.findOne({ email });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return user;
}
userSchema.statics.getuser= async function(email){
    try{
     const user= await this.findOne({email});
     return user;
    }catch(err){
         throw  err;
     }
}


module.exports = mongoose.model('User', userSchema);