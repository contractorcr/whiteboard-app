const express=require('express');
const router=express.Router();
const  canvascontroller=require('../controllers/canvascontroller')
const { validateUser, authorize }=require('../middleware/validation')

router.get('/',authorize,canvascontroller.getcanvas)
router.post('/',authorize,canvascontroller.createcanvas)
router.delete('/:id',authorize,canvascontroller.deletecanvas)
router.get('/:id', authorize, canvascontroller.getcanvasbyid);
router.put('/:id',authorize,canvascontroller.updatecanvas);
router.patch('/:id/rename', authorize, canvascontroller.renamecanvas);
router.post('/:id/share', authorize, canvascontroller.sharecanvas);

module.exports=router;