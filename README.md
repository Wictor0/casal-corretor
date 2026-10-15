# Casal Corretor — site e painel

Next.js 15 + Postgres (Drizzle) + bucket S3 do Railway.

- `/painel` — painel administrativo (login por convite)
- `/` — por enquanto, página "em breve"

## Variáveis (Railway)
DATABASE_URL, S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, APP_URL,
INITIAL_USERS="Nome|email;Nome|email" (gera links de convite nos logs do deploy), RESET_INVITES=1 (gera novos links).
