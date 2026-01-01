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

  const finalRedirect = `${HA_URL}${config.dash}?kiosk`;

  // Geramos um HTML que faz o POST automático. 
  // O HA espera o campo "user" (ID do usuario) quando o handler é trusted_networks.
  res.send(`
    <html>
      <head>
        <title>Autenticando...</title>
        <style>body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #1c1c1c; color: white; }</style>
      </head>
      <body>
        <h2>Acessando Unidade ${id}...</h2>
        <p>Validando acesso para: <strong>${config.user}</strong></p>

        <form id="autoLoginForm" method="POST" action="${HA_URL}/auth/login_flow">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="user" value="${config.user}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${finalRedirect}">
        </form>

        <script>
            // Dispara o envio do formulario em 500ms
            setTimeout(function() {
                document.getElementById('autoLoginForm').submit();
            }, 500);
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Porteiro Automático v13 Online 1721"));
