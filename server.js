"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var path = require("path");

var express = require("express");

var app = express();

var http = require("http").Server(app);

var io = require("socket.io")(http);

var handlebars = require("express-handlebars");

var productRouter = require("./productRouter");

var vistaRouter = require("./vistaRouter");

var productos = require("./productos");

var _require = require("./utils/fileManager"),
    readFile = _require.readFile,
    saveFile = _require.saveFile,
    appendFile = _require.appendFile;

var PORT = 8080;
app.engine("hbs", handlebars({
  extname: "hbs",
  defaultLayout: "index",
  layoutsDir: path.join(__dirname, "/views/layouts"),
  partialsDir: path.join(__dirname, "/views/partials")
}));
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"](path.join(__dirname, "/public")));
app.use("/productos", vistaRouter);
app.use("/api", productRouter); //SOCKET

io.on("connection", function (socket) {
  console.log("Usuario conectado"); //TABLA EN TIEMPO REAL

  socket.on("getUpdate", function () {
    var lista = productos.getList();
    if (!lista.length) return io.emit("update", {
      existe: false,
      lista: lista
    });
    io.emit("update", {
      existe: true,
      lista: lista
    });
  }); //CHAT

  socket.on("getChatMessages", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var data, messages;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return readFile("./chat-message.txt");

          case 3:
            data = _context.sent;
            messages = JSON.parse(data);
            io.emit("messages", messages);
            _context.next = 13;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);

            if (!(_context.t0.code === "ENOENT")) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return", io.emit("chatInfo", {
              info: "No se encontraron mensajes"
            }));

          case 12:
            io.emit("chatInfo", {
              error: "No fue posible recuperar los mensajes"
            });

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  })));
  socket.on("setNewChatMessages", /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(message) {
      var data, messages, messageWithDate;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return appendFile("./chat-message.txt");

            case 3:
              _context2.next = 5;
              return readFile("./chat-message.txt");

            case 5:
              data = _context2.sent;
              messages = [];
              if (!!data) messages = JSON.parse(data);
              messageWithDate = _objectSpread(_objectSpread({}, message), {}, {
                date: new Date().toLocaleString("es-AR")
              });
              messages.push(messageWithDate);
              _context2.next = 12;
              return saveFile("./chat-message.txt", JSON.stringify(messages));

            case 12:
              io.emit("messages", messages);
              _context2.next = 18;
              break;

            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2["catch"](0);
              io.emit("chatInfo", {
                error: "No fue posible recuperar los mensajes"
              });

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 15]]);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }());
});
var server = http.listen(PORT, function () {
  return console.log("El servidor esta corriendo en el puerto: ".concat(server.address().port));
});
server.on("error", function (err) {
  return console.log("Error de servidor: ".concat(err));
});
