#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB LIVE - Visualização em Tempo Real
 * ============================================
 * Dashboard completo com todos os dados em tempo real
 * 
 * Uso: npm run db:live
 *      npm run db:live -- --refresh=5
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
  formatPhone,
  formatCurrency,
  createProgressBar,
  STATUS_LABELS,
  PRIORITY_LABELS,
  ServiceRequest,
  clearConsole,
} from './config';

interface DashboardState {
  data: ServiceRequest[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    urgent: number;
    todayNew: number;
    todayCompleted: number;
    totalValue: number;
  };
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdate: Date;
  refreshCount: number;
}

interface DashboardOptions {
  refresh: number;
}

function parseArgs(): DashboardOptions {
  const args = process.argv.slice(2);
  const options: DashboardOptions = {
    refresh: 5,
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--refresh=')) {
      options.refresh = parseInt(arg.slice(10), 10);
    }
  });
  
  return options;
}

class LiveDashboard {
  private state: DashboardState;
  private options: DashboardOptions;
  private isRunning: boolean = false;
  private startTime: Date;
  
  constructor(options: DashboardOptions) {
    this.options = options;
    this.startTime = new Date();
    this.state = {
      data: [],
      stats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        urgent: 0,
        todayNew: 0,
        todayCompleted: 0,
        totalValue: 0,
      },
      connectionStatus: 'connecting',
      lastUpdate: new Date(),
      refreshCount: 0,
    };
  }
  
  async start(): Promise<void> {
    this.isRunning = true;
    
    process.on('SIGINT', () => this.stop());
    
    console.log(`${colors.dim}Carregando dashboard... (Ctrl+C para sair)${colors.reset}\n`);
    
    while (this.isRunning) {
      await this.refresh();
      this.render();
      await this.sleep(this.options.refresh * 1000);
    }
  }
  
  stop(): void {
    this.isRunning = false;
    console.log(`\n\n${colors.yellow}${icons.warning} Dashboard encerrado${colors.reset}`);
    const uptime = (Date.now() - this.startTime.getTime()) / 1000;
    console.log(`${colors.dim}Tempo de execução: ${this.formatUptime(uptime)}${colors.reset}`);
    console.log(`${colors.dim}Total de atualizações: ${this.state.refreshCount}${colors.reset}\n`);
    process.exit(0);
  }
  
  async refresh(): Promise<void> {
    const supabase = createSupabaseClient();
    
    try {
      this.state.connectionStatus = 'connecting';
      
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        this.state.connectionStatus = 'disconnected';
        return;
      }
      
      this.state.connectionStatus = 'connected';
      this.state.data = data || [];
      this.state.lastUpdate = new Date();
      this.state.refreshCount++;
      
      // Calcular estatísticas
      this.calculateStats();
      
    } catch (err) {
      this.state.connectionStatus = 'disconnected';
    }
  }
  
  calculateStats(): void {
    const today = new Date().toDateString();
    const data = this.state.data;
    
    this.state.stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      inProgress: data.filter(r => r.status === 'in_progress').length,
      completed: data.filter(r => r.status === 'completed').length,
      cancelled: data.filter(r => r.status === 'cancelled').length,
      urgent: data.filter(r => r.priority === 'urgent').length,
      todayNew: data.filter(r => new Date(r.created_at).toDateString() === today).length,
      todayCompleted: data.filter(r => 
        r.status === 'completed' && 
        r.completed_at && 
        new Date(r.completed_at).toDateString() === today
      ).length,
      totalValue: data.reduce((sum, r) => sum + (r.estimated_value || 0), 0),
    };
  }
  
  render(): void {
    clearConsole();
    
    this.renderHeader();
    this.renderConnectionStatus();
    this.renderMainStats();
    this.renderStatusCards();
    this.renderRecentOrders();
    this.renderUrgentAlerts();
    this.renderFooter();
  }
  
  renderHeader(): void {
    const width = 70;
    console.log(`${colors.cyan}╔${'═'.repeat(width - 2)}╗${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}${' '.repeat(Math.floor((width - 38) / 2))}${icons.rocket} ${colors.bright}${colors.yellow}CYBERCLASS - PAINEL EM TEMPO REAL${colors.reset}${' '.repeat(Math.ceil((width - 38) / 2))}${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╚${'═'.repeat(width - 2)}╝${colors.reset}`);
  }
  
  renderConnectionStatus(): void {
    const statusMap = {
      connected: { icon: '🟢', text: 'Conectado', color: colors.green },
      disconnected: { icon: '🔴', text: 'Desconectado', color: colors.red },
      connecting: { icon: '🟡', text: 'Conectando...', color: colors.yellow },
    };
    
    const status = statusMap[this.state.connectionStatus];
    const uptime = (Date.now() - this.startTime.getTime()) / 1000;
    
    console.log(`\n  ${status.icon} ${status.color}${status.text}${colors.reset}`);
    console.log(`  ${colors.dim}Atualizado: ${formatDate(this.state.lastUpdate)} │ Uptime: ${this.formatUptime(uptime)} │ Refresh: ${this.options.refresh}s${colors.reset}`);
  }
  
  renderMainStats(): void {
    const { stats } = this.state;
    
    console.log(`\n${colors.yellow}  ━━━━━━━━━━ VISÃO GERAL ━━━━━━━━━━${colors.reset}\n`);
    
    // Grid de métricas principais
    const col1 = `  ${colors.bright}📊 Total:${colors.reset} ${stats.total}`;
    const col2 = `${colors.bright}📅 Hoje:${colors.reset} +${stats.todayNew}`;
    const col3 = `${colors.bright}💰 Valor:${colors.reset} ${formatCurrency(stats.totalValue)}`;
    
    console.log(`${col1.padEnd(30)}${col2.padEnd(25)}${col3}`);
    
    // Barra de progresso de conclusão
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    console.log(`\n  ${colors.dim}Taxa de Conclusão:${colors.reset} ${createProgressBar(stats.completed, stats.total, 40)} ${completionRate.toFixed(1)}%`);
  }
  
  renderStatusCards(): void {
    const { stats } = this.state;
    
    console.log(`\n${colors.yellow}  ━━━━━━━━━━ STATUS ━━━━━━━━━━${colors.reset}\n`);
    
    const cards = [
      { label: 'Pendentes', value: stats.pending, icon: '⏳', color: colors.yellow },
      { label: 'Em Andamento', value: stats.inProgress, icon: '🔄', color: colors.blue },
      { label: 'Concluídos', value: stats.completed, icon: '✅', color: colors.green },
      { label: 'Cancelados', value: stats.cancelled, icon: '❌', color: colors.red },
    ];
    
    cards.forEach(card => {
      const bar = '█'.repeat(Math.min(card.value, 15));
      const spaces = ' '.repeat(Math.max(0, 15 - card.value));
      console.log(`  ${card.icon} ${card.label.padEnd(14)} ${card.color}${bar}${colors.dim}${spaces}${colors.reset} ${card.value}`);
    });
  }
  
  renderRecentOrders(): void {
    const recent = this.state.data.slice(0, 5);
    
    if (recent.length === 0) {
      console.log(`\n${colors.yellow}  ━━━━━━━━━━ ORDENS RECENTES ━━━━━━━━━━${colors.reset}\n`);
      console.log(`  ${colors.dim}Nenhuma ordem de serviço encontrada${colors.reset}`);
      return;
    }
    
    console.log(`\n${colors.yellow}  ━━━━━━━━━━ ORDENS RECENTES ━━━━━━━━━━${colors.reset}\n`);
    
    // Cabeçalho da tabela
    console.log(`  ${colors.dim}${'─'.repeat(66)}${colors.reset}`);
    console.log(`  ${colors.bright}${'STATUS'.padEnd(12)}${'CLIENTE'.padEnd(20)}${'SERVIÇO'.padEnd(25)}${'DATA'.padEnd(12)}${colors.reset}`);
    console.log(`  ${colors.dim}${'─'.repeat(66)}${colors.reset}`);
    
    recent.forEach(order => {
      const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
      const clientName = `${order.first_name} ${order.last_name}`.slice(0, 18);
      const serviceType = order.service_type.slice(0, 23);
      const date = new Date(order.created_at).toLocaleDateString('pt-BR');
      
      console.log(`  ${statusInfo.icon} ${statusInfo.color}${statusInfo.label.padEnd(10)}${colors.reset} ${clientName.padEnd(20)} ${colors.dim}${serviceType.padEnd(25)}${colors.reset} ${date}`);
    });
    
    console.log(`  ${colors.dim}${'─'.repeat(66)}${colors.reset}`);
  }
  
  renderUrgentAlerts(): void {
    const urgent = this.state.data.filter(r => r.priority === 'urgent' && r.status !== 'completed');
    
    if (urgent.length > 0) {
      console.log(`\n${colors.red}  ━━━━━━━━━━ 🚨 ALERTAS URGENTES ━━━━━━━━━━${colors.reset}\n`);
      
      urgent.slice(0, 3).forEach(order => {
        const timeAgo = this.getTimeAgo(new Date(order.created_at));
        console.log(`  ${colors.red}🔴 ${order.first_name} ${order.last_name}${colors.reset}`);
        console.log(`     ${colors.dim}${order.service_type} - ${timeAgo}${colors.reset}`);
      });
      
      if (urgent.length > 3) {
        console.log(`\n  ${colors.dim}... e mais ${urgent.length - 3} urgentes${colors.reset}`);
      }
    }
  }
  
  renderFooter(): void {
    console.log(`\n${colors.dim}${'─'.repeat(70)}${colors.reset}`);
    console.log(`${colors.dim}  Pressione Ctrl+C para sair │ Atualização #${this.state.refreshCount}${colors.reset}`);
  }
  
  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }
  
  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  }
  
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar
async function main(): Promise<void> {
  const options = parseArgs();
  const dashboard = new LiveDashboard(options);
  await dashboard.start();
}

main().catch(console.error);
