const express = require("express");
const router = express.Router();
const actions = require('../database/actions');
const auth =  require('../middlewares/security/auth');


router.get('/productos', async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios', {});
    res.json(result);
});

router.get('/productos/:id', async (req, res)=> {
    const result = await actions.Select('SELECT * FROM productos WHERE id = :id', { id: req.params.id });
    res.json(result);
});

// Verifica si datos únicos ya están registrados
router.post('/product', auth.authAdmin,  async (req, res)=> {
    const user = req.body;
    console.log("req.body: ", user)
    let result;
    user.nombreUsuario = user.nombreUsuario.toLowerCase();
    // user.nombreUsuaurio = user.nombreUsuario;
    result = await actions.Insert(`INSERT INTO usuarios (nombreUsuario, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
            VALUES (:nombreUsuario, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);
    if(result.error) {
        console.log(result.message);
        res.status(500).json(result.message);
    } else {
        res.json(result);
    }    
});

router.put('/product/:id',auth.authAdmin, async (req, res)=> { // Actualizar todo el producto
    //Code here
});

router.patch('/product/:id', auth.authAdmin, async (req, res)=> { // Actualizar solo una propiedad del producto
    const user = req.body;
    const result = await actions.Update(`UPDATE usuarios SET email = :email WHERE id = :id`, user);
    res.json(result);
});

router.delete('/product/:id', auth.authAdmin, async (req, res)=> {
    //Code here
});

module.exports = router;

