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

  if (!config) {
    return res.status(404).send("ID do inquilino nao encontrado.");
  }

  const finalRedirect = `${HA_URL}${config.dash}?kiosk`;

  // Esta resposta gera um formulario HTML que se envia sozinho (autosubmit)
  // Ele simula exatamente o clique no botao de "Login" do Home Assistant
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Autenticando - Unidade ${id}</title>
    </head>
    <body onload="document.forms[0].submit()" style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        
        <h2>Conectando à unidade ${id}...</h2>
        <p>Por favor, aguarde o redirecionamento.</p>

        <form method="POST" action="${HA_URL}/auth/login">
            <input type="hidden" name="handler" value="homeassistant">
            <input type="hidden" name="username" value="${config.user}">
            <input type="hidden" name="password" value="${config.pass}">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${finalRedirect}">
        </form>

        <script>
            // Caso o onload demore, tentamos forcar o envio apos 500ms
            setTimeout(function(){
                document.forms[0].submit();
            }, 500);
        </script>
    </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => {
  console.log("Servidor de Redirecionamento Direto Online na porta 8099 1649");
});
