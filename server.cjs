/**
 * DeskHub mock API: json-server + custom auth routes (/login, /logout, /me).
 * Run: npm run api
 */
const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

function parseUserIdFromToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  const m = /^deskhub-demo-token-(\d+)$/.exec(token);
  if (!m) return null;
  return Number(m[1]);
}

server.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = router.db
    .get("users")
    .find({ email, password })
    .value();

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const { password: _p, ...safe } = user;
  return res.json({
    token: `deskhub-demo-token-${user.id}`,
    user: safe,
  });
});

server.post("/logout", (_req, res) => {
  res.status(204).send();
});

server.get("/me", (req, res) => {
  const userId = parseUserIdFromToken(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = router.db.get("users").find({ id: userId }).value();
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { password: _p, ...safe } = user;
  return res.json(safe);
});

server.use(router);

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, () => {
  console.log(`DeskHub API at http://localhost:${PORT}`);
});
