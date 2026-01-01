import express from 'express';
const app = express();

// --- CONFIGURAÇÃO ---
const HA_URL = "http://192.168.2.146:8123"; 

const inquilinos = {
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem/0" },
  "casa2": { user: "visitante2", pass: "12345", dash: "/outra-casa" },
  "casa3": { user: "inquilino3", pass: "senha3", dash: "/lovelace-casa3" },
  "casa4": { user: "inquilino4", pass: "senha4", dash: "/lovelace-casa4" },
  "casa5": { user: "inquilino5", pass: "senha5", dash: "/lovelace-casa5" },
  "casa6": { user: "inquilino6", pass: "senha6", dash: "/lovelace-casa6" }
};
// --------------------

app.get('/', (req, res) => {
  res.send("Porteiro Online. Use /login?id=casa1");
});

app.get('/login', (req, res) => {
  const id = req.query.id; // ESTA LINHA ESTAVA FALTANDO
  const config = inquilinos[id];

  if (!config) {
    return res.status(404).send(`ID ${id} nao encontrado.`);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Login</title>
      </head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
        <h2>Conectando à ${id}...</h2>
        
        <form id="form" method="POST" action="${HA_URL}/auth/login">
          <input type="hidden" name="handler" value="homeassistant">
          <input type="hidden" name="client_id" value="${HA_URL}/">
          <input type="hidden" name="redirect_uri" value="${HA_URL}${config.dash}?kiosk">
          <input type="hidden" name="username" value="${config.user}">
          <input type="hidden" name="password" value="${config.pass}">
        </form>

        <script>
          setTimeout(function() {
            document.getElementById('form').submit();
          }, 500);
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => {
  console.log("Servidor Multi-Casa rodando na porta 8099");
});
