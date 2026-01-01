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

  // Em vez de fetch (que dá erro de CORS), usamos um redirecionamento 
  // que já "empurra" o usuário para o provedor de rede confiável.
  const authUrl = `${HA_URL}/auth/authorize?client_id=${encodeURIComponent(HA_URL + "/")}&redirect_uri=${encodeURIComponent(finalRedirect)}&auth_callback=1`;

  res.send(`
    <html>
      <head>
        <title>Conectando...</title>
        <style>body { font-family: sans-serif; text-align: center; padding-top: 100px; background: #111; color: #fff; }</style>
      </head>
      <body>
        <h2>Acessando Unidade ${id}...</h2>
        <p>Aguarde o redirecionamento seguro...</p>

        <script>
            // Redirecionamos para a página de autorização oficial.
            // O HA detectará seu IP e mostrará a lista de usuários.
            window.location.href = "${authUrl}";
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor v15 Online"));
