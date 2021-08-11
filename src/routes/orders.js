const express = require('express');
const router = express.Router();
const actions = require('../database/actions');


/*
- *** Nombre de usuario unico en db
- Probar peticiones de ordenes por id y por username
- *** Validar rol para get de endpoints usuarios
        usuario: acceso a [/user:id] (propio)
- router: products enpoints (CRUD)

- *** Middleware validar rol | Validar id usuario
*/

router.get('/orders',  (req, res)=> {
    //Code here
    // Descifrar token
    // Validamos permisos del usuario
    // Devolver datos o denegar petición
    res.send('no hay ordenes');
});

router.get('/order/:id', (req, res)=> {// Admin | User[id propio]
    //Code here
});

router.post('/order', async (req, res)=> { // User
    const reqComplete = req.body

    const orderInfo = reqComplete.order;
    const detallesOrderInfo = reqComplete.detalleOrder

    const resultOrderInsert = await actions.Insert(`INSERT INTO ordenes  
    (hora, tipoPago, IdUser, estado) 
    VALUES (NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);

    const idOrden = resultOrderInsert[0];
    
    for (const detalleOrderInfo of detallesOrderInfo) {
        await actions.Insert(`INSERT INTO detallesordenes  
        (idOrden, idProducto, cant) 
        VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});
    }

    const resultQueryName = await actions.Select(`
    SELECT SUM(p.valor * do.cant) as total,
    GROUP_CONCAT(do.cant, "x ", p.nombre, " ") as name
    FROM detallesordenes do
    INNER JOIN producto p ON (p.id = do.idProducto)
    WHERE do.idOrden = :idOrden`, { idOrden });

    const resultOrderUpdate = await actions.Update(`UPDATE ordenes 
    SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });

    if(resultOrderUpdate.error) {
        res.status(500).json(result.message);
    } else {
        res.json(resultOrderUpdate);
    }    
});

router.put('/order/:id', (req, res)=> { // Admin
    //Code here
});

router.delete('/order/:id', (req, res)=> { // Admin
    //Code here
});

module.exports = router;