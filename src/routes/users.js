const express = require('express');
const auth = require('../middlewares/security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', auth.authAdmin, async (req, res) => {
    const result = await actions.Select('SELECT * FROM usuarios', {});
    res.json(result);
});

router.get('/user/:id', async (req, res) => {
    const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    res.json(result);
});

// Verifica si datos únicos ya están registrados
router.post('/user', auth.validateFormat, auth.validateUser, async (req, res) => {   // 
    const user = req.body;
    console.log("req.body: ", user)
    let result;
    user.nombreUsuario = user.nombreUsuario.toLowerCase();
    // user.nombreUsuaurio = user.nombreUsuario;
    result = await actions.Insert(`INSERT INTO usuarios (nombreUsuario, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
            VALUES (:nombreUsuario, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);
    if (result.error) {
        console.log(result.message);
        res.status(500).json(result.message);
    } else {
        res.json(result);
    }
});

router.put('/user/:id',auth.authAdmin, auth.validateFormat, async (req, res) => {
    try {
        const user = req.body;
        const Id = req.params.id
        const result = await actions.Update(`UPDATE usuarios SET email = :email, nombreCompleto = :nombreCompleto, telefono = :telefono, direccion = :direccion, contrasena = :contrasena  WHERE id = ${Id}`, user);
        res.json(result);
    } catch (error) {
        console.log({ msj: error.message });
        res.json({
            error: "El usuario no proporciono todos los datos"
        })
    }
});

router.patch('/user/:id',auth.validateFormatUpdate, async (req, res) => {
    const user = req.body;
    const Id = req.params.id
    if (user.email) {
        const resultemail = await actions.Update(`UPDATE usuarios SET email = :email WHERE id = ${Id}`, { email: user.email });
    }
    if (user.nombreCompleto) {
        const resultNombreCompleto = await actions.Update(`UPDATE usuarios SET  nombreCompleto = :nombreCompleto WHERE id = ${Id}`, { nombreCompleto: user.nombreCompleto });
    }
    if (user.telefono) {
        const resultTelefono = await actions.Update(`UPDATE usuarios SET  telefono = :telefono WHERE id = ${Id}`, { telefono: user.telefono });
    }
    if (user.direccion) {
        const resultDireccion = await actions.Update(`UPDATE usuarios SET direccion = :direccion WHERE id = ${Id}`, { direccion: user.direccion });
    }
    if (user.contrasena) {
        const resultContrasena = await actions.Update(`UPDATE usuarios SET contrasena = :contrasena WHERE id = ${Id}`, { contrasena: user.contrasena });
    }
    res.json(" correctly updated");
});

router.delete('/user/:id', auth.authAdmin, async (req, res) => {
    try {
        const result = await actions.Delete('DELETE FROM usuarios WHERE id=:id', { id: req.params.id })
        console.log("Delete result:", result);
        if(result===undefined){
            res.status(505).json({success: false, msg: "USER_NOT_FOUND"});
        } else {
            res.status(202).json({success: true, msg: "User has been deleted"});
        }
    } catch (error) {
        res.status(505).json({success: false, msg: error.message});
    }
});

module.exports = router;