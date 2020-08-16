const controller = {};
const siswa = require("../models/modelSiswa");

//create data
controller.create =  async (req, res, ) => {
    
    //parameter post
    const { name, year } = req.body;
    //create
    const data = await siswa.create({
          name: name,
          year: year,
          image: req.file === undefined ? "" : req.file.filename
        })
      .then(function (data) {
        return data;
      })
      .catch((error) => {
        return error;
      });

    res.json({ succes: true, data: data, message: "Created" });
  };
  

//Edit data
controller.update =  async (req, res) => {
    
  //parameter get id
  const { id } = req.params;
  //parameter post
  const { name, year } = req.body;
  //create
  const data = await siswa
    .update(
      {
        name: name,
        year: year,
        image: req.file === undefined ? "" : req.file.filename
      },
      {
        where: { id: id },
      }
    )
    .then(function (data) {
      return data;
    })
    .catch((error) => {
      return error;
    });
  res.json({ succes: true, data: data, message: "Update" });
};

controller.list = async (req, res) => {
  const data = await siswa
    .findAll()
    .then(function (data) {
      return data;
    })
    .catch((error) => {
      return error;
    });

  res.json({
    success: true,
    data: data,
  });
};

//menampilkan 1 record
controller.get = async (req, res) => {
  const { id } = req.params;

  const data = await siswa
    .findAll({
      where: { id: id },
    })
    .then(function (data) {
      return data;
    })
    .catch((error) => {
      return error;
    });

  res.json({
    succes: true,
    data: data,
  });
};

//hapus record
controller.delete = async (req, res) => {
  //paramaeter post
  const { id } = req.params;
  //const { name } = req.body;
  // delete sequelize
  const del = await siswa.destroy({
    where: { id: id },
  });
  res.json({ succes: true, deleted: del, message: "Telah dihapus" });
};

module.exports = controller;
