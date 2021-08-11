const jwt = require('jsonwebtoken');
const firma = 'Firma_para_proyecto';
const actions = require("../../database/actions");


module.exports.generateToken = (data) => {
    return jwt.sign(data, firma);
}

// Solo decodifica el token --NO tiene propósito
module.exports.auth = (req, res, next) => { // Check exists in db
    console.log("auth.auth")
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerificado = jwt.verify(token, firma);
        if(tokenVerificado) {
            req.user = tokenVerificado;
            return next();
        }
    } catch (error) {
        console.log(error.message)
        res.json({
            msj: error.message,
            error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            codeError: 01
        });
    }
};

// Utiliza es req.user creado en [auth.auth], de no existir se debería descifrar el token
module.exports.authAdmin = async (req, res, next)=>{    // Check user rol in db
    try {
        const isAdmin = await actions.Select(`SELECT * FROM usuarios WHERE nombreUsuario="${req.user.userName}" AND idRole=1`, {});
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

