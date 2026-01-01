import express from 'express';
const app = express();

// --- CONFIGURAÇÃO (AJUSTE AQUI) ---
const HA_URL = "http://192.168.2.146:8123"; // O IP do seu Home Assistant

const inquilinos = {
  "casa1": { user: "visitante1", pass: "12345", dash: "/casa-wem/0" },
  "casa2": { user: "visitante2", pass: "12345", dash: "/outra-casa" },
  "casa3": { user: "inquilino3", pass: "senha3", dash: "/lovelace-casa3" },
  "casa4": { user: "inquilino4", pass: "senha4", dash: "/lovelace-casa4" },
  "casa5": { user: "inquilino5", pass: "senha5", dash: "/lovelace-casa5" },
  "casa6": { user: "inquilino6", pass: "senha6", dash: "/lovelace-casa6" }
};
// ---------------------------------
// Rota de Diagnóstico: Se você acessar http://IP:8099/ ele mostra isso
app.get('/', (req, res) => {
  const idsDisponiveis = Object.keys(inquilinos).join(', ');
  res.send(`
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #03a9f4;">Porteiro Digital Online!</h2>
      <p>O servidor está funcionando corretamente.</p>
      <p><strong>IDs configurados:</strong> ${idsDisponiveis}</p>
      <p>Tente acessar: <a href="/login?id=casa1">/login?id=casa1</a></p>
    </div>
  `);
});

// Rota de Login Principal
app.get('/login', (req, res) => {
  const id = req.query.id;
  const config = inquilinos[id];

  if (!config) {
    return res.status(404).send(`
      <div style="font-family: sans-serif; padding: 20px; color: red;">
        <h1>404 - Casa não encontrada</h1>
        <p>O ID <strong>"${id}"</strong> não existe no servidor.</p>
        <p>Verifique se digitou corretamente no link ou no arquivo server.mjs.</p>
        <a href="/">Ver IDs disponíveis</a>
      </div>
    `);
  }

  // Gera o formulário de login automático
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Conectando à ${id}</title>
        <meta charset="utf-8">
      </head>
      <body onload="document.forms[0].submit()" style="font-family: sans-serif; text-align: center; padding-top: 100px;">
        <h2>Iniciando sessão na ${id}...</h2>
        <p>Aguarde o redirecionamento.</p>
        
        <form method="POST" action="${HA_URL}/auth/login">
          <input type="hidden" name="handler" value="homeassistant">
          <input type="hidden" name="username" value="${config.user}">
          <input type="hidden" name="password" value="${config.pass}">
          <input type="hidden" name="redirect_uri" value="${config.dash}?kiosk">
        </form>
      </body>
    </html>
  `);
});

// Importante: usar '0.0.0.0' para o Docker permitir acesso externo
app.listen(8099, '0.0.0.0', () => {
  console.log("Servidor Multi-Casa rodando na porta 8099");
});

