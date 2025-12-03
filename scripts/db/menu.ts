#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB MENU - Menu Interativo
 * ============================================
 * Menu principal para gerenciamento do banco de dados
 * 
 * Uso: npm run db
 */

import {
  colors,
  icons,
  clearConsole,
} from './config';
import * as readline from 'readline';
import { spawn } from 'child_process';

interface MenuItem {
  key: string;
  label: string;
  description: string;
  script: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: '1',
    label: 'Health Check',
    description: 'Verificar saúde do sistema',
    script: 'db:health',
    icon: '🏥',
  },
  {
    key: '2',
    label: 'Listar Registros',
    description: 'Ver ordens de serviço',
    script: 'db:list',
    icon: '📋',
  },
  {
    key: '3',
    label: 'Estatísticas',
    description: 'Relatórios e métricas',
    script: 'db:stats',
    icon: '📊',
  },
  {
    key: '4',
    label: 'Backup',
    description: 'Exportar dados',
    script: 'db:backup',
    icon: '💾',
  },
  {
    key: '5',
    label: 'Restaurar',
    description: 'Importar backup',
    script: 'db:restore',
    icon: '📥',
  },
  {
    key: '6',
    label: 'Monitor',
    description: 'Monitoramento em tempo real',
    script: 'db:monitor',
    icon: '📡',
  },
  {
    key: '7',
    label: 'Cleanup',
    description: 'Limpeza de dados',
    script: 'db:cleanup',
    icon: '🧹',
  },
  {
    key: '8',
    label: 'Live Dashboard',
    description: 'Painel em tempo real',
    script: 'db:live',
    icon: '🚀',
  },
];

class DatabaseMenu {
  private rl: readline.Interface;
  
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  
  async start(): Promise<void> {
    while (true) {
      clearConsole();
      this.renderHeader();
      this.renderMenu();
      
      const choice = await this.prompt('\n  Digite sua opção: ');
      
      if (choice.toLowerCase() === 'q' || choice.toLowerCase() === '0') {
        this.exit();
        return;
      }
      
      const menuItem = MENU_ITEMS.find(item => item.key === choice);
      
      if (menuItem) {
        await this.runScript(menuItem);
      } else {
        console.log(`\n  ${colors.red}${icons.error} Opção inválida!${colors.reset}`);
        await this.sleep(1500);
      }
    }
  }
  
  renderHeader(): void {
    const width = 60;
    
    console.log('');
    console.log(`${colors.cyan}  ╔${'═'.repeat(width - 4)}╗${colors.reset}`);
    console.log(`${colors.cyan}  ║${colors.reset}${' '.repeat(Math.floor((width - 42) / 2))}${icons.database} ${colors.bright}${colors.yellow}CYBERCLASS DATABASE MANAGER${colors.reset}${' '.repeat(Math.ceil((width - 42) / 2))}${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}  ║${colors.reset}${' '.repeat(Math.floor((width - 30) / 2))}${colors.dim}Sistema de Gerenciamento de DB${colors.reset}${' '.repeat(Math.ceil((width - 30) / 2))}${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}  ╚${'═'.repeat(width - 4)}╝${colors.reset}`);
  }
  
  renderMenu(): void {
    console.log(`\n  ${colors.yellow}━━━━━━━━━━ OPÇÕES DISPONÍVEIS ━━━━━━━━━━${colors.reset}\n`);
    
    // Primeira seção - Visualização
    console.log(`  ${colors.bright}📁 VISUALIZAÇÃO${colors.reset}`);
    console.log(`  ${colors.dim}${'─'.repeat(50)}${colors.reset}`);
    this.renderMenuItem(MENU_ITEMS[0]); // Health Check
    this.renderMenuItem(MENU_ITEMS[1]); // Listar
    this.renderMenuItem(MENU_ITEMS[2]); // Estatísticas
    
    // Segunda seção - Dados
    console.log(`\n  ${colors.bright}💿 GERENCIAMENTO DE DADOS${colors.reset}`);
    console.log(`  ${colors.dim}${'─'.repeat(50)}${colors.reset}`);
    this.renderMenuItem(MENU_ITEMS[3]); // Backup
    this.renderMenuItem(MENU_ITEMS[4]); // Restaurar
    this.renderMenuItem(MENU_ITEMS[6]); // Cleanup
    
    // Terceira seção - Monitoramento
    console.log(`\n  ${colors.bright}📡 MONITORAMENTO${colors.reset}`);
    console.log(`  ${colors.dim}${'─'.repeat(50)}${colors.reset}`);
    this.renderMenuItem(MENU_ITEMS[5]); // Monitor
    this.renderMenuItem(MENU_ITEMS[7]); // Live
    
    // Opção de sair
    console.log(`\n  ${colors.dim}${'─'.repeat(50)}${colors.reset}`);
    console.log(`  ${colors.red}[0]${colors.reset} ${colors.dim}ou${colors.reset} ${colors.red}[Q]${colors.reset}  ❌  Sair`);
  }
  
  renderMenuItem(item: MenuItem): void {
    console.log(`  ${colors.cyan}[${item.key}]${colors.reset}  ${item.icon}  ${item.label.padEnd(18)} ${colors.dim}${item.description}${colors.reset}`);
  }
  
  async runScript(item: MenuItem): Promise<void> {
    clearConsole();
    console.log(`\n  ${colors.yellow}${icons.rocket} Executando: ${item.label}...${colors.reset}\n`);
    console.log(`  ${colors.dim}Comando: npm run ${item.script}${colors.reset}`);
    console.log(`  ${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
    
    return new Promise((resolve) => {
      const child = spawn('npm', ['run', item.script], {
        stdio: 'inherit',
        shell: true,
      });
      
      child.on('close', async (code) => {
        console.log(`\n  ${colors.dim}${'─'.repeat(60)}${colors.reset}`);
        
        if (code === 0) {
          console.log(`  ${colors.green}${icons.check} Script finalizado com sucesso!${colors.reset}`);
        } else {
          console.log(`  ${colors.red}${icons.error} Script finalizou com código: ${code}${colors.reset}`);
        }
        
        await this.promptToContinue();
        resolve();
      });
      
      child.on('error', async (error) => {
        console.log(`\n  ${colors.red}${icons.error} Erro ao executar script: ${error.message}${colors.reset}`);
        await this.promptToContinue();
        resolve();
      });
    });
  }
  
  prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(`${colors.bright}${question}${colors.reset}`, resolve);
    });
  }
  
  async promptToContinue(): Promise<void> {
    await this.prompt('\n  Pressione Enter para continuar...');
  }
  
  exit(): void {
    clearConsole();
    console.log(`
${colors.cyan}
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║    ${colors.yellow}${icons.rocket} Obrigado por usar o CyberClass DB Manager!${colors.cyan}   ║
    ║                                                       ║
    ║         ${colors.dim}Desenvolvido com ${colors.red}❤${colors.dim}  para CyberClass${colors.cyan}         ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
${colors.reset}
    `);
    this.rl.close();
    process.exit(0);
  }
  
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar
async function main(): Promise<void> {
  const menu = new DatabaseMenu();
  await menu.start();
}

main().catch(console.error);
