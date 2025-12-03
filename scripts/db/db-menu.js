#!/usr/bin/env node
/**
 * ============================================================
 * CYBERCLASS - Menu Interativo de Gerenciamento do Banco
 * ============================================================
 * Comando: npm run db
 * 
 * Menu principal para acesso a todas as funcionalidades
 * de gerenciamento do banco de dados Supabase
 */

import readline from 'readline';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  colors,
  icons,
  printHeader,
  printSeparator,
  clearConsole,
  sleep,
} from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// DEFINIÇÃO DO MENU
// ============================================================

const menuOptions = [
  {
    key: '1',
    label: 'Health Check',
    description: 'Verificação completa de saúde do sistema',
    script: 'db-health.js',
    icon: icons.health,
    color: colors.green,
  },
  {
    key: '2',
    label: 'Listar Solicitações',
    description: 'Listar todas as reservas/ordens de serviço',
    script: 'db-list.js',
    icon: icons.list,
    color: colors.blue,
  },
  {
    key: '3',
    label: 'Estatísticas',
    description: 'Visualizar estatísticas e relatórios',
    script: 'db-stats.js',
    icon: icons.stats,
    color: colors.cyan,
  },
  {
    key: '4',
    label: 'Fazer Backup',
    description: 'Criar backup do banco de dados',
    script: 'db-backup.js',
    icon: icons.backup,
    color: colors.yellow,
  },
  {
    key: '5',
    label: 'Restaurar Backup',
    description: 'Restaurar dados de um backup',
    script: 'db-restore.js',
    icon: icons.restore,
    color: colors.magenta,
  },
  {
    key: '6',
    label: 'Monitor em Tempo Real',
    description: 'Monitorar atividades em tempo real',
    script: 'db-monitor.js',
    icon: icons.monitor,
    color: colors.white,
  },
  {
    key: '7',
    label: 'Limpeza de Dados',
    description: 'Limpar dados problemáticos ou antigos',
    script: 'db-cleanup.js',
    icon: icons.cleanup,
    color: colors.red,
  },
  {
    key: '8',
    label: 'Visualização Live',
    description: 'Visualizar tudo em tempo real',
    script: 'db-live.js',
    icon: icons.live,
    color: colors.red,
  },
  {
    key: '0',
    label: 'Sair',
    description: 'Encerrar o programa',
    script: null,
    icon: '👋',
    color: colors.dim,
  },
];

// ============================================================
// INTERFACE DE LINHA DE COMANDO
// ============================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

// ============================================================
// FUNÇÕES DE EXIBIÇÃO
// ============================================================

function showBanner() {
  console.log(`
${colors.yellow}${colors.bright}
   ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗██╗      █████╗ ███████╗███████╗
  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██║     ██╔══██╗██╔════╝██╔════╝
  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║     ██║     ███████║███████╗███████╗
  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║     ██║     ██╔══██║╚════██║╚════██║
  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╗███████╗██║  ██║███████║███████║
   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
${colors.reset}
${colors.cyan}                    ${icons.database} Gerenciador de Banco de Dados ${icons.database}${colors.reset}
${colors.dim}                              Versão 1.0.0${colors.reset}
  `);
}

function showMenu() {
  console.log(`\n${colors.bright}${colors.white}  ╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.white}  ║              ${icons.menu} MENU PRINCIPAL                        ║${colors.reset}`);
  console.log(`${colors.bright}${colors.white}  ╠════════════════════════════════════════════════════════╣${colors.reset}`);
  
  menuOptions.forEach(option => {
    const padding = ' '.repeat(45 - option.label.length - option.description.length);
    console.log(
      `${colors.bright}${colors.white}  ║${colors.reset}  ` +
      `${option.color}[${option.key}]${colors.reset} ` +
      `${option.icon} ${colors.bright}${option.label}${colors.reset} ` +
      `${colors.dim}- ${option.description}${colors.reset}` +
      `${padding}${colors.bright}${colors.white}║${colors.reset}`
    );
  });
  
  console.log(`${colors.bright}${colors.white}  ╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
}

function showFooter() {
  console.log(`${colors.dim}  ─────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`  ${colors.cyan}${icons.info} Dica:${colors.reset} ${colors.dim}Use os números para navegar pelo menu${colors.reset}`);
  console.log(`  ${colors.cyan}${icons.info} Supabase:${colors.reset} ${colors.dim}https://supabase.com/dashboard${colors.reset}`);
  console.log(`${colors.dim}  ─────────────────────────────────────────────────────────${colors.reset}\n`);
}

// ============================================================
// EXECUÇÃO DE SCRIPTS
// ============================================================

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, scriptName);
    
    console.log(`\n${colors.cyan}${icons.loading} Executando: ${scriptName}...${colors.reset}\n`);
    printSeparator('═', 60);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true,
    });
    
    child.on('close', code => {
      printSeparator('═', 60);
      if (code === 0) {
        console.log(`\n${colors.green}${icons.success} Script finalizado com sucesso!${colors.reset}`);
      } else {
        console.log(`\n${colors.yellow}${icons.warning} Script finalizado com código: ${code}${colors.reset}`);
      }
      resolve(code);
    });
    
    child.on('error', err => {
      console.error(`${colors.red}${icons.error} Erro ao executar script: ${err.message}${colors.reset}`);
      reject(err);
    });
  });
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

async function main() {
  clearConsole();
  showBanner();
  
  let running = true;
  
  while (running) {
    showMenu();
    showFooter();
    
    const choice = await question(`  ${colors.yellow}${icons.arrow} Escolha uma opção:${colors.reset} `);
    
    const selectedOption = menuOptions.find(opt => opt.key === choice.trim());
    
    if (!selectedOption) {
      console.log(`\n${colors.red}${icons.error} Opção inválida! Tente novamente.${colors.reset}`);
      await sleep(1500);
      clearConsole();
      showBanner();
      continue;
    }
    
    if (selectedOption.key === '0') {
      console.log(`\n${colors.green}${icons.success} Até logo! ${selectedOption.icon}${colors.reset}\n`);
      running = false;
      break;
    }
    
    if (selectedOption.script) {
      try {
        clearConsole();
        await runScript(selectedOption.script);
        
        console.log(`\n${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
        await question('');
        clearConsole();
        showBanner();
      } catch (error) {
        console.error(`${colors.red}${icons.error} Erro: ${error.message}${colors.reset}`);
        await sleep(2000);
        clearConsole();
        showBanner();
      }
    }
  }
  
  rl.close();
  process.exit(0);
}

// ============================================================
// TRATAMENTO DE SINAIS
// ============================================================

process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}${icons.warning} Interrompido pelo usuário${colors.reset}`);
  rl.close();
  process.exit(0);
});

process.on('uncaughtException', error => {
  console.error(`\n${colors.red}${icons.error} Erro não tratado: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
});

// Iniciar
main();
