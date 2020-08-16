const express = require('express');
const router = express.Router();
const upload = require('../config/multer')


//importing controllers
const controllerSiswa = require('../controllers/controllerSiswa');

router.get('/list', controllerSiswa.list)
router.post('/create',upload.single('image'), controllerSiswa.create);
router.get('/get/:id', controllerSiswa.get);
router.post('/update/:id', upload.single('image'), controllerSiswa.update);
router.post('/delete/:id',controllerSiswa.delete);


module.exports = router;