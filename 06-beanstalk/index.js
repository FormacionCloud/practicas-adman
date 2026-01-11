var express = require("express");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();

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

app.use("/", router);

// Puerto de escucha
var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log("Servidor escuchando en puerto " + port);
});
