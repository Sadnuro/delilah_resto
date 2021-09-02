const express = require('express');
const auth = require('../middlewares/security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', async (req, res) => {
    try {
        const result = await actions.Select('SELECT * FROM usuarios', {});
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.json({ success: false, message: error.message });;
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
        if (result.length === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
        } else {
            res.status(200).json({ success: true, data: result });
        }
    } catch (error) {
        res.json({
            error: `${error.message}`
        })
    }

});

// Verifica si datos únicos ya están registrados
router.post('/user', async (req, res) => {   // 
    const user = req.body;
    user.nombreUsuario = user.nombreUsuario.toLowerCase();
    console.log(user.nombreUsuario);
    const existsID = await actions.Select('SELECT * FROM usuarios WHERE id = :id ', { id: user.id });
    const existsNombre = await actions.Select('SELECT * FROM usuarios WHERE nombreUsuario = :nombreUsuario', { nombreUsuario: user.nombreUsuario });
    if (existsID.length > 0 || existsNombre.length > 0) {
        res.status(404).json({ success: false, message: 'user exists already' });
    } else {
        try {
            result = await actions.Insert(`INSERT INTO usuarios (id, nombreUsuario, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
            VALUES (:id,:nombreUsuario, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);
            res.status(201).json({ success: true, message: 'User has been created' });
        } catch (error) {
            res.json({
                error: `${error.message}`
            })
        }
    }
});

router.put('/user/:id', async (req, res) => {
    const user = req.body;
    const exists = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    console.log(exists);
    const Id = req.params.id
    if (exists.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
    } else {
        try {
            const result = await actions.Update(`UPDATE usuarios SET email = :email, nombreCompleto = :nombreCompleto, telefono = :telefono, direccion = :direccion, contrasena = :contrasena  WHERE id = ${Id}`, user);
            res.status(200).json({ success: true, message: 'product has been updated' });
        } catch (error) {
            res.json({
                error: `${error.message}`
            })
        }
    }


});

router.patch('/user/:id', async (req, res) => {
    const user = req.body;
    const Id = req.params.id
    const exists = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    if (exists.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
    } else {
        try {
            const userEmail = user.email ? user.email : exists[0].email;
            const userNombre = user.nombreCompleto ? user.nombreCompleto : exists[0].nombreCompleto;
            const userTelefono = user.telefono ? user.telefono : exists[0].telefono;
            const userDireccion = user.direccion ? user.direccion : exists[0].direccion;
            const userContrasena = user.contrasena ? user.contrasena : exists[0].contrasena;
            console.log(userEmail);
            const update = await actions.Update(`UPDATE usuarios SET  email = :email, nombreCompleto = :nombreCompleto, telefono = :telefono, direccion  = :direccion, contrasena = :contrasena WHERE id = ${Id}`, { email: userEmail, nombreCompleto: userNombre, telefono: userTelefono, direccion: userDireccion, contrasena: userContrasena });
            res.status(200).json({ success: true, message: 'product has been updated' });
        } catch (error) {
            res.json({
                error: `${error.message}`
            })
        }
    }
});

router.delete('/user/:id', async (req, res) => {
    const exists = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    if (exists.length === 0) {
        res.status(404).json({ success: false, message: 'user not found' });
    } else {
        try {
            const result = await actions.Delete('DELETE FROM usuarios WHERE id = :id', { id: req.params.id })
            res.status(200).json({ success: true, message: 'user has been deleted', data: result });
        } catch (error) {
            error: `${error.message}`
        }
    }
});

module.exports = router;