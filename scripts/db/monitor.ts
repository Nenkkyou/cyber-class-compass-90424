#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB MONITOR - Monitoramento em Tempo Real
 * ============================================
 * Monitora atividades do banco em tempo real
 * 
 * Uso: npm run db:monitor
 *      npm run db:monitor -- --interval=5
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
  createProgressBar,
  STATUS_LABELS,
  PRIORITY_LABELS,
  ServiceRequest,
  clearConsole,
} from './config';

interface MonitorState {
  totalRequests: number;
  pendingCount: number;
  inProgressCount: number;
  completedToday: number;
  urgentCount: number;
  lastActivity: ServiceRequest | null;
  recentChanges: ChangeEvent[];
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  lastUpdate: Date;
  uptime: number;
}

interface ChangeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: ServiceRequest;
  timestamp: Date;
}

interface MonitorOptions {
  interval: number;
}

function parseArgs(): MonitorOptions {
  const args = process.argv.slice(2);
  const options: MonitorOptions = {
    interval: 10, // segundos
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--interval=')) {
      options.interval = parseInt(arg.slice(11), 10);
    }
  });
  
  return options;
}

class DatabaseMonitor {
  private state: MonitorState;
  private options: MonitorOptions;
  private startTime: Date;
  private isRunning: boolean = false;
  private previousData: ServiceRequest[] = [];
  
  constructor(options: MonitorOptions) {
    this.options = options;
    this.startTime = new Date();
    this.state = {
      totalRequests: 0,
      pendingCount: 0,
      inProgressCount: 0,
      completedToday: 0,
      urgentCount: 0,
      lastActivity: null,
      recentChanges: [],
      connectionStatus: 'checking',
      lastUpdate: new Date(),
      uptime: 0,
    };
  }
  
  async start(): Promise<void> {
    this.isRunning = true;
    
    // Configurar handler para Ctrl+C
    process.on('SIGINT', () => {
      this.stop();
    });
    
    console.log(`${colors.dim}Iniciando monitoramento... (Ctrl+C para sair)${colors.reset}\n`);
    
    // Loop de monitoramento
    while (this.isRunning) {
      await this.update();
      this.render();
      await this.sleep(this.options.interval * 1000);
    }
  }
  
  stop(): void {
    this.isRunning = false;
    console.log(`\n\n${colors.yellow}${icons.warning} Monitoramento encerrado${colors.reset}`);
    console.log(`${colors.dim}Tempo de execução: ${this.formatUptime(this.state.uptime)}${colors.reset}\n`);
    process.exit(0);
  }
  
