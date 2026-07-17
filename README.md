# Water & Gas Reader API

Uma API REST desenvolvida em **Node.js**, **TypeScript**, **Express** e **Sequelize (PostgreSQL)** que automatiza a leitura de consumo de medidores de água e gás (gas/water utility meters) utilizando a **API de IA Generativa do Google Gemini (Gemini Vision)**.

O sistema recebe a imagem do medidor em base64, realiza o upload seguro para o gerenciador de arquivos da IA, utiliza *prompt engineering* com esquema de resposta JSON estruturado para extrair a medição numérica e persiste as informações para posterior validação e listagem.

---

## 🚀 Funcionalidades

- **`POST /upload`**: Recebe uma foto do medidor em formato Base64.
  - Valida os dados de entrada.
  - Verifica se já existe uma leitura do mesmo tipo (`WATER` ou `GAS`) registrada para o cliente no mês corrente (impedindo leituras duplicadas: `DOUBLE_REPORT`).
  - Realiza o upload da imagem de forma segura para o Google AI Studio via `GoogleAIFileManager`.
  - Executa o processamento visual (OCR) usando o modelo **Gemini 1.5 Flash** configurado com esquema de resposta estruturado (`SchemaType`) para retornar o valor numérico preciso.
  - Salva o registro no banco de dados e retorna a URL da imagem processada, a medição e um UUID exclusivo.
  
- **`PATCH /confirm`**: Confirma ou corrige o valor medido gerado pela IA.
  - Impede confirmações duplicadas.
  
- **`GET /:customer_code/list`**: Lista todas as medições realizadas por um cliente específico, com suporte a filtro opcional por tipo (`WATER` ou `GAS`).

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** Node.js (v20+)
- **Linguagem:** TypeScript
- **Framework Web:** Express
- **Persistência & ORM:** PostgreSQL & Sequelize
- **SDK de Inteligência Artificial:** `@google/generative-ai` & `@google/generative-ai/server`
- **Orquestração & Containerização:** Docker & Docker Compose

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
PORT=3000
GEMINI_API_KEY=sua_chave_do_google_gemini_aqui
DATABASE_URL=postgres://user:password@db:5432/database
```

---

## 🐳 Como Executar com Docker

Para subir a aplicação e o banco de dados PostgreSQL integrados em containers, basta rodar:

```bash
docker-compose up --build
```

A API estará disponível em `http://localhost:3000`.

---

## 📦 Execução Local (Desenvolvimento)

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Compilar TypeScript:**
   ```bash
   npm run build
   ```

3. **Iniciar o servidor:**
   ```bash
   npm start
   ```

Para rodar em modo de desenvolvimento com recarregamento rápido (hot-reload):
```bash
npm run dev
```

---

## 📋 Endpoints da API

### 1. Upload de Medição
* **Rota:** `POST /upload`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "customer_code": "CUST-1234",
    "measure_datetime": "2026-07-16T21:00:00Z",
    "measure_type": "WATER"
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "image_url": "https://generativelanguage.googleapis.com/v1beta/files/...",
    "measure_value": 347,
    "measure_uuid": "e30e791e-355b-489e-8c3f-a5f8e45fef56"
  }
  ```

### 2. Confirmar Medição
* **Rota:** `PATCH /confirm`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "measure_uuid": "e30e791e-355b-489e-8c3f-a5f8e45fef56",
    "confirmed_value": 350
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true
  }
  ```

### 3. Listar Medições do Cliente
* **Rota:** `GET /:customer_code/list?measure_type=WATER`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "customer_code": "CUST-1234",
    "measures": [
      {
        "measure_uuid": "e30e791e-355b-489e-8c3f-a5f8e45fef56",
        "measure_datetime": "2026-07-16T21:00:00.000Z",
        "measure_type": "WATER",
        "measure_value": 350,
        "has_confirmed": true,
        "image_url": "https://..."
      }
    ]
  }
  ```
