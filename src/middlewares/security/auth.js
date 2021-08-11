const jwt = require('jsonwebtoken');
const firma = 'Firma_para_proyecto';
const actions = require("../../database/actions");


module.exports.generateToken = (data) => {
    return jwt.sign(data, firma);
}

module.exports.validateFormat = (req, res, next) => {
    const body = req.body;
    var result = {success: "ERROR", message: "INCORRECT_FORMAT"};
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
        res.status(404).send(result);
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
     var result = {success: "ERROR", message: "INCORRECT_FORMAT"};
     var status = true;
 
     // Validate username
     if (body.nombreUsuario!=undefined || !/^[aA-zZ0-9_\.]+$/.test(body.nombreUsuario)){
         status = false;
         result.nombreUsuario = "INCORRECT_FORMAT"
     }
     // Validate fullname
     if(body.nombreCompleto!=undefined || !/(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})*$/.test(body.nombreCompleto)){
         status = false;
         result.nombreCompleto = "INCORRECT_FORMAT";
     }
     // Validate email
     if (body.email!=undefined || !/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.email)){
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
 
     if (status===true){
         next()
     } else {
         console.log(result)
         res.status(404).send(result);
     }

}


// Se utiliza cuando ocurre un registro de usuario para verificar 
// existencia del userName, correo y datos únicos en un registro previo
module.exports.validateUser =async  (req, res, next) => { // Check exists in db
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
        var result = {success: "SUCCESS", message: ""};

        if (usernameUsed.length>0 || emailUsed.length>0){   // Validacion de datos en uso
            result.success = "ERROR";
            result.message = "DATA_IN_USE"
            usernameUsed.length>0 ? result.username="NOT_AVAILABLE" : "AVAILABLE";
            emailUsed.length>0 ? result.email="NOT_AVAILABLE" : "AVAILABLE";
            console.log(result)
            res.status(404).send(result); // Finaliza petición
        } else {
            next();
        }

    } catch (error) {   // Error en la validación de datos
        res.json({
            success: "ERROR",
            msj: error.message,
            codeError: 01
        });
    }
};

// Utiliza es req.user creado en [auth.auth], de no existir se debería descifrar el token
module.exports.authAdmin = async (req, res, next)=>{    // Check user rol in db
    const token = req.headers.authorization.split(' ')[1];
    const verifyedToken = jwt.verify(token, firma);
    try {
        // Admin information | username unique
        const isAdmin = await actions.Select(`SELECT * FROM usuarios WHERE nombreUsuario="${verifyedToken.userName}" AND idRole=1`, {});
        if(isAdmin.length>0){
            return next();
        }else {
            res.json({
                error: "El usuario no tiene permisos para realizar esta acción"
            })
        }
    } catch(error){
        console.log({msj: error.message});
        res.json({
            error: "El usuario no tiene permisos para realizar esta acción"
        })
    }
}
