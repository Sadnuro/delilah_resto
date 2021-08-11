const express = require('express');
const auth = require('../middlewares/security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', auth.authAdmin, async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios', {});
    res.json(result);
});

router.get('/user/:id', async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    res.json(result);
});

// Verifica si datos únicos ya están registrados
router.post('/user', auth.validateFormat, auth.validateUser,  async (req, res)=> {   // 
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

router.put('/user/:id',auth.authAdmin, async (req, res)=> { // Actualiza todo el objeto
    //Code here
});

router.patch('/user/:id', auth.authAdmin, async (req, res)=> { // Actualiza algunos valores
    const user = req.body;
    const result = await actions.Update(`UPDATE usuarios SET email = :email WHERE id = :id`, user);
    res.json(result);
});

router.delete('/user/:id', async (req, res)=> {
    //Code here
    const body = req.body
});

module.exports = router;
