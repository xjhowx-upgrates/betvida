# BetVida - Plataforma de Apostas com Minutos de Vida

BetVida é uma plataforma inovadora de apostas onde os usuários apostam minutos da sua vida, não dinheiro real. Uma experiência gamificada que combina jogos de cassino com conteúdo educacional e motivacional.

## 📋 Visão Geral

- **Conceito**: Aposte minutos da sua vida em jogos de cassino virtuais
- **Mecânica**: Se ganhar, acumule minutos bônus e conquistas; se perder, assista vídeos educacionais/motivacionais
- **Tecnologias**: React.js, Firebase (Auth, Firestore), TailwindCSS
- **Monetização**: Vídeos patrocinados, itens virtuais, clube VIP (mockup)

## 🚀 Funcionalidades

- **Jogos**: Fortune Tiger, Crash, Roleta
- **Autenticação**: Login social com Google e Discord
- **Perfil de Usuário**: Minutos ganhos/perdidos, conquistas, histórico de apostas
- **Sistema de Apostas**: Aposte minutos, ganhe ou perca com base em probabilidade
- **Sistema de Vídeos**: Assista vídeos proporcionais ao tempo perdido
- **Ranking**: Leaderboard global de minutos ganhos
- **Conquistas**: Desbloqueie conquistas baseadas em ações no jogo

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js com hooks funcionais
- **Estilização**: TailwindCSS para design responsivo
- **Backend**: Firebase (Serverless)
  - Authentication: Login social
  - Firestore: Banco de dados NoSQL
  - Functions: Lógica de backend (futura implementação)
- **Hospedagem**: Vercel ou Firebase Hosting (configuração pronta)

## 📁 Estrutura do Projeto

```
betvida/
├── public/               # Arquivos públicos
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── games/        # Componentes de jogos
│   │   └── ...
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Serviços de integração com Firebase
│   ├── firebase.js       # Configuração do Firebase
│   └── ...
├── package.json          # Dependências do projeto
└── README.md             # Documentação
```

## 🔧 Instalação e Configuração

1. **Clone o repositório**:
   ```
   git clone <url-do-repositorio>
   cd betvida
   ```

2. **Instale as dependências**:
   ```
   npm install
   ```

3. **Configure o Firebase**:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Google e Discord)
   - Ative Firestore Database
   - Copie as credenciais para `src/firebase.js`

4. **Inicie o servidor de desenvolvimento**:
   ```
   npm start
   ```

5. **Construa o projeto para produção**:
   ```
   npm run build
   ```

## 📱 Fluxo do Usuário

1. Usuário faz login com Google/Discord
2. Escolhe um jogo para apostar
3. Define quantos minutos quer apostar
4. Recebe o resultado:
   - Se ganhar: Acumula minutos e pode continuar apostando
   - Se perder: Deve assistir um vídeo proporcional ao tempo perdido

## 🔒 Observações Legais

- **Não envolve dinheiro real**: Apenas minutos virtuais são apostados
- **Transparência**: Sem promessas de lucro ou ganhos financeiros
- **Proteção de dados**: Conformidade com LGPD e boas práticas de privacidade

## 🚀 Implantação no GitHub e Vercel

### Implantação no GitHub

1. **Crie um novo repositório no GitHub**:
   - Acesse [GitHub](https://github.com/) e faça login
   - Clique em "New repository"
   - Nomeie o repositório como "betvida"
   - Escolha a visibilidade (público ou privado)
   - Clique em "Create repository"

2. **Inicialize o Git localmente e faça o primeiro commit**:
   ```
   git init
   git add .
   git commit -m "Primeiro commit - Projeto BetVida"
   ```

3. **Conecte ao repositório remoto e envie o código**:
   ```
   git remote add origin https://github.com/seu-usuario/betvida.git
   git branch -M main
   git push -u origin main
   ```

### Implantação no Vercel

1. **Crie uma conta na Vercel**:
   - Acesse [Vercel](https://vercel.com/) e registre-se (recomendado usar a conta do GitHub)

2. **Importe o projeto**:
   - No dashboard da Vercel, clique em "Add New..."
   - Selecione "Project"
   - Escolha o repositório "betvida" da lista de repositórios
   - A Vercel detectará automaticamente que é um projeto React

3. **Configure o projeto**:
   - **Framework Preset**: React
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**: Adicione as variáveis de ambiente do Firebase (se necessário)

4. **Deploy**:
   - Clique em "Deploy"
   - A Vercel construirá e implantará automaticamente seu projeto
   - Após a conclusão, você receberá um URL para acessar o site

5. **Configuração de Domínio Personalizado** (opcional):
   - No painel do projeto, vá para "Settings" > "Domains"
   - Adicione seu domínio personalizado e siga as instruções

6. **Implantação Contínua**:
   - A Vercel configurará automaticamente a implantação contínua
   - Cada push para a branch principal acionará uma nova implantação

### Testes Pós-Implantação

1. **Teste em Diferentes Dispositivos**:
   - Desktop (Windows, Mac, Linux)
   - Mobile (iOS, Android)
   - Tablets

2. **Teste em Diferentes Navegadores**:
   - Chrome, Firefox, Safari, Edge

3. **Verifique Funcionalidades Críticas**:
   - Login/Autenticação
   - Sistema de apostas
   - Reprodução de vídeos
   - Animações e transições

## 🥇 Próximos Passos

- Implementar mais jogos
- Adicionar sistema de skins para personalização
- Desenvolver clube VIP com benefícios exclusivos
- Integrar sistema de vídeos patrocinados
- Implementar testes automatizados

## 👨‍💻 Desenvolvido por

[Seu Nome] - [Seu Contato]

---

**BetVida** - Aposte minutos da sua vida, não dinheiro!
