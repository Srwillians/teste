import express from 'express';
const app = express();

// --- CONFIGURAÇÃO ---
const HA_URL = "http://192.168.2.146:8123"; 

const inquilinos = {
  // Removido o /0 e o ?kiosk para garantir compatibilidade total
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem" },
  "casa2": { user: "visitante2", pass: "12345", dash: "/outra-casa" }
};
// --------------------

app.get('/login', (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("Casa nao encontrada.");

  res.send(`
    <!DOCTYPE html>
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${HA_URL}/auth/login">
          <input type="hidden" name="handler" value="homeassistant">
          <input type="hidden" name="client_id" value="${HA_URL}/">
          <input type="hidden" name="redirect_uri" value="${HA_URL}${config.dash}">
          <input type="hidden" name="username" value="${config.user}">
          <input type="hidden" name="password" value="${config.pass}">
        </form>
        <p style="text-align:center; font-family:sans-serif; margin-top:50px;">
          Redirecionando para ${id}...
        </p>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor rodando na porta 8099"));
