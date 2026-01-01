import express from 'express';
const app = express();

const HA_URL = "http://192.168.2.146:8123";

// Mapeamento de IDs para nomes de usuários EXATOS do seu HA
const inquilinos = {
  "casa1": { user: "visitante1", dash: "/casa-wem" },
  "casa2": { user: "visitante2", dash: "/outra-casa" }
};

app.get('/login', (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) return res.status(404).send("Inquilino não encontrado");

  // A mágica: enviamos para o fluxo de autorização forçando o provedor 'trusted_networks'
  // O parâmetro 'trusted_auth_provider' tenta pular a tela de senha
  const finalUrl = `${HA_URL}/auth/authorize?client_id=${encodeURIComponent(HA_URL + "/")}&redirect_uri=${encodeURIComponent(HA_URL + config.dash + "?kiosk")}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Conectando...</title>
        <style>body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #000; color: #fff; }</style>
    </head>
    <body>
        <h2>Acessando Unidade ${id}...</h2>
        <p>Autenticando via rede segura...</p>
        
        <script>
            // Redireciona para o fluxo de autorização
            // Como você está na rede local, o HA verá o provedor 'trusted_networks'
            window.location.href = "${finalUrl}";
        </script>
    </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor de Injeção Online 1654"));
