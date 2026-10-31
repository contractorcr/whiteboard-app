const express=require('express');
const router=express.Router();

const usercontroller=require('../controllers/usercontroller');
const {validateUser, authorize}= require('../middleware/validation')


router.post('/register',validateUser,usercontroller.registeruser);
router.post('/login',usercontroller.loginuser);
router.get('/profile',authorize,usercontroller.userprofile)


module.exports = router;