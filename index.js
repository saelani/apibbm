const express = require('express');
const app = express(); 
const Sequelize = require('sequelize');

const bodyParser = require('body-parser'); //post body handler
const { check, validationResult } = require('express-validator/check'); //form validation
const { matchedData, sanitize } = require('express-validator/filter'); //sanitize form params
const multer  = require('multer'); //multipar form-data
const path = require('path');
const crypto = require('crypto');

//Set body parser for HTTP post operation
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//set static assets to public directory
app.use(express.static('public'));
const uploadDir = '/img/';
const storage = multer.diskStorage({
    destination: "./public"+uploadDir,
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)  

        cb(null, raw.toString('hex') + path.extname(file.originalname))
      })
    }
})

const upload = multer({storage: storage, dest: uploadDir });

const sequelize = new Sequelize('bbm', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const siswa = sequelize.define('siswa', {
    'id': {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    'name': Sequelize.STRING,
    'year': Sequelize.STRING,
    'image': {
        type: Sequelize.STRING,
        //Set custom getter for book image using URL
        get(){
            const image = this.getDataValue('image');
            return "/img/"+image;
        }
    },
    'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },    
    'updatedAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },   
    
}, {
    //prevent sequelize transform table name into plural
    freezeTableName: true,
})

app.get('/siswa/', (req, res) => {
    siswa.findAll().then(siswa => {
        res.json(siswa)
    })
})

app.post('/siswa/', [
    //File upload (karena pakai multer, tempatkan di posisi pertama agar membaca multipar form-data)
    upload.single('image'),

    //Set form validation rule
    check('name')
        .isLength({min: 2})
        .custom(value => {
            return siswa.findOne({where: {name: value}}).then(b => {
                if(b){
                    throw new Error('Name already in use');
                }            
            })
        }
    ),
    check('year')
        .isLength({min: 4, max: 4})
        .isNumeric() 

],(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    siswa.create({
        name: req.body.name,
        year: req.body.year,
        image: req.file === undefined ? "" : req.file.filename
    }).then(newSiswa => {
        res.json({
            "status":"success",
            "message":"Siswa added",
            "data": newSiswa
        })
    })
})

app.put('/siswa/', [
    //File upload (karena pakai multer, tempatkan di posisi pertama agar membaca multipar form-data)
    upload.single('image'),

    //Set form validation rule

    check('name')
        .isLength({min: 2})
        .custom(value => {
            return siswa.findOne({where: {name: value}}).then(b => {
                if(!b){
                    throw new Error('Name not found');
                }            
            })
        }
    ),
    check('year')
        .isLength({min: 4, max: 4})
        .isNumeric()
],(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }
    const update = {
        name: req.body.name,
        year: req.body.year,
        image: req.file === undefined ? "" : req.file.filename
    }
    siswa.update(update,{where: {name: req.body.name}})
        .then(affectedRow => {
            return siswa.findOne({where: {name: req.body.name}})      
        })
        .then(b => {
            res.json({
                "status": "success",
                "message": "Siswa updated",
                "data": b
            })
        })
})

app.delete('/siswa/:name',[
    //Set form validation rule
    check('name')
        .isLength({ min: 2 })
        .custom(value => {
            return siswa.findOne({where: {name: value}}).then(b => {
                if(!b){
                    throw new Error('Name not found');
                }            
            })
        }
    ),
], (req, res) => {
    siswa.destroy({where: {name: req.params.name}})
        .then(affectedRow => {
            if(affectedRow){
                return {
                    "status":"success",
                    "message": "Siswa deleted",
                    "data": null
                } 
            }

            return {
                "status":"error",
                "message": "Failed",
                "data": null
            } 
                
        })
        .then(r => {
            res.json(r)
        })
})

app.listen(3000, () => console.log("server berjalan pada http://localhost:3000"))