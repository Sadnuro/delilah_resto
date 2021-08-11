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
    // Validate email format
    // [a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*    

    if (!/^[aA-zZ0-9_\.]+$/.test(body.nombreUsuario)){
        status = false;
        result.username = "INCORRECT_FORMAT"
    }
    if (!/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(body.email)){
        status = false;
        result.email = "INCORRECT_FORMAT"
    }

    if (status===true){
        next()
    } else {
        console.log(result)
        res.status(404).send(result);
    }
    // Validate usrname format
}


// Se utiliza cuando ocurre un registro de usuario para verificar 
// existencia del userName, correo y datos únicos en un registro previo
module.exports.validateUser =async  (req, res, next) => { // Check exists in db
    try {
        const body = req.body;
        // if(body.nombreUsuario!=undefined && body.email!=undefined){
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

        // } else { // Falta un parámetro en los datos a registrar
        //     console.log("Not data complete... username and email are required params")
        //     res.status(404).send({success: "ERROR", message:"INCOMPLETE_DATA", username: `${req.body.nombreUsuario}`, email: `${req.body.email}`});
        // }
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
