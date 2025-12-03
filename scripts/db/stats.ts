#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB STATS - Estatísticas e Relatório
 * ============================================
 * Gera estatísticas detalhadas das ordens de serviço
 * 
 * Uso: npm run db:stats
 */

import {
  createSupabaseClient,
  colors,
  icons,
  printHeader,
  printSection,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  createLine,
  formatDate,
  formatCurrency,
  createProgressBar,
  STATUS_LABELS,
  PRIORITY_LABELS,
  SERVICE_TYPES,
  ServiceRequest,
} from './config';

interface Statistics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byServiceType: Record<string, number>;
  byMonth: Record<string, number>;
  avgResponseTime: number;
  completionRate: number;
  pendingCount: number;
  urgentCount: number;
  totalEstimatedValue: number;
  recentActivity: ServiceRequest[];
}

async function generateStatistics(): Promise<void> {
  printHeader('ESTATÍSTICAS E RELATÓRIO', icons.chart);
  
  const supabase = createSupabaseClient();
  
  try {
    // Buscar todos os dados
    const { data, error, count } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (error) {
      logError(`Erro ao buscar dados: ${error.message}`);
      return;
    }
    
    if (!data || data.length === 0) {
      logWarning('Nenhum dado disponível para estatísticas');
      printEmptyStats();
      return;
    }
    
    const stats = calculateStatistics(data);
    printStatistics(stats);
    
  } catch (err) {
    logError(`Erro inesperado: ${err instanceof Error ? err.message : 'Desconhecido'}`);
  }
}

function calculateStatistics(data: ServiceRequest[]): Statistics {
  const stats: Statistics = {
    total: data.length,
    byStatus: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
    byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
    byServiceType: {},
    byMonth: {},
    avgResponseTime: 0,
    completionRate: 0,
    pendingCount: 0,
    urgentCount: 0,
    totalEstimatedValue: 0,
    recentActivity: data.slice(0, 5),
  };
  
  let totalResponseTime = 0;
  let responseTimeCount = 0;
  
  data.forEach(request => {
    // Por Status
    if (stats.byStatus[request.status] !== undefined) {
      stats.byStatus[request.status]++;
    }
    
    // Por Prioridade
    if (stats.byPriority[request.priority] !== undefined) {
      stats.byPriority[request.priority]++;
    }
    
    // Por Tipo de Serviço
    if (!stats.byServiceType[request.service_type]) {
      stats.byServiceType[request.service_type] = 0;
    }
    stats.byServiceType[request.service_type]++;
    
    // Por Mês
    const month = new Date(request.created_at).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    });
    if (!stats.byMonth[month]) {
      stats.byMonth[month] = 0;
    }
    stats.byMonth[month]++;
    
    // Tempo de resposta (para concluídos)
    if (request.completed_at && request.status === 'completed') {
      const created = new Date(request.created_at).getTime();
      const completed = new Date(request.completed_at).getTime();
      totalResponseTime += (completed - created);
      responseTimeCount++;
    }
    
    // Valor estimado
    if (request.estimated_value) {
      stats.totalEstimatedValue += request.estimated_value;
    }
    
    // Contadores específicos
    if (request.status === 'pending') stats.pendingCount++;
    if (request.priority === 'urgent') stats.urgentCount++;
  });
  
  // Calcular médias
  if (responseTimeCount > 0) {
    stats.avgResponseTime = totalResponseTime / responseTimeCount;
  }
  
  stats.completionRate = stats.total > 0 
    ? (stats.byStatus.completed / stats.total) * 100 
    : 0;
  
  return stats;
}

