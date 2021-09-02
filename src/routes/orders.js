const express = require('express');
const router = express.Router();
const auth = require("../middlewares/security/auth");
const actions = require('../database/actions');


/*
- *** Nombre de usuario unico en db
- Probar peticiones de ordenes por id y por username
- *** Validar rol para get de endpoints usuarios
        usuario: acceso a [/user:id] (propio)
- router: products enpoints (CRUD)

- *** Middleware validar rol | Validar id usuario
*/

router.get('/orders', auth.validateToken,  async (req, res)=> {
    /**
     * If [user] is admin: return all orders of all users, or  in default case specific quantity
     * If [user] is not admin: return only orders of this user
     */
    try{
        let orders;
        if (req.body.ids.idRole==1){
            orders = await actions.Select(`SELECT * FROM ordenes`);
        } else {
            orders = await actions.Select(`SELECT * FROM ordenes WHERE IdUser=:id`, req.body.ids);
        }
        
        if (orders.length>0){
            res.status(202).send({success: true, msg: 'FOUND_DATA', data: orders});
        } else {
            res.status(202).send({success: true, msg: 'NOT_FOUND_DATA'});
        }

    } catch(error){
        console.log(error.message);
        res.status(500).send({success: false, msg: error.message});
    } 
});

router.get('/order/:id', auth.validateToken, async (req, res)=> {// Admin | User[id propio]
    /**
     *  Devuelve la orden que coincida con el id indicado y con el token de usuario
     *  Validar tipo de dato en [params.id]
     */

    try {
        data = {
            IdUser: req.body.ids.id,
            idOrden: req.params.id
        }
        const order = await actions.Select(`SELECT * FROM ordenes WHERE id=:idOrden AND IdUser=:IdUser`, data);
        console.log("data:", data)
        console.log("order:", order)

        if(order.length>0){
            res.status(202).send({success: true, msg: 'FOUND_DATA', data: order});
        } else {
            res.status(500).send({success: true, msg: 'NOT_FOUND_DATA'});
        }

    } catch (error) {
        res.status(500).send({success: false, msg: error.message});
    }


});

router.post('/order', auth.validateToken, async (req, res)=> { // User
    const reqComplete = req.body
    console.log("post order: ", req.body)

    const orderInfo = reqComplete.order;
    const detallesOrderInfo = reqComplete.detalleOrder;

    let resultOrderInsert;
    let idOrden;
    let resultInsertDetails;
    let resultQueryName;
    let resultOrderUpdate;

    try {
        resultOrderInsert = await actions.Insert(`INSERT INTO ordenes  
        (hora, tipoPago, IdUser, estado) 
        VALUES (NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);
    
        idOrden = resultOrderInsert[0];
    
        for (const detalleOrderInfo of detallesOrderInfo) {
            resultInsertDetails = await actions.Insert(`INSERT INTO detallesordenes  
            (idOrden, idProducto, cant) 
            VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});
        }
    
        resultQueryName = await actions.Select(`
        SELECT SUM(p.valor * do.cant) as total,
        GROUP_CONCAT(do.cant, "x ", p.nombre, " ") as name
        FROM detallesordenes do
        INNER JOIN producto p ON (p.id = do.idProducto)
        WHERE do.idOrden = :idOrden`, { idOrden });
    
        resultOrderUpdate = await actions.Update(`UPDATE ordenes 
        SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });
    } catch (error){
        res.status(404).send({});
    }

    if(resultOrderUpdate.error) {
        res.status(500).json(result.message);
    } else {
        res.json(resultOrderUpdate);
    }    
});

router.put('/order/:id', (req, res)=> { // Admin
    //Update status order by admin
});

router.delete('/order/:id', (req, res)=> { // Admin
    //Code here

});

module.exports = router;