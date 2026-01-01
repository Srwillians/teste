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
  if (!config) return res.status(404).send("Inquilino não encontrado");

  const finalRedirect = `${HA_URL}${config.dash}?kiosk`;

  res.send(`
    <html>
      <head>
        <title>Conectando...</title>
        <style>body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #111; color: #fff; }</style>
      </head>
      <body>
        <h2>Autenticando Unidade ${id}...</h2>
        <p>Por favor, aguarde...</p>

        <form id="bypassForm" method="POST" action="${HA_URL}/auth/login_flow">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="user" value="${config.user}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${finalRedirect}">
        </form>

        <script>
            // Tentativa de submissão direta
            setTimeout(function() {
                document.getElementById('bypassForm').submit();
            }, 500);
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor v16 Ativo"));
