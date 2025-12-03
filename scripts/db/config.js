/**
 * ============================================================
 * CYBERCLASS - Configuração do Banco de Dados
 * ============================================================
 * Configurações centralizadas para todos os scripts de DB
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// ============================================================
// CORES E FORMATAÇÃO PARA CONSOLE
// ============================================================

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// ============================================================
// SÍMBOLOS E ÍCONES
// ============================================================

export const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  check: '✓',
  cross: '✗',
  arrow: '➜',
  bullet: '•',
  star: '★',
  database: '🗄️',
  backup: '💾',
  restore: '♻️',
  monitor: '📊',
  cleanup: '🧹',
  health: '💚',
  rocket: '🚀',
  clock: '🕐',
  calendar: '📅',
  user: '👤',
  email: '📧',
  phone: '📱',
  service: '🔧',
  stats: '📈',
  list: '📋',
  live: '🔴',
  menu: '📌',
};

// ============================================================
// CONFIGURAÇÕES DO SUPABASE
// ============================================================

const SUPABASE_URL = 'https://avdfdxeywszdzrsifivq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGZkeGV5d3N6ZHpyc2lmaXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODcxNzYsImV4cCI6MjA3MzU2MzE3Nn0.dTCQGCsNpIrlD0yEzd6_X5C5kwUhcR_EOEdpfnH4QB4';

// Service Role Key (para operações administrativas)
// IMPORTANTE: Esta key deve estar em variável de ambiente em produção
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const config = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Diretórios
  paths: {
    backups: join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'backups'),
    logs: join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'logs'),
  },
  
  // Configurações de backup
  backup: {
    maxBackups: 10,          // Máximo de backups a manter
    compressBackups: true,   // Comprimir backups
    autoCleanup: true,       // Limpar backups antigos automaticamente
  },
  
  // Configurações de monitoramento
  monitor: {
    refreshInterval: 5000,   // Intervalo de atualização em ms
    alertThresholds: {
      pendingRequests: 50,   // Alerta se mais de 50 pendentes
      urgentRequests: 10,    // Alerta se mais de 10 urgentes
    },
  },
  
  // Tipos de serviço válidos
  serviceTypes: [
    'Aulas de Inteligência Artificial',
    'Mentoria de IA Personalizada',
    'Suporte e Assistência Técnica',
    'Consultoria e Treinamentos',
    'Cibersegurança',
    'Desenvolvimento de Sistemas',
    'Manutenção e Auxílio Tecnológico',
  ],
  
  // Status válidos
  statusTypes: ['pending', 'in_progress', 'completed', 'cancelled'],
  
  // Prioridades válidas
  priorityTypes: ['low', 'medium', 'high', 'urgent'],
};

// ============================================================
// CRIAR CLIENTE SUPABASE
// ============================================================

/**
 * Cria cliente Supabase com anon key (para operações básicas)
 */
export function createAnonClient() {
  return createClient(config.supabase.url, config.supabase.anonKey);
}

/**
 * Cria cliente Supabase com service role key (para operações admin)
 */
export function createAdminClient() {
  if (!config.supabase.serviceRoleKey) {
    console.error(`${colors.red}${icons.error} SUPABASE_SERVICE_ROLE_KEY não configurada!${colors.reset}`);
    console.log(`${colors.yellow}Configure a variável de ambiente:${colors.reset}`);
    console.log(`  Windows: set SUPABASE_SERVICE_ROLE_KEY=sua_key_aqui`);
    console.log(`  PowerShell: $env:SUPABASE_SERVICE_ROLE_KEY="sua_key_aqui"`);
    console.log(`  Linux/Mac: export SUPABASE_SERVICE_ROLE_KEY=sua_key_aqui`);
    process.exit(1);
  }
  
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================================
// UTILITÁRIOS
// ============================================================

/**
 * Garante que os diretórios necessários existem
 */
export function ensureDirectories() {
  const dirs = [config.paths.backups, config.paths.logs];
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`${icons.success} Diretório criado: ${dir}`);
    }
  });
}

/**
 * Formata data para exibição
 */
