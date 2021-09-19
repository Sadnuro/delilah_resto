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
            dataResponse = {success: true, msg: 'FOUND_ORDERS', quantity: orders.length, data: orders};
            res.status(200).send(dataResponse);
        } else {
            res.status(500).send({success: true, msg: 'NOT_FOUND_ORDERS'});
        }

    } catch(error){
        console.log(error.message);
        res.status(404).send({success: false, msg: error.message});
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
        let order = 0;
        if (req.body.ids.idRole==1){
            order = await actions.Select(`SELECT * FROM ordenes WHERE id=:idOrden`, data);
        } else {
            order = await actions.Select(`SELECT * FROM ordenes WHERE id=:idOrden AND IdUser=:IdUser`, data);
        }
        console.log("data:", data)
        console.log("order:", order)

        if(order.length>0){
            res.status(202).send({success: true, quantity: order.length, msg: 'FOUND_DATA', data: order});
        } else {
            res.status(500).send({success: false, msg: 'NOT_FOUND_DATA'});
        }

    } catch (error) {
        res.status(500).send({success: false, msg: error.message});
    }
});

router.post('/order', auth.validateToken, async (req, res)=> { // User
    const reqComplete = req.body
    console.log("post order: ", req.body)

    const orderInfo = {
        tipoPago: reqComplete.order.tipoPago,
        IdUser: reqComplete.ids.id,
        estado: 1
    }
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
        console.log("resultOrderInsert", resultOrderInsert);
    
        idOrden = resultOrderInsert[0];
        console.log("idOrden:", idOrden);
    
        for (const detalleOrderInfo of detallesOrderInfo) {
            resultInsertDetails = await actions.Insert(`INSERT INTO detallesordenes  
            (idOrden, idProducto, cant) 
            VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});

            console.log("resultInsertDetails", resultInsertDetails);
        }
    
        resultQueryName = await actions.Select(`
        SELECT SUM(p.valor * do.cant) as total,
        GROUP_CONCAT(do.cant, "x ", p.nombre, " ") as name
        FROM detallesordenes do
        INNER JOIN productos p ON (p.id = do.idProducto)
        WHERE do.idOrden = :idOrden`, { idOrden });

        console.log("resultQueryName", resultQueryName);
    
        resultOrderUpdate = await actions.Update(`UPDATE ordenes 
        SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });
        console.log("resultOrderUpdate", resultOrderUpdate);
        
        if(resultOrderUpdate.error) {
            res.status(404).json({success: false, msg: resultOrderUpdate.message});
        } else {
            res.status(200).json({success: true, msg: "CREATED_ORDER"});
        } 
        
    } catch (error){
        res.status(404).send({success: false, msg: error.message});
    }
});

router.put('/order/:id', auth.authAdmin, auth.validateFormatUpdateOrder, async (req, res)=> { // Admin
    //Update status order by admin
    try {
        const order = req.body;
        const Id = req.params.id
        console.log("order:", order)

        updated = {};
        
        // Implement whether foreign keys should be modified
        // const UNSET_FK = await actions.query("SET FOREIGN_KEY_CHECKS = 0");

        // if (order.id){
        //     const resultIdUpdate = await actions.Update(`UPDATE ordenes SET id=:id WHERE id=${Id}`, order);
        //     resultIdUpdate[1]>0 ? updated.id = order.id : updated=update;
        // }

        
        // if (order.IdUser){
        //     const resultIdUserUpdate = await actions.Update(`UPDATE ordenes SET IdUser=:IdUser  WHERE id=${Id}`, order);
        //     console.log("resultIdUserUpdate:", resultIdUserUpdate);
        //     resultIdUserUpdate[1]>0 ? updated.IdUser = order.IdUser : updated=updated;
        // }

        if (order.nombre){
            const resultNombreUpdate = await actions.Update(`UPDATE ordenes SET nombre=:nombre WHERE id=${Id}`, order);
            resultNombreUpdate[1]>0 ?  updated.nombre = order.nombre : updated=updated;
        }
        if (order.total){
            const resultTotalUpdate = await actions.Update(`UPDATE ordenes SET total=:total WHERE id=${Id}`, order);
            resultTotalUpdate[1]>0 ?  updated.total = order.total : updated=updated;
        }
        if (order.tipoPago){
            const resultTipoPagoUpdate = await actions.Update(`UPDATE ordenes SET tipoPago=:tipoPago WHERE id=${Id}`, order);
            resultTipoPagoUpdate[1]>0 ?  updated.tipoPago = order.tipoPago : updated=updated;
            console.log("resultTipoPagoUpdate:", resultTipoPagoUpdate);
        }
        if (order.estado){
            const resultEstadoUpdate = await actions.Update(`UPDATE ordenes SET estado=:estado WHERE id=${Id}`, order);
            resultEstadoUpdate[1]>0 ?  updated.estado = order.estado : updated=updated;
        }

        // Implement whether foreign keys should be modified
        const SET_FK = await actions.query("SET FOREIGN_KEY_CHECKS = 1");

        res.status(200).json({success: true, msg: 'UPDATED_ORDER'});
    } catch (error) {
        console.log({ msj: error.message });
        res.status(404).json({success: false, msg: error.message})
    }
});

