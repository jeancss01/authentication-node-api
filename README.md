# Authentication Node API

API de autenticação moderna baseada em Node.js, TypeScript e Express, com suporte a OAuth 2.0 + PKCE, arquitetura em camadas (Clean Architecture) e testes automatizados

# Análise de Qualidade

## Análise de Qualidade SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=jeancss01_authentication-node-api)

| Métrica | Valor | Status |
|---------|-------|---------|
| **Quality Gate** | ![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=alert_status) | ✅ |
| **Cobertura** | ![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=coverage) | Target: 95%+ |
| **Bugs** | ![Bugs](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=bugs) | Target: 0 |
| **Vulnerabilidades** | ![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=vulnerabilities) | Target: 0 |
| **Code Smells** | ![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=code_smells) | Minimizado |
| **Manutenibilidade** | ![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=sqale_rating) | Target: A |
| **Confiabilidade** | ![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=reliability_rating) | Target: A |
| **Segurança** | ![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jeancss01_authentication-node-api&metric=security_rating) | Target: A |

## Análise de Qualidade de Código

Este projeto implementa análise contínua de qualidade através do SonarCloud, garantindo:

### Métricas Monitoradas
- **Cobertura de Testes**: Porcentagem de código coberto por testes automatizados
- **Detecção de Bugs**: Identificação de potenciais defeitos no código
- **Vulnerabilidades de Segurança**: Análise de segurança e boas práticas
- **Code Smells**: Detecção de padrões que afetam a manutenibilidade
- **Duplicação de Código**: Identificação de código repetido desnecessário
- **Complexidade Ciclomática**: Medição da complexidade dos métodos

### Quality Gate
O projeto mantém um Quality Gate rigoroso que garante:
- Cobertura mínima de 95%
- Zero bugs críticos
- Zero vulnerabilidades de segurança
- Maintainability Rating A
- Reliability Rating A
- Security Rating A

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
