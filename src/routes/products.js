const express = require("express");
const router = express.Router();
const actions = require("../database/actions");
const auth = require("../middlewares/security/auth");

router.get("/products", async (req, res) => {
  try {
    const result = await actions.Select("SELECT * FROM productos", {});
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.json({ success: false, message: error });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const result = await actions.Select(
      "SELECT * FROM productos WHERE id = :id",
      { id: req.params.id }
    );
    if (result.length === 0) {
      res.status(404).json({ success: false, message: "product not found" });
    } else {
      res.status(200).json({ success: true, data: result });
    }
  } catch (error) {
    res.json({
      error: `${error.message}`,
    });
  }
});

// Verifica si datos únicos ya están registrados
router.post("/product", async (req, res) => {
  const product = req.body;
  product.nombreUsuario = product.nombre.toLowerCase();
  const existsID = await actions.Select(
    "SELECT * FROM productos WHERE id = :id ",
    { id: req.body.id }
  );
  const existsNombre = await actions.Select(
    "SELECT * FROM productos WHERE nombre = :nombre",
    { nombre: req.body.nombre }
  );
  console.log(existsNombre);
  if (existsID.length > 0 || existsNombre.length > 0) {
    res.status(404).json({ success: false, message: "product exists already" });
  } else {
    try {
      const result = await actions.Insert(
        `INSERT INTO productos (id, nombre, valor, foto) 
            VALUES (:id, :nombre, :valor, :foto)`,
        product
      );
      res
        .status(201)
        .json({ success: true, message: "product has been created" });
    } catch (error) {
      error: `${error.message}`;
    }
  }
});

router.put("/product/:id", async (req, res) => {
  // Actualizar todo el producto
  const product = req.body;
  const exists = await actions.Select(
    "SELECT * FROM productos WHERE id = :id",
    { id: req.params.id }
  );
  const Id = req.params.id;
  if (exists.length === 0) {
    res.status(404).json({ success: false, message: "User not found" });
  } else {
    try {
      const result = await actions.Update(
        `UPDATE productos SET id = :id, nombre = :nombre, valor = :valor, foto = :foto  WHERE id = ${Id}`,
        product
      );
      res
        .status(200)
        .json({ success: true, message: "product has been updated" });
    } catch (error) {
      res.json({
        error: `${error.message}`,
      });
    }
  }
});

router.patch("/product/:id", async (req, res) => {
  // Actualizar solo una propiedad del producto
  const product = req.body;
  const Id = req.params.id;
  const exists = await actions.Select(
    "SELECT * FROM productos WHERE id = :id",
    { id: req.params.id }
  );
  if (exists.length === 0) {
    res.status(404).json({ success: false, message: "User not found" });
  } else {
    try {
      const productId = product.id ? product.id : exists[0].id;
      const productNombre = product.nombre ? product.nombre : exists[0].nombre;
      const productValor = product.valor ? product.valor : exists[0].valor;
      const productFoto = product.foto ? product.foto : exists[0].foto;
      const update = await actions.Update(
        `UPDATE productos SET  id = :id, nombre = :nombre, valor = :valor, foto = :foto WHERE id = ${Id}`,
        {
          id: productId,
          nombre: productNombre,
          valor: productValor,
          foto: productFoto,
        }
      );
      res
        .status(200)
        .json({ success: true, message: "product has been updated" });
    } catch (error) {
      res.json({
        error: `${error.message}`,
      });
    }
  }
});

router.delete("/product/:id", async (req, res) => {
  const exists = await actions.Select(
    "SELECT * FROM productos WHERE id = :id",
    { id: req.params.id }
  );
  if (exists.length === 0) {
    res.status(404).json({ success: false, message: "product not found" });
  } else {
    try {
      const result = await actions.Delete(
        "DELETE FROM productos WHERE id = :id",
        { id: req.params.id }
      );
      res.status(200).json({
        success: true,
        message: "product has been deleted",
        data: result,
      });
    } catch (error) {
      error: `${error.message}`;
    }
  }
});

module.exports = router;
