const jwt = require('jsonwebtoken');
const firma = 'Firma_para_proyecto';
const actions = require("../../database/actions");


module.exports.generateToken = (data) => {
    return jwt.sign(data, firma);
}

module.exports.validateToken = async (req, res, next) => {
    /**
     * Inserta en el body:
     * 
     */
    if (req.headers.authorization!=undefined){
        const token = req.headers.authorization.split(' ')[1];
        const verifyedToken = jwt.verify(token, firma);
        try {
            const existUser = await actions.Select(`SELECT id, idRole FROM usuarios WHERE nombreUsuario="${verifyedToken.userName}"`);
            if(existUser.length>0){
                req.body.ids = existUser[0];
                return next();
            } else {
                // 400 NOT_FOUND
                res.status(500).json({success: false, msg: "NOT_FOUND_USER"})
            }   
        } catch (error) {
            console.log(error.message);
            // 404 GENERAL_ERROR
            res.status(404).send({success: false, msg: error.message});
        }
    } else{
        // 404 GENERAL_ERROR
        res.status(401).send({success: false, msg: 'No identification token provided'});
    }
}

// Utiliza es req.user creado en [auth.auth], de no existir se debería descifrar el token
module.exports.authAdmin = async (req, res, next)=>{    // Check user rol in db
    if (req.headers.authorization!=undefined){
        const token = req.headers.authorization.split(' ')[1];
        const verifyedToken = jwt.verify(token, firma);
        try {
            // Admin information | username unique
            const isAdmin = await actions.Select(`SELECT * FROM usuarios WHERE nombreUsuario="${verifyedToken.userName}" AND idRole=1`, {});
            if(isAdmin.length>0){
                return next();
            }else {
                // 400 NOT_PERMISIONS
                res.status(400).json({ success: false, msg: "The user has not permissions to carry out this action" })
            }
        } catch(error){
            console.log({msj: error.message});
            // 404 NOT_PERMISIONS
            res.status(404).json({ success: false, msg: error.message })
        }
    }else {
        // 404 GENERAL_ERROR
        res.status(401).send({success: false, msg: 'No identification token provided'});
    }
}


module.exports.validateFormat = (req, res, next) => {
    const body = req.body;
    var result = {success: false, msg: "INCORRECT_FORMAT"};
    var status = true;

    // Validate username
    if (body.nombreUsuario==undefined || !/^[aA-zZ0-9_\.]+$/.test(body.nombreUsuario)){
        status = false;
        result.nombreUsuario = "INCORRECT_FORMAT"
    }
    // Validate fullname
    if(body.nombreCompleto==undefined || !/(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})*$/.test(body.nombreCompleto)){
        status = false;
        result.nombreCompleto = "INCORRECT_FORMAT";
    }
    // Validate email
    if (body.email==undefined || !/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.email)){
        status = false;
        result.email = "INCORRECT_FORMAT"
    }
    // Validate number phone
    if (body.telefono!=undefined && !/^\d+$/.test(body.telefono)){
        status = false;
        result.telefono = "INCORRECT_FORMAT"
    } else if (body.telefono==undefined){
        req.body.telefono = "";
    }
    // Validate address
    if (body.direccion==undefined){
        status = false;
        result.direccion = "INCORRECT_FORMAT"
    }
    // Validate password
    if (body.contrasena==undefined || !/^[aA-zZ0-9_\.]+$/.test(body.contrasena)){
        status = false;
        result.contrasena = "INCORRECT_FORMAT";
    }

    if (status===true){
        next()
    } else {
        console.log(result)
        res.status(405).send(result); // 405 INCORRECT_FORMAT
    }
}

module.exports.validateFormatProduct = (req, res, next) => {
    const body = req.body;
    var result = {success: false, msg: "INCORRECT_FORMAT"};
    var status = true;

    // Validate nombre de producto
    if (body.nombre==undefined || !/^[a-zA-Z\ ]+$/.test(body.nombre)){
        status = false;
        result.nombre = "INCORRECT_FORMAT"
    }
    // Validate valor de producto
    if (body.valor==undefined || !/^\d+$/.test(body.valor)){
        status = false;
        result.valor = "INCORRECT_FORMAT"
    } 
    // Validate address
    const regex_url = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    if (body.foto==undefined || !regex_url.test(body.foto)){
        status = false;
        result.foto = "INCORRECT_FORMAT"
    }

    if (status===true){
        next()
    } else {
        console.log(result)
        // 405 INCORRECT_FORMAT
        res.status(405).send(result);
    }
}
module.exports.validateFormatProductUpdate = (req, res, next) => {
    const body = req.body;
    var result = {success: false, msg: "INCORRECT_FORMAT"};
    var status = true;

    // Validate nombre de producto
    if (body.nombre!=undefined && !/^[a-zA-Z\ ]+$/.test(body.nombre)){
        status = false;
        result.nombre = "INCORRECT_FORMAT"
    }
    // Validate valor de producto
    if (body.valor!=undefined && !/^\d+$/.test(body.valor)){
        status = false;
        result.valor = "INCORRECT_FORMAT"
    } 
    // Validate address
    if (body.foto!=undefined && !/^[a-zA-Z]+$/.test(body.foto)){
        status = false;
        result.foto = "INCORRECT_FORMAT"
    }

    if (status===true){
        next()
    } else {
        console.log(result)
        // 405 INCORRECT_FORMAT
        res.status(405).send(result);
    }
}