function printStatistics(stats: Statistics): void {
  // Visão Geral
  printSection('Visão Geral', '📊');
  
  console.log(`  ${colors.bright}Total de Ordens:${colors.reset} ${stats.total}`);
  console.log(`  ${colors.bright}Taxa de Conclusão:${colors.reset} ${colors.green}${stats.completionRate.toFixed(1)}%${colors.reset}`);
  console.log(`  ${colors.bright}Pendentes:${colors.reset} ${colors.yellow}${stats.pendingCount}${colors.reset}`);
  console.log(`  ${colors.bright}Urgentes:${colors.reset} ${colors.red}${stats.urgentCount}${colors.reset}`);
  
  if (stats.totalEstimatedValue > 0) {
    console.log(`  ${colors.bright}Valor Total Estimado:${colors.reset} ${colors.green}${formatCurrency(stats.totalEstimatedValue)}${colors.reset}`);
  }
  
  if (stats.avgResponseTime > 0) {
    const days = Math.floor(stats.avgResponseTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((stats.avgResponseTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    console.log(`  ${colors.bright}Tempo Médio de Conclusão:${colors.reset} ${days}d ${hours}h`);
  }
  
  // Por Status
  printSection('Distribuição por Status', '📈');
  printStatusChart(stats.byStatus, stats.total);
  
  // Por Prioridade
  printSection('Distribuição por Prioridade', '🎯');
  printPriorityChart(stats.byPriority, stats.total);
  
  // Por Tipo de Serviço
  printSection('Distribuição por Tipo de Serviço', '🔧');
  printServiceTypeChart(stats.byServiceType, stats.total);
  
  // Por Mês
  if (Object.keys(stats.byMonth).length > 1) {
    printSection('Tendência Mensal', '📅');
    printMonthlyChart(stats.byMonth);
  }
  
  // Atividade Recente
  if (stats.recentActivity.length > 0) {
    printSection('Atividade Recente', '🕐');
    printRecentActivity(stats.recentActivity);
  }
  
  // Alertas
  printAlerts(stats);
  
  console.log(`\n${colors.dim}${createLine('─', 60)}${colors.reset}`);
  console.log(`${colors.dim}Relatório gerado em ${formatDate(new Date())}${colors.reset}\n`);
}

function printStatusChart(byStatus: Record<string, number>, total: number): void {
  const maxBarWidth = 30;
  
  Object.entries(byStatus).forEach(([status, count]) => {
    const info = STATUS_LABELS[status];
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const barWidth = Math.round((count / Math.max(...Object.values(byStatus), 1)) * maxBarWidth);
    const bar = '█'.repeat(barWidth) + '░'.repeat(maxBarWidth - barWidth);
    
    console.log(`  ${info.icon} ${info.label.padEnd(15)} ${info.color}${bar}${colors.reset} ${count} (${percentage.toFixed(1)}%)`);
  });
}

function printPriorityChart(byPriority: Record<string, number>, total: number): void {
  const maxBarWidth = 30;
  
  Object.entries(byPriority).forEach(([priority, count]) => {
    const info = PRIORITY_LABELS[priority];
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const barWidth = Math.round((count / Math.max(...Object.values(byPriority), 1)) * maxBarWidth);
    const bar = '█'.repeat(barWidth) + '░'.repeat(maxBarWidth - barWidth);
    
    console.log(`  ${info.icon} ${info.label.padEnd(10)} ${info.color}${bar}${colors.reset} ${count} (${percentage.toFixed(1)}%)`);
  });
}

function printServiceTypeChart(byServiceType: Record<string, number>, total: number): void {
  const maxBarWidth = 25;
  const sorted = Object.entries(byServiceType).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(byServiceType), 1);
  
  sorted.forEach(([type, count]) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const barWidth = Math.round((count / maxCount) * maxBarWidth);
    const bar = '█'.repeat(barWidth) + '░'.repeat(maxBarWidth - barWidth);
    
    // Truncar nome se muito longo
    const displayName = type.length > 25 ? type.slice(0, 22) + '...' : type;
    
    console.log(`  ${colors.yellow}${displayName.padEnd(28)}${colors.reset} ${colors.cyan}${bar}${colors.reset} ${count} (${percentage.toFixed(1)}%)`);
  });
}

function printMonthlyChart(byMonth: Record<string, number>): void {
  const maxBarWidth = 30;
  const entries = Object.entries(byMonth).slice(-6); // Últimos 6 meses
  const maxCount = Math.max(...entries.map(e => e[1]), 1);
  
  entries.forEach(([month, count]) => {
    const barWidth = Math.round((count / maxCount) * maxBarWidth);
    const bar = '█'.repeat(barWidth);
    
    console.log(`  ${colors.dim}${month.padEnd(12)}${colors.reset} ${colors.green}${bar}${colors.reset} ${count}`);
  });
}

function printRecentActivity(activity: ServiceRequest[]): void {
  activity.forEach(request => {
    const statusInfo = STATUS_LABELS[request.status];
    const timeAgo = getTimeAgo(new Date(request.created_at));
    
    console.log(`  ${statusInfo.icon} ${colors.bright}${request.first_name} ${request.last_name}${colors.reset}`);
    console.log(`     ${colors.dim}${request.service_type} - ${timeAgo}${colors.reset}`);
  });
}

function printAlerts(stats: Statistics): void {
  const alerts: string[] = [];
  
  if (stats.pendingCount > 10) {
    alerts.push(`${icons.warning} ${stats.pendingCount} ordens pendentes aguardando`);
  }
  
  if (stats.urgentCount > 0) {
    alerts.push(`${icons.error} ${stats.urgentCount} ordens urgentes precisam de atenção`);
  }
  
  if (stats.completionRate < 50 && stats.total > 5) {
    alerts.push(`${icons.warning} Taxa de conclusão abaixo de 50%`);
  }
  
  if (alerts.length > 0) {
    printSection('Alertas', '🚨');
    alerts.forEach(alert => {
      console.log(`  ${colors.yellow}${alert}${colors.reset}`);
    });
  }
}

function printEmptyStats(): void {
  console.log(`\n${colors.dim}${createLine('─', 40)}${colors.reset}`);
  console.log(`${colors.dim}📭 Nenhum dado disponível para análise${colors.reset}`);
  console.log(`${colors.dim}${createLine('─', 40)}${colors.reset}`);
  console.log(`\n${colors.dim}Adicione algumas ordens de serviço para ver estatísticas.${colors.reset}\n`);
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) return `${minutes} min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  
  return formatDate(date);
}

// Executar
generateStatistics().catch(console.error);
