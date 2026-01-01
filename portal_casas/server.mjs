import express from 'express';
const app = express();

const HA_URL = "http://192.168.2.146:8123";

const inquilinos = {
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem" },
  "casa2": { user: "visitante2", pass: "12345", dash: "/outra-casa" }
};

app.get('/login', (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("ID nao encontrado");

  // Este link leva o usuario para o inicio do fluxo oficial de login
  // Passando o client_id e o redirect_uri via URL (GET), que evita o erro de JSON
  const authUrl = `${HA_URL}/auth/authorize?client_id=${encodeURIComponent(HA_URL + "/")}&redirect_uri=${encodeURIComponent(HA_URL + config.dash + "?kiosk")}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h2>Conectando à unidade ${id}...</h2>
        <p>Identificando usuário: <strong>${config.user}</strong></p>
        
        <form id="loginForm" method="POST" action="${HA_URL}/auth/login_flow">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="handler" value="homeassistant">
            <input type="hidden" name="handler" value="homeassistant"> 
            <input type="hidden" name="redirect_uri" value="${HA_URL}${config.dash}?kiosk">
        </form>

        <script>
            // Em vez de POST direto pro login, vamos apenas redirecionar
            // para a pagina de login ja com os dados pre-configurados na URL
            window.location.href = "${authUrl}";
        </script>
    </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor Online"));
