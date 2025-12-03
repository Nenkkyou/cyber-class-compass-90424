/**
 * ============================================
 * CONFIGURAÇÃO DO BANCO DE DADOS - CYBERCLASS
 * ============================================
 * Configurações centralizadas para os scripts de gerenciamento
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Cores para console
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

// Ícones Unicode
export const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  pending: '⏳',
  working: '🔄',
  database: '🗄️',
  chart: '📊',
  list: '📋',
  backup: '💾',
  restore: '🔄',
  monitor: '📡',
  cleanup: '🧹',
  health: '🏥',
  rocket: '🚀',
  fire: '🔥',
  star: '⭐',
  check: '✓',
  cross: '✗',
  arrow: '➜',
  dot: '•',
  line: '─',
  corner: '└',
  tee: '├',
  pipe: '│',
};

// Configuração do Supabase
export const SUPABASE_URL = 'https://avdfdxeywszdzrsifivq.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGZkeGV5d3N6ZHpyc2lmaXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODcxNzYsImV4cCI6MjA3MzU2MzE3Nn0.dTCQGCsNpIrlD0yEzd6_X5C5kwUhcR_EOEdpfnH4QB4';

// Service Role Key (do .env)
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Tipos de serviço disponíveis
export const SERVICE_TYPES = [
  'Aulas de Inteligência Artificial',
  'Mentoria de IA Personalizada',
  'Suporte e Assistência Técnica',
  'Consultoria e Treinamentos',
  'Cibersegurança',
  'Desenvolvimento de Sistemas',
  'Manutenção e Auxílio Tecnológico',
] as const;

// Status de ordens de serviço
export const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendente', color: colors.yellow, icon: '⏳' },
  in_progress: { label: 'Em Andamento', color: colors.blue, icon: '🔄' },
  completed: { label: 'Concluído', color: colors.green, icon: '✅' },
  cancelled: { label: 'Cancelado', color: colors.red, icon: '❌' },
};

// Prioridades
export const PRIORITY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  low: { label: 'Baixa', color: colors.dim, icon: '🔵' },
  normal: { label: 'Normal', color: colors.white, icon: '🟢' },
  high: { label: 'Alta', color: colors.yellow, icon: '🟡' },
  urgent: { label: 'Urgente', color: colors.red, icon: '🔴' },
};

// Interface para Service Request
export interface ServiceRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  service_type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string | null;
  assigned_to: string | null;
  estimated_value: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// Criar cliente Supabase
export function createSupabaseClient(useServiceRole = false): SupabaseClient {
  const key = useServiceRole && SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;
  return createClient(SUPABASE_URL, key);
}

// Funções utilitárias de formatação
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// Função para criar linha de separação
export function createLine(char = '─', length = 60): string {
  return char.repeat(length);
}

// Função para criar cabeçalho
export function printHeader(title: string, icon = icons.database): void {
  const line = createLine('═', 60);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset} ${icon} ${colors.bright}${colors.white}${title}${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

// Função para criar subseção
export function printSection(title: string, icon = icons.arrow): void {
  console.log(`\n${colors.yellow}${icon} ${colors.bright}${title}${colors.reset}`);
  console.log(`${colors.dim}${createLine('─', 40)}${colors.reset}`);
}

// Função para log de sucesso
export function logSuccess(message: string): void {
  console.log(`${colors.green}${icons.success} ${message}${colors.reset}`);
}

// Função para log de erro
export function logError(message: string): void {
  console.log(`${colors.red}${icons.error} ${message}${colors.reset}`);
}

// Função para log de aviso
export function logWarning(message: string): void {
  console.log(`${colors.yellow}${icons.warning} ${message}${colors.reset}`);
}

// Função para log de info
export function logInfo(message: string): void {
  console.log(`${colors.blue}${icons.info} ${message}${colors.reset}`);
}

// Função para criar tabela formatada
export function printTable(headers: string[], rows: string[][], columnWidths?: number[]): void {
  const widths = columnWidths || headers.map((h, i) => 
    Math.max(h.length, ...rows.map(r => (r[i] || '').toString().length)) + 2
  );
  
  const separator = widths.map(w => '─'.repeat(w)).join('┼');
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('│');
  
  console.log(`${colors.dim}┌${separator.replace(/┼/g, '┬')}┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset}${colors.bright}${headerRow}${colors.reset}${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}├${separator}┤${colors.reset}`);
  
  rows.forEach(row => {
    const formattedRow = row.map((cell, i) => (cell || '').toString().padEnd(widths[i])).join('│');
    console.log(`${colors.dim}│${colors.reset}${formattedRow}${colors.dim}│${colors.reset}`);
  });
  
  console.log(`${colors.dim}└${separator.replace(/┼/g, '┴')}┘${colors.reset}`);
}

// Função para criar barra de progresso
export function createProgressBar(current: number, total: number, width = 30): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
  return `[${bar}] ${percentage}%`;
}

// Função para limpar console
export function clearConsole(): void {
  process.stdout.write('\x1Bc');
}

// Função para aguardar input
export async function waitForEnter(message = 'Pressione ENTER para continuar...'): Promise<void> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`\n${colors.dim}${message}${colors.reset}`, () => {
      rl.close();
      resolve();
    });
  });
}

// Exportar tudo
export default {
  colors,
  icons,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY,
  SERVICE_TYPES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  createSupabaseClient,
  formatDate,
  formatCurrency,
  formatPhone,
  createLine,
  printHeader,
  printSection,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  printTable,
  createProgressBar,
  clearConsole,
  waitForEnter,
};