module.exports.validateFormatUpdate = (req, res, next) => {

    /**
     * Un valor [undefined] en un parámetro consultado es un parámetro que no existe,
     * por lo tanto se ignora al creerse que no se quiere modificar
     * 
     * Un valor !=undefined debe pasar por la validación del formato
     * 
     */
     const body = req.body;
     var result = {success: false, msg: "INCORRECT_FORMAT"};
     var status = true;
 
     // Validate username
     if (body.nombreUsuario!=undefined && !/^[aA-zZ0-9_\.]+$/.test(body.nombreUsuario)){
         status = false;
         result.nombreUsuario = "INCORRECT_FORMAT"
     }
     // Validate fullname
     if(body.nombreCompleto!=undefined && !/(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})*$/.test(body.nombreCompleto)){
         status = false;
         result.nombreCompleto = "INCORRECT_FORMAT";
     }
     // Validate email
     if (body.email!=undefined && !/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.email)){
         status = false;
         result.email = "INCORRECT_FORMAT"
     }
     // Validate number phone
     if (body.telefono!=undefined && !/^\d+$/.test(body.telefono)){
         status = false;
         result.telefono = "INCORRECT_FORMAT"
     } 
     // Validate address
     if (body.direccion!=undefined &&  !/^[a-zA-Z0-9#\s,'-]*$/.test(body.direccion)){
         status = false;
         result.direccion = "INCORRECT_FORMAT"
     }
     // Validate password
     if (body.contrasena!=undefined && !/^[aA-zZ0-9_\.]+$/.test(body.contrasena)){
         status = false;
         result.contrasena = "INCORRECT_FORMAT";
     }
     if (body.idRole!=undefined && !/^\d+$/.test(body.idRole)){
         status = false;
         result.idRole = "INCORRECT_FORMAT";
     }
 
     if (status===true){
         next()
     } else {
         console.log(result)
         // 405 INCORRECT_FORMAT
         res.status(405).send(result);
     }

}

module.exports.validateFormatUpdateOrder = async (req, res, next) => {
    /**
     * Un valor [undcefined] en un parámetro consultado es un parámetro que no existe,
     * por lo tanto se ignora al creerse que no se quiere modificar
     * 
     * Un valor !=undefined debe pasar por la validación del formato
     * 
     */
    const body = req.body;
    var result = {success: false, msg: "INCORRECT_FORMAT"};
    var status = true;

    // Validate id | NOT UPDATE, IS FOREIGN KEY OF [DETALLESORDENES]
    // if (body.id!=undefined && !/^\d+$/.test(body.id)){
    //     status = false;
    //     result.id = "INCORRECT_FORMAT"
    // }

    // Validate IdUser | NOT UPDATE, IS FOREIGN KEY
    // if (body.IdUser!=undefined && !/^\d+$/.test(body.IdUser)){
    //     status = false;
    //     result.IdUser = "INCORRECT_FORMAT";
    // }

    // Validate nombre
    if(body.nombre!=undefined && !/[A-Za-z0-9,]+/.test(body.nombre)){
        status = false;
        result.nombre = "INCORRECT_FORMAT";
    }
    // Validate total
    if (body.total!=undefined && !/^\d+$/.test(body.total)){
        status = false;
        result.total = "INCORRECT_FORMAT"
    } 
    // Validate tipoPago
    if (body.tipoPago!=undefined &&  !/^[1-3]+$/.test(body.tipoPago)){
        status = false;
        result.tipoPago = "INCORRECT_FORMAT"
    }
    // Validate tipoPago
    if (body.estado!=undefined &&  !/^[1-6]+$/.test(body.estado)){
        status = false;
        result.estado = "INCORRECT_FORMAT"
    }


    if (status===true){
        next()
    } else {
        console.log(result)
        // 405 INCORRECT_FORMAT
        res.status(405).send(result);
    }
}


// Se utiliza cuando ocurre un registro de usuario para verificar 
// existencia del userName, correo y datos únicos en un registro previo
module.exports.validateUser = async  (req, res, next) => { // Check exists in db
    try {
        const body = req.body;
        user = {
            nombreUsuario: req.body.nombreUsuario,
            email: req.body.email
        }
        const usernameUsed = await actions.Select(`SELECT id FROM usuarios WHERE nombreUsuario=:nombreUsuario`, user);
        const emailUsed = await actions.Select(`SELECT id FROM usuarios WHERE email=:email`, user);

        console.log("users id with username: ", usernameUsed)
        console.log("users id with email: ", emailUsed)
        var result = {success: true, msg: ""};

        if (usernameUsed.length>0 || emailUsed.length>0){   // Validacion de datos en uso
            result.success = false;
            result.msg = "DATA_IN_USE"
            usernameUsed.length>0 ? result.nombreUsuario="NOT_AVAILABLE" : "AVAILABLE";
            emailUsed.length>0 ? result.email="NOT_AVAILABLE" : "AVAILABLE";
            console.log(result)
            // 403 DATA_IN_USE
            res.status(403).send(result); // Finaliza petición
        } else {
            next();
        }

    } catch (error) {   // Error en la validación de datos
        res.json({
            success: false,
            msj: error.message,
            codeError: 01
        });
    }
};