  async update(): Promise<void> {
    const supabase = createSupabaseClient();
    
    try {
      // Buscar dados atuais
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        this.state.connectionStatus = 'disconnected';
        return;
      }
      
      this.state.connectionStatus = 'connected';
      
      // Detectar mudanças
      if (this.previousData.length > 0) {
        this.detectChanges(data || []);
      }
      
      this.previousData = data || [];
      
      // Atualizar contadores
      const today = new Date().toDateString();
      
      this.state.totalRequests = data?.length || 0;
      this.state.pendingCount = data?.filter(r => r.status === 'pending').length || 0;
      this.state.inProgressCount = data?.filter(r => r.status === 'in_progress').length || 0;
      this.state.completedToday = data?.filter(r => 
        r.status === 'completed' && 
        r.completed_at && 
        new Date(r.completed_at).toDateString() === today
      ).length || 0;
      this.state.urgentCount = data?.filter(r => r.priority === 'urgent').length || 0;
      this.state.lastActivity = data?.[0] || null;
      this.state.lastUpdate = new Date();
      this.state.uptime = (Date.now() - this.startTime.getTime()) / 1000;
      
    } catch (err) {
      this.state.connectionStatus = 'disconnected';
    }
  }
  
  detectChanges(newData: ServiceRequest[]): void {
    const previousIds = new Set(this.previousData.map(r => r.id));
    const newIds = new Set(newData.map(r => r.id));
    
    // Novos registros
    newData.forEach(record => {
      if (!previousIds.has(record.id)) {
        this.addChange('INSERT', record);
      }
    });
    
    // Registros atualizados
    newData.forEach(newRecord => {
      const oldRecord = this.previousData.find(r => r.id === newRecord.id);
      if (oldRecord && oldRecord.updated_at !== newRecord.updated_at) {
        this.addChange('UPDATE', newRecord);
      }
    });
    
    // Registros removidos
    this.previousData.forEach(record => {
      if (!newIds.has(record.id)) {
        this.addChange('DELETE', record);
      }
    });
  }
  
  addChange(type: 'INSERT' | 'UPDATE' | 'DELETE', record: ServiceRequest): void {
    this.state.recentChanges.unshift({
      type,
      record,
      timestamp: new Date(),
    });
    
    // Manter apenas últimas 10 mudanças
    if (this.state.recentChanges.length > 10) {
      this.state.recentChanges.pop();
    }
  }
  
  render(): void {
    clearConsole();
    
    // Header
    console.log(`${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset} ${icons.monitor} ${colors.bright}MONITORAMENTO DO BANCO DE DADOS${colors.reset}${' '.repeat(22)}${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}`);
    
    // Status da conexão
    const statusIcon = this.state.connectionStatus === 'connected' 
      ? `${colors.green}●${colors.reset}` 
      : `${colors.red}●${colors.reset}`;
    const statusText = this.state.connectionStatus === 'connected' 
      ? `${colors.green}Conectado${colors.reset}` 
      : `${colors.red}Desconectado${colors.reset}`;
    
    console.log(`\n  ${statusIcon} Status: ${statusText}`);
    console.log(`  ${colors.dim}Última atualização: ${formatDate(this.state.lastUpdate)}${colors.reset}`);
    console.log(`  ${colors.dim}Uptime: ${this.formatUptime(this.state.uptime)}${colors.reset}`);
    console.log(`  ${colors.dim}Intervalo: ${this.options.interval}s${colors.reset}`);
    
    // Métricas principais
    console.log(`\n${colors.yellow}━━━ Métricas em Tempo Real ━━━${colors.reset}`);
    
    this.renderMetricCard('Total de Ordens', this.state.totalRequests, colors.white);
    this.renderMetricCard('Pendentes', this.state.pendingCount, colors.yellow);
    this.renderMetricCard('Em Andamento', this.state.inProgressCount, colors.blue);
    this.renderMetricCard('Concluídas Hoje', this.state.completedToday, colors.green);
    
    if (this.state.urgentCount > 0) {
      this.renderMetricCard('🚨 URGENTES', this.state.urgentCount, colors.red);
    }
    
    // Última atividade
    if (this.state.lastActivity) {
      console.log(`\n${colors.yellow}━━━ Última Atividade ━━━${colors.reset}`);
      const activity = this.state.lastActivity;
      const statusInfo = STATUS_LABELS[activity.status];
      
      console.log(`  ${statusInfo.icon} ${activity.first_name} ${activity.last_name}`);
      console.log(`  ${colors.dim}${activity.service_type}${colors.reset}`);
      console.log(`  ${colors.dim}Atualizado: ${formatDate(activity.updated_at)}${colors.reset}`);
    }
    
    // Mudanças recentes
    if (this.state.recentChanges.length > 0) {
      console.log(`\n${colors.yellow}━━━ Mudanças Recentes ━━━${colors.reset}`);
      
      this.state.recentChanges.slice(0, 5).forEach(change => {
        const typeIcon = {
          'INSERT': `${colors.green}+ NOVO${colors.reset}`,
          'UPDATE': `${colors.blue}↻ ATUALIZADO${colors.reset}`,
          'DELETE': `${colors.red}- REMOVIDO${colors.reset}`,
        }[change.type];
        
        const timeAgo = this.getTimeAgo(change.timestamp);
        
        console.log(`  ${typeIcon} ${change.record.first_name} ${change.record.last_name}`);
        console.log(`    ${colors.dim}${timeAgo}${colors.reset}`);
      });
    }
    
    // Footer
    console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}`);
    console.log(`${colors.dim}Pressione Ctrl+C para encerrar${colors.reset}`);
  }
  
  renderMetricCard(label: string, value: number, color: string): void {
    const bar = '█'.repeat(Math.min(value, 20));
    console.log(`\n  ${color}${label}${colors.reset}`);
    console.log(`  ${colors.dim}${bar}${colors.reset} ${colors.bright}${value}${colors.reset}`);
  }
  
  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
  
  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return formatDate(date);
  }
  
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar
async function main(): Promise<void> {
  const options = parseArgs();
  const monitor = new DatabaseMonitor(options);
  await monitor.start();
}

main().catch(console.error);
