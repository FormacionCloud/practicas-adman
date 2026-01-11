var express = require("express");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

app.set("view engine", "pug");

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.render("index", {
    title: "Página de bienvenida",
    greeting: "Hola",
    data: req.query.data,
  });
});

// TODO: Descomenta este código cuando se pida en el enunciado
/*

router.get("/adios", (req, res) => {
  res.render("index", {
    title: "Página de despedida",
    greeting: "Adiós",
    data: req.query.data,
  });
});

*/

router.get("/parametro", async (req, res) => {
  // TODO: cambia TUS_INICIALES por tus iniciales reales
  const param_name = "/practica-secretos/TUS_INICIALES/param1";

  // Cliente de SSM
  const client = new SSMClient();

  // Configuración de la petición
  const input = {
    Name: param_name,
    WithDecryption: false,
  };

  // Comando
  const command = new GetParameterCommand(input);

  let greeting, data;

  try {
    // Petición a la API de AWS
    const response = await client.send(command);

    // Si no hay fallo, se muestra el valor del parámetro junto con un texto descriptivo
    greeting = "El valor del parámetro es:";
    data = response.Parameter.Value;
  } catch (error) {
    // Si hay un fallo, se muestra el mensaje de error junto con un texto descriptivo
    greeting = "Ha ocurrido el siguiente error al obtener el parámetro:";
    data = error.message;
  }

  res.render("index", {
    title: "Página para mostrar parámetro de SSM",
    greeting: greeting,
    data: data,
  });
});

app.use("/", router);

// Puerto de escucha
var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log("Servidor escuchando en puerto " + port);
});
