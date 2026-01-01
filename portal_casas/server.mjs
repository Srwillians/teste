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
        <title>Autenticando...</title>
        <style>body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #111; color: #ccc; }</style>
      </head>
      <body>
        <div id="status">Iniciando conexão segura para Unidade ${id}...</div>

        <form id="formStep1" method="POST" action="${HA_URL}/auth/login_flow" target="hidden_frame">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${finalRedirect}">
        </form>

        <iframe name="hidden_frame" id="hidden_frame" style="display:none"></iframe>

        <script>
            // Dispara o primeiro passo automaticamente
            document.getElementById('formStep1').submit();

            // O HA redirecionará o iframe para uma URL contendo o flow_id.
            // Tentamos capturar ou simplesmente prosseguir para a escolha do usuario
            setTimeout(function() {
                document.getElementById('status').innerText = "Validando credenciais...";
                
                // Redirecionamos o visitante para a tela de autorizacao
                // Como ele ja disparou o flow acima, o HA ja o reconhece na rede
                const authUrl = "${HA_URL}/auth/authorize?client_id=${encodeURIComponent(HA_URL + "/")}&redirect_uri=${encodeURIComponent(finalRedirect)}";
                window.location.href = authUrl;
            }, 1000);
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor v12 Online 1717"));