export function formatDate(date, locale = 'pt-BR') {
  return new Date(date).toLocaleString(locale, {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

/**
 * Formata data para nome de arquivo
 */
export function formatDateForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Formata bytes para exibição legível
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formata duração em ms para exibição legível
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

/**
 * Limpa o console
 */
export function clearConsole() {
  process.stdout.write('\x1Bc');
}

/**
 * Espera por um tempo determinado
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exibe cabeçalho bonito
 */
export function printHeader(title, icon = icons.database) {
  const line = '═'.repeat(60);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}  ${icon} ${title}${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

/**
 * Exibe separador
 */
export function printSeparator(char = '─', length = 50) {
  console.log(`${colors.dim}${char.repeat(length)}${colors.reset}`);
}

/**
 * Exibe mensagem de sucesso
 */
export function printSuccess(message) {
  console.log(`${colors.green}${icons.success} ${message}${colors.reset}`);
}

/**
 * Exibe mensagem de erro
 */
export function printError(message) {
  console.log(`${colors.red}${icons.error} ${message}${colors.reset}`);
}

/**
 * Exibe mensagem de aviso
 */
export function printWarning(message) {
  console.log(`${colors.yellow}${icons.warning} ${message}${colors.reset}`);
}

/**
 * Exibe mensagem de informação
 */
export function printInfo(message) {
  console.log(`${colors.blue}${icons.info} ${message}${colors.reset}`);
}

/**
 * Exibe loading
 */
export function printLoading(message) {
  console.log(`${colors.cyan}${icons.loading} ${message}${colors.reset}`);
}

/**
 * Formata status com cores
 */
export function formatStatus(status) {
  const statusColors = {
    pending: `${colors.yellow}⏳ Pendente${colors.reset}`,
    in_progress: `${colors.blue}🔄 Em Andamento${colors.reset}`,
    completed: `${colors.green}✅ Concluído${colors.reset}`,
    cancelled: `${colors.red}❌ Cancelado${colors.reset}`,
  };
  return statusColors[status] || status;
}

/**
 * Formata prioridade com cores
 */
export function formatPriority(priority) {
  const priorityColors = {
    low: `${colors.dim}🔵 Baixa${colors.reset}`,
    medium: `${colors.white}🟢 Média${colors.reset}`,
    high: `${colors.yellow}🟡 Alta${colors.reset}`,
    urgent: `${colors.red}🔴 Urgente${colors.reset}`,
  };
  return priorityColors[priority] || priority;
}

/**
 * Cria tabela formatada para console
 */
export function createTable(headers, rows, options = {}) {
  const { 
    padding = 2,
    headerColor = colors.cyan,
    borderColor = colors.dim,
  } = options;
  
  // Calcular largura de cada coluna
  const colWidths = headers.map((header, i) => {
    const maxDataWidth = Math.max(...rows.map(row => 
      String(row[i] || '').replace(/\x1b\[[0-9;]*m/g, '').length
    ));
    return Math.max(header.length, maxDataWidth) + padding;
  });
  
  // Criar linha de separação
  const separator = `${borderColor}├${'─'.repeat(colWidths.reduce((a, b) => a + b + 3, -1))}┤${colors.reset}`;
  const topBorder = `${borderColor}┌${'─'.repeat(colWidths.reduce((a, b) => a + b + 3, -1))}┐${colors.reset}`;
  const bottomBorder = `${borderColor}└${'─'.repeat(colWidths.reduce((a, b) => a + b + 3, -1))}┘${colors.reset}`;
  
  // Imprimir tabela
  console.log(topBorder);
  
  // Header
  let headerRow = `${borderColor}│${colors.reset}`;
  headers.forEach((header, i) => {
    const padded = header.padEnd(colWidths[i]);
    headerRow += ` ${headerColor}${colors.bright}${padded}${colors.reset}${borderColor}│${colors.reset}`;
  });
  console.log(headerRow);
  console.log(separator);
  
  // Rows
  rows.forEach(row => {
    let dataRow = `${borderColor}│${colors.reset}`;
    row.forEach((cell, i) => {
      const cellStr = String(cell || '');
      const visibleLength = cellStr.replace(/\x1b\[[0-9;]*m/g, '').length;
      const paddingNeeded = colWidths[i] - visibleLength;
      dataRow += ` ${cellStr}${' '.repeat(paddingNeeded)}${borderColor}│${colors.reset}`;
    });
    console.log(dataRow);
  });
  
  console.log(bottomBorder);
}

/**
 * Exibe barra de progresso
 */
export function printProgress(current, total, label = 'Progresso') {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round((current / total) * barLength);
  const empty = barLength - filled;
  
  const bar = `${colors.green}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
  
  process.stdout.write(`\r${label}: ${bar} ${percentage}% (${current}/${total})`);
  
  if (current === total) {
    console.log('');
  }
}

export default config;
