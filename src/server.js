// Template 2 | With delilah resto querys

const express = require('express');
// const helmet = require('helmet');
// const bodyparser = require('body-parser');

const userRouter = require('./routes/users');
const orderRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');

const server = express();
// server.use(bodyparser.json());
server.use(express.json())
// server.use(helmet());

server.use('/', userRouter);
server.use('/', orderRouter);
server.use('/', authRouter);
server.use('/', productsRouter);


const port = 3000;

server.get('/', (req, res) => {
    res.send('Bienvenido');
});

server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

/**
 * {
        "name": "SequelizeConnectionError",
        "parent": {
            "errorno": "ETIMEDOUT",
            "code": "ETIMEDOUT",
            "syscall": "connect",
            "fatal": true
        },
        "original": {
            "errorno": "ETIMEDOUT",
            "code": "ETIMEDOUT",
            "syscall": "connect",
            "fatal": true
        }
    }
 */