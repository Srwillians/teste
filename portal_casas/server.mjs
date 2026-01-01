import express from 'express';
const app = express();

const HA_URL = "http://192.168.2.146:8123";

const inquilinos = {
  "casa1": { user: "visitante1", dash: "/casa-wem" },
  "casa2": { user: "visitante2", dash: "/outra-casa" }
};

app.get('/login', (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("Inquilino nao encontrado");

  // Redireciona para o fluxo de autorizacao oficial
  const finalUrl = `${HA_URL}/auth/authorize?client_id=${encodeURIComponent(HA_URL + "/")}&redirect_uri=${encodeURIComponent(HA_URL + config.dash + "?kiosk")}`;

  res.redirect(finalUrl);
});

app.listen(8099, '0.0.0.0', () => console.log("Redirecionador Multi-Inquilino Ativo 1710"));