// Agregar path

router.patch('/order/:id', auth.authAdmin, auth.validateFormatUpdateOrder, async (req, res)=> { // Admin
    //Update status order by admin
    try {
        const order = req.body;
        const Id = req.params.id
        console.log("order:", order)

        updated = {};
        
        // Implement whether foreign keys should be modified
        // const UNSET_FK = await actions.query("SET FOREIGN_KEY_CHECKS = 0");

        // if (order.id){
        //     const resultIdUpdate = await actions.Update(`UPDATE ordenes SET id=:id WHERE id=${Id}`, order);
        //     resultIdUpdate[1]>0 ? updated.id = order.id : updated=update;
        // }

        
        // if (order.IdUser){
        //     const resultIdUserUpdate = await actions.Update(`UPDATE ordenes SET IdUser=:IdUser  WHERE id=${Id}`, order);
        //     console.log("resultIdUserUpdate:", resultIdUserUpdate);
        //     resultIdUserUpdate[1]>0 ? updated.IdUser = order.IdUser : updated=updated;
        // }

        if (order.nombre){
            const resultNombreUpdate = await actions.Update(`UPDATE ordenes SET nombre=:nombre WHERE id=${Id}`, order);
            resultNombreUpdate[1]>0 ?  updated.nombre = order.nombre : updated=updated;
        }
        if (order.total){
            const resultTotalUpdate = await actions.Update(`UPDATE ordenes SET total=:total WHERE id=${Id}`, order);
            resultTotalUpdate[1]>0 ?  updated.total = order.total : updated=updated;
        }
        if (order.tipoPago){
            const resultTipoPagoUpdate = await actions.Update(`UPDATE ordenes SET tipoPago=:tipoPago WHERE id=${Id}`, order);
            resultTipoPagoUpdate[1]>0 ?  updated.tipoPago = order.tipoPago : updated=updated;
            console.log("resultTipoPagoUpdate:", resultTipoPagoUpdate);
        }
        if (order.estado){
            const resultEstadoUpdate = await actions.Update(`UPDATE ordenes SET estado=:estado WHERE id=${Id}`, order);
            resultEstadoUpdate[1]>0 ?  updated.estado = order.estado : updated=updated;
        }

        // Implement whether foreign keys should be modified
        const SET_FK = await actions.query("SET FOREIGN_KEY_CHECKS = 1");

        res.status(200).json({success: true, msg: 'UPDATED_ORDER'});
    } catch (error) {
        console.log({ msj: error.message });
        res.status(404).json({success: false, msg: error.message})
    }
});

router.delete('/order/:id', auth.authAdmin, async (req, res)=> { // Admin
    try{
        counterQuery = `SELECT COUNT(*) as count FROM ordenes WHERE id=:id`
        
        // deleted = COUNT(*)[] | deleted[0].count = n
        const toDelete = await actions.Select(counterQuery, {id: req.params.id});
        console.log("count users:", toDelete[0]);
        if (toDelete[0].count>0){
            const UNSET_FK = await actions.query("SET FOREIGN_KEY_CHECKS = 0");
            const respuesta = await actions.Delete(`
            DELETE ordenes, detallesordenes
            FROM ordenes INNER JOIN detallesordenes
            ON ordenes.id=:id AND detallesordenes.idOrden=:id`, {id: req.params.id});
            const SET_FK = await actions.query("SET FOREIGN_KEY_CHECKS = 1");

            dataResponse = {success: true, msg: 'DELETED_ORDER'};
            console.log(dataResponse)
            res.status(200).json(dataResponse);
        } else {
            dataResponse = {success: false, msg: 'NOT_FOUND_ORDER'};
            console.log(dataResponse)
            res.status(500).json(dataResponse);
        }

    } catch (error) {
        console.log(error.message);
        res.status(404).json({success: false, msg: error.message});
    }
});

module.exports = router;