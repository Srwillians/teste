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

  // Geramos um HTML que faz o POST direto do navegador do usuario.
  // Isso garante que o HA veja o IP correto do visitante.
  res.send(`
    <html>
      <head>
        <title>Autenticando Unidade ${id}</title>
        <style>body { font-family: sans-serif; text-align: center; padding-top: 100px; }</style>
      </head>
      <body>
        <h2>Conectando à Unidade ${id}...</h2>
        <p>Aguarde a validação de segurança.</p>

        <form id="step1" method="POST" action="${HA_URL}/auth/login_flow">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="handler" value="trusted_networks">
            <input type="hidden" name="client_id" value="${HA_URL}/">
            <input type="hidden" name="redirect_uri" value="${finalRedirect}">
        </form>

        <script>
            // O HA retornará um JSON se usarmos AJAX, mas queremos que ele mude a página.
            // Para automação total sem erro de JSON, usamos o próprio navegador:
            async function loginAutomatico() {
                try {
                    // Pedimos o Flow ID via navegador (IP do visitante)
                    const response = await fetch("${HA_URL}/auth/login_flow", {
                        method: 'POST',
                        body: JSON.stringify({
                            handler: ["trusted_networks", "trusted_networks"],
                            client_id: "${HA_URL}/",
                            redirect_uri: "${finalRedirect}"
                        })
                    });
                    
                    const data = await response.json();
                    const flowId = data.flow_id;

                    // Agora criamos e enviamos o formulário de confirmação do usuário
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = "${HA_URL}/auth/login_flow/" + flowId;

                    const fields = {
                        "user": "${config.user}",
                        "client_id": "${HA_URL}/",
                        "redirect_uri": "${finalRedirect}"
                    };

                    for (const key in fields) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = fields[key];
                        form.appendChild(input);
                    }

                    document.body.appendChild(form);
                    form.submit();
                } catch (e) {
                    console.error(e);
                    document.body.innerHTML = "<h2>Erro ao conectar. Verifique se você está no Wi-Fi correto.</h2>";
                }
            }

            loginAutomatico();
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor de Auto-Login 100% Ativo"));
