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
        <div id="status">Iniciando fluxo seguro...</div>

        <script>
            async function login() {
                const status = document.getElementById('status');
                try {
                    // PASSO 1: Iniciar o fluxo enviando um JSON real pelo navegador
                    const resFlow = await fetch("${HA_URL}/auth/login_flow", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            handler: ["trusted_networks", "trusted_networks"],
                            client_id: "${HA_URL}/",
                            redirect_uri: "${finalRedirect}"
                        })
                    });

                    const flowData = await resFlow.json();
                    const flowId = flowData.flow_id;

                    status.innerText = "Confirmando usuário...";

                    // PASSO 2: Enviar o usuário selecionado para o Flow ID gerado
                    // Usamos um formulário padrão aqui para garantir o redirecionamento final
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

                } catch (err) {
                    status.innerHTML = "Erro de conexão.<br>Certifique-se de que o CORS está ativo no HA.";
                    console.error(err);
                }
            }

            login();
        </script>
      </body>
    </html>
  `);
});

app.listen(8099, '0.0.0.0', () => console.log("Servidor v14 Ativo 1723"));
