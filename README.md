# Welcome to Delilah Restó API!

Hi! in this read me, you can find a guide for installing and using **Delilah Restó API**. ![delilah resto acamica](https://s3.amazonaws.com/sc.acamica.com/dwfs-project-3.svg)


# Start up 🚀
These instructions will allow you to get a copy of the project running on your local machine for development and testing purposes.

## Requirements  📋
In the first place,  you must have node.js on your computer, if you don't have it in this [link](https://nodejs.org/en/) you can get it. Also you must need some editor code. I recommend you you [visual Studio Code](https://code.visualstudio.com/)
With node.js and your editor code in your computer the next step its import the database schema in your MySQL workbench. if you don't have MySQL workbench look at this [link](https://dev.mysql.com/downloads/file/?id=506568).

### import the database schema 
For importing the database schema on your MySQL, you only open your workbench and follow these steps:

 1. Open your MySQL workbench. 
 2. Click `Server` on the main tool bar.
 3. Select  `Data Import`.
 4. You should see a link to the default dump folder, typically your  `Documents`  folder in a subfolder titled  `dumps`.
 5. Click the  `...`  and navigate to where your MySQL backup file is located, select the backup you want to load, and click  `OK`.
 6. The schema names in your dump should appear on the left-hand side, at the bottom. Select the schemas that need to be restored.
 7. Select  `Start Import`  on the bottom right.

### connect the database with the project
Open the project in your editor code and open the file action.js in the database folder. then in line 2, you fin the  following code: 

    const database = new Sequelize("mysql://root:PASSWORD@localhost:3306/delilahresto");
 in the code, you must change the `PASSWORD` with your MySQL password.
 that's all, the database schema is connect with the project.


### install node_modules
the final requirement is to install the required modules, you need to open your **computer terminal** in the Delilah resto folder and run the following command:

    npm install
  when you see the node_modules folder you finished!

# start the server :inbox_tray: 

the server is configured to run on the port 3000, which means the server is listening in the http://localhost:3000, if you want to change the port, you can do it in the server.js.
to start the server you only need to run in your **computer terminal** the following command:

    node src/server
> also you can install [nodemon](https://www.npmjs.com/package/nodemon) to work more comfortable

## Autores  ✒️

### this  API was done by:
-   **Andrés Villanueva**  -  _Trabajo Inicial_  -  [theKaise13](https://github.com/thekaise13)
-   **Fulanito Detal**  -  _Trabajo Inicial_ -  [sadnuro](https://github.com/Sadnuro)

## Licencia  📄

Este proyecto está bajo la Licencia  -"MIT"
url: "http://www.apache.org/lice
