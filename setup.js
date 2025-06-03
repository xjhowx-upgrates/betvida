const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}=== Configuração do BetVida ====${colors.reset}`);

// Verificar se o package.json existe
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log(`${colors.red}Erro: package.json não encontrado!${colors.reset}`);
  process.exit(1);
}

// Verificar e criar pasta public se não existir
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log(`${colors.yellow}Criando pasta public...${colors.reset}`);
  fs.mkdirSync(publicDir);
}

// Verificar e criar pasta src se não existir
const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  console.log(`${colors.yellow}Criando pasta src...${colors.reset}`);
  fs.mkdirSync(srcDir);
}

// Verificar e criar arquivo de configuração do Tailwind se não existir
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
if (!fs.existsSync(tailwindConfigPath)) {
  console.log(`${colors.yellow}Criando configuração do Tailwind...${colors.reset}`);
  const tailwindConfig = `module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
}

// Verificar e criar arquivo de configuração do PostCSS se não existir
const postcssConfigPath = path.join(__dirname, 'postcss.config.js');
if (!fs.existsSync(postcssConfigPath)) {
  console.log(`${colors.yellow}Criando configuração do PostCSS...${colors.reset}`);
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  fs.writeFileSync(postcssConfigPath, postcssConfig);
}

// Instalar dependências
console.log(`${colors.yellow}Instalando dependências...${colors.reset}`);
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log(`${colors.green}Dependências instaladas com sucesso!${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}Erro ao instalar dependências: ${error.message}${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}Configuração concluída com sucesso!${colors.reset}`);
console.log(`${colors.blue}Para iniciar o BetVida, execute:${colors.reset}`);
console.log(`${colors.yellow}npm start${colors.reset}`);
