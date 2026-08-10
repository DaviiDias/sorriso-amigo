# Ambiente local de testes (sem deploy)

Guia para testar login, cadastro por SMS e recuperação de senha na sua máquina,
com banco PostgreSQL real e, opcionalmente, SMS real no seu celular.

## 1. Subir o banco

```bash
cd server
npm install          # só na primeira vez
npm run db:up        # sobe o PostgreSQL no Docker (porta 5432)
npm run db:init      # cria as tabelas e popula os dados iniciais
```

`npm run db:down` para parar o banco. Os dados ficam no volume `pgdata` e
sobrevivem a reinicializações.

## 2. Subir a API

```bash
cd server
npm run dev          # http://localhost:4000 (reinicia sozinho ao salvar)
```

No boot o terminal mostra a porta, os IPs da rede local, o provider de SMS e o
valor de `PUBLIC_ACCESS_MODE`.

## 3. Abrir a aplicação

Duas opções — as duas funcionam:

| Opção | URL | Observação |
|---|---|---|
| **Servida pelo Express** | `http://localhost:4000` | Mais próxima da produção. Não precisa do Live Server. |
| **Live Server** | `http://127.0.0.1:5501` | Mantém o hot reload. O front detecta a porta e chama a API em `:4000` automaticamente. |

O front resolve a URL da API assim:
- servido na porta 4000 → usa a mesma origem;
- servido em outra porta (5501) → troca só a porta, mantendo o host;
- `file://` → `http://localhost:4000/api`.

Para forçar outro endereço, no console do navegador:

```js
localStorage.sorriso_api_base = "http://192.168.15.4:4000/api";
location.reload();
```

## 4. Ler o código do SMS

Com `SMS_PROVIDER=console` (padrão do `.env`) **nenhum SMS é enviado**. O código
aparece em três lugares:

1. no terminal da API: `[sms:console] para +5511987654321: ... codigo e 930199`;
2. no console do navegador: `[dev] codigo de verificacao: 930199`;
3. num toast amarelo na tela (porque `SMS_EXPOSE_CODE=true`).

Isso permite testar todo o fluxo sem gastar SMS.

## 5. Receber SMS de verdade no seu celular

1. Crie uma conta em https://www.twilio.com/try-twilio (o trial dá crédito e um
   número de origem).
2. No trial, **verifique o seu número** em *Phone Numbers → Verified Caller IDs*.
   Contas trial só enviam para números verificados.
3. Preencha no `server/.env`:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+15551234567
SMS_EXPOSE_CODE=false
```

4. Reinicie a API. Agora o cadastro envia SMS para o número digitado.

O código monta o destino como `+55<DDD><numero>`, então basta digitar o telefone
no formato brasileiro na tela.

## 6. Testar pelo celular na mesma rede Wi-Fi

A API escuta em `0.0.0.0`, então basta abrir no celular o IP mostrado no boot:

```
http://192.168.15.4:4000
```

Se não abrir, libere a porta 4000 no Firewall do Windows:

```powershell
New-NetFirewallRule -DisplayName "Sorriso Amigo 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

## 7. Comandos úteis

```bash
# ver usuários cadastrados
docker exec sorriso-amigo-db psql -U postgres -d sorriso_amigo \
  -c "SELECT id, username, phone, phone_verified_at FROM users;"

# ver códigos de verificação pendentes
docker exec sorriso-amigo-db psql -U postgres -d sorriso_amigo \
  -c "SELECT phone, purpose, attempts, expires_at, consumed_at FROM phone_verifications ORDER BY created_at DESC LIMIT 5;"

# limpar tudo e recomeçar
docker exec sorriso-amigo-db psql -U postgres -d sorriso_amigo \
  -c "DELETE FROM users; DELETE FROM phone_verifications;"
```

## Atenção

- **`PUBLIC_ACCESS_MODE` precisa ser `false`** para testar login. Com `true` o
  backend ignora o token e loga todo mundo como "Visitante", e a tela de login
  nem aparece.
- Se a API estiver fora do ar, o front entra em **modo offline simulado** e o
  login "funciona" com dados falsos. Agora isso é avisado por um toast e no
  console — se aparecer, é sinal de que a API não está respondendo.
- O `server/.env` está no `.gitignore`. Nunca versione as credenciais do Twilio.
