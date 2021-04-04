const path = require("path");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const handlebars = require("express-handlebars");
const productRouter = require("./productRouter");
const vistaRouter = require("./vistaRouter");
const productos = require("./productos");
const { readFile, saveFile, appendFile } = require("./utils/fileManager");

const PORT = 8080;

app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    defaultLayout: "index",
    layoutsDir: path.join(__dirname, "/views/layouts"),
    partialsDir: path.join(__dirname, "/views/partials"),
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.use("/productos", vistaRouter);
app.use("/api", productRouter);

//SOCKET
io.on("connection", (socket) => {
  console.log("Usuario conectado");
  //TABLA EN TIEMPO REAL
  socket.on("getUpdate", () => {
    const lista = productos.getList();
    if (!lista.length)
      return io.emit("update", { existe: false, lista: lista });
    io.emit("update", { existe: true, lista: lista });
  });
  //CHAT
  socket.on("getChatMessages", async () => {
    try {
      const data = await readFile("./chat-message.txt");
      const messages = JSON.parse(data);
      io.emit("messages", messages);
    } catch (err) {
      if (err.code === "ENOENT")
        return io.emit("chatInfo", { info: "No se encontraron mensajes" });
      io.emit("chatInfo", { error: "No fue posible recuperar los mensajes" });
    }
  });
  socket.on("setNewChatMessages", async (message) => {
    try {
      await appendFile("./chat-message.txt");
      const data = await readFile("./chat-message.txt");
      let messages = [];
      if (!!data) messages = JSON.parse(data);
	  const messageWithDate =  {
		  ...message,
		  date: new Date().toLocaleString("es-AR")
	  }
      messages.push(messageWithDate);
      await saveFile("./chat-message.txt", JSON.stringify(messages));
      io.emit("messages", messages);
    } catch (err) {
      io.emit("chatInfo", { error: "No fue posible recuperar los mensajes" });
    }
  });
});

const server = http.listen(PORT, () =>
  console.log(
    `El servidor esta corriendo en el puerto: ${server.address().port}`
  )
);

server.on("error", (err) => console.log(`Error de servidor: ${err}`));
