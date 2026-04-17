# AIFit App 🏋️‍♂️🤖

Uma plataforma full-stack impulsionada por IA que gera rotinas de treino e planos de dieta hiper-personalizados utilizando as próprias chaves de Inteligência Artificial do usuário (BYOK - Bring Your Own Key).

## 🚀 Tech Stack (Tecnologias)

- **Frontend:** Angular 17 (Standalone Components)
- **Estilização:** TailwindCSS + UI Customizada em Glassmorphism
- **i18n:** `LanguageService` customizado + `TranslatePipe` (Base em PT-BR / Dicionário em EN-US)
- **Ícones:** Lucide-Angular
- **Backend:** .NET 8 Web API (C#)
- **Banco de Dados:** SQLite via Entity Framework Core (EF Core)
- **Autenticação:** JWT Bearer tokens & Hashing de senha com BCrypt
- **Integrações de IA:** Google Gemini 2.0 Flash, OpenAI (ChatGPT) & **Ollama (IA Local)**

## 📁 Estrutura do Projeto

O repositório está dividido em duas aplicações principais:
- `/AiFit-Web` - A aplicação Frontend em Angular.
- `/AIFit-Service` - O serviço de Backend em .NET 8 e Banco de Dados SQLite.

## ✨ Principais Funcionalidades

- **Cérebro de IA BYOK:** Conecte sua própria chave da OpenAI, Google Gemini, ou rode o **Ollama localmente** para gerações gratuitas e ilimitadas.
- **Suporte Multilíngue:** Interface totalmente traduzida em **Inglês** e **Português**, com prompts que se ajustam automaticamente ao idioma do usuário.
- **Gerador de Treinos:** Cria divisões de treino detalhadas dia a dia, adaptadas à sua experiência, lesões e objetivos.
- **Gerador de Dieta:** Cria planos alimentares personalizados com rastreamento preciso de macronutrientes baseados em metas calóricas e restrições dietéticas.
- **Medidas & Progresso:** Monitore peso corporal, tórax, cintura e medidas de membros com rastreamento histórico automático.
- **Interface Moderna:** Dashboard responsivo em glassmorphism com barra lateral fixa e monitoramento de status da IA em tempo real.

## 🛠️ Como Executar Localmente

### 1. Iniciar o Backend (.NET)
Abra um terminal na pasta raiz e navegue até o serviço de backend:
```bash
cd AIFit-Service
dotnet restore
dotnet run
A API começará a rodar em http://localhost:5177.

2. Iniciar o Frontend (Angular)
Abra uma nova janela de terminal e navegue até o portal frontend:

Bash
cd AiFit-Web
npm install
npm run start
# ou npx ng serve
A aplicação web abrirá automaticamente em http://localhost:4200.

3. Configuração
Crie uma conta local no aplicativo.

Vá em Perfil (ícone de engrenagem na barra lateral).

Preferências do App: Altere o idioma do sistema para Inglês ou Português.

Configuração de IA: - Selecione OpenAI ou Gemini e insira sua chave (use TEST para dados simulados offline).

Selecione Ollama para usar um LLM local (requer Ollama instalado e rodando em localhost:11434).