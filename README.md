# Authentication Node API

API de autenticação moderna baseada em Node.js, TypeScript e Express, com suporte a OAuth 2.0 + PKCE, arquitetura em camadas (Clean Architecture) e testes automatizados.

[![CI](https://github.com/jeancss01/authentication-node-api/actions/workflows/ci.yml/badge.svg)](https://github.com/jeancss01/authentication-node-api/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=jeancss01_authentication-node-api)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=coverage)](https://sonarcloud.io/summary/new_code?id=jeancss01_authentication-node-api)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=jeancss01_authentication-node-api)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=jeancss01_authentication-node-api)

## 🚀 Funcionalidades

- Cadastro e autenticação de usuários
- Fluxo OAuth 2.0 Authorization Code com PKCE
- Geração e validação de access token e refresh token (JWT)
- Rotas protegidas por middleware de autenticação
- Armazenamento seguro de códigos e tokens (MongoDB)
- Testes automatizados (Jest/Postman)
- Arquitetura modular e escalável

## 🏗️ Arquitetura

O projeto segue os princípios da Clean Architecture, dividido em:

- **Domain:** Modelos e contratos de negócio
- **Presentation:** Controllers, middlewares e validação HTTP
- **Infra:** Implementações técnicas (MongoDB, JWT, criptografia)
- **Main:** Inicialização, rotas e injeção de dependências

## 📂 Estrutura de Pastas

```
src/
  data/         # Casos de uso e protocolos
  domain/       # Modelos e interfaces de negócio
  infra/        # Repositórios, criptografia, DB
  main/         # Bootstrap, rotas, factories
  presentation/ # Controllers, middlewares, helpers
```

## ⚡ Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jeancss01/authentication-node-api.git
   cd authentication-node-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o ambiente:**
   - Edite o arquivo `.env` conforme necessário (exemplo em `src/main/config/env.ts`).

4. **Inicie o MongoDB:**
   ```bash
   brew services start mongodb-community
   # ou
   mongod --dbpath /usr/local/var/mongodb
   ```

5. **Inicie a API:**
   ```bash
   npm start
   ```

## 🛡️ Rotas Principais

- `POST /signup` – Cadastro de usuário
- `POST /login` – Login tradicional
- `GET /account` – Consulta de conta (protegida)
- `GET /oauth/authorize` – Início do fluxo OAuth2 + PKCE
- `POST /oauth/login` – Login no fluxo OAuth2
- `POST /oauth/token` – Troca de código por tokens

## 🧪 Testes

- **Testes unitários:**  
  Execute com:
  ```bash
  npm test
  ```
- **Testes de integração:**  
  Coleção Postman disponível em `/collections`.

## 📱 Integração com Aplicativos Mobile

O fluxo OAuth2 + PKCE foi projetado para integração segura com apps móveis, eliminando a necessidade de armazenar client_secret no dispositivo e protegendo contra ataques de interceptação.

## 📝 Licença

Este projeto está licenciado sob a licença ISC.
