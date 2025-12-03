#!/usr/bin/env node
/**
 * ============================================================
 * CYBERCLASS - Estatísticas e Relatórios
 * ============================================================
 * Comando: npm run db:stats
 * 
 * Exibe estatísticas detalhadas:
 * - Totais por status e prioridade
 * - Distribuição por tipo de serviço
 * - Métricas de tempo
 * - Tendências
 * - Gráficos ASCII
 */

import {
  config,
  createAnonClient,
  colors,
  icons,
  printHeader,
  printSeparator,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  formatDate,
  formatDuration,
  formatStatus,
  formatPriority,
} from './config.js';

// ============================================================
// CLASSE DE ESTATÍSTICAS
// ============================================================

class StatsGenerator {
  constructor() {
    this.supabase = createAnonClient();
  }
  
  /**
   * Busca todos os dados para análise
   */
  async fetchAllData() {
    const { data, error, count } = await this.supabase
      .from('service_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        return { data: [], count: 0 };
      }
      throw error;
    }
    
    return { data: data || [], count: count || 0 };
  }
  
  /**
   * Calcula estatísticas gerais
   */
  calculateGeneralStats(data) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: data.length,
      today: data.filter(r => new Date(r.created_at) >= today).length,
      thisWeek: data.filter(r => new Date(r.created_at) >= weekAgo).length,
      thisMonth: data.filter(r => new Date(r.created_at) >= monthAgo).length,
    };
  }
  
  /**
   * Calcula estatísticas por status
   */
  calculateStatusStats(data) {
    const stats = {};
    config.statusTypes.forEach(status => {
      stats[status] = data.filter(r => r.status === status).length;
    });
    return stats;
  }
  
  /**
   * Calcula estatísticas por prioridade
   */
  calculatePriorityStats(data) {
    const stats = {};
    config.priorityTypes.forEach(priority => {
      stats[priority] = data.filter(r => r.priority === priority).length;
    });
    return stats;
  }
  
  /**
   * Calcula estatísticas por tipo de serviço
   */
  calculateServiceTypeStats(data) {
    const stats = {};
    data.forEach(r => {
      stats[r.service_type] = (stats[r.service_type] || 0) + 1;
    });
    return stats;
  }
  
  /**
   * Calcula tempo médio de resolução
   */
  calculateResolutionTime(data) {
    const completed = data.filter(r => r.status === 'completed' && r.completed_at);
    
    if (completed.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }
    
    const times = completed.map(r => {
      return new Date(r.completed_at).getTime() - new Date(r.created_at).getTime();
    });
    
    return {
      average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      min: Math.min(...times),
      max: Math.max(...times),
      count: completed.length,
    };
  }
  
  /**
   * Calcula distribuição por dia da semana
   */
  calculateWeekdayDistribution(data) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const distribution = new Array(7).fill(0);
    
    data.forEach(r => {
      const day = new Date(r.created_at).getDay();
      distribution[day]++;
    });
    
    return days.map((day, index) => ({
      day,
      count: distribution[index],
    }));
  }
  
  /**
   * Calcula distribuição por hora
   */
  calculateHourlyDistribution(data) {
    const distribution = new Array(24).fill(0);
    
    data.forEach(r => {
      const hour = new Date(r.created_at).getHours();
      distribution[hour]++;
    });
    
    return distribution;
  }
  
  /**
   * Cria gráfico de barras ASCII
   */
  createBarChart(data, maxWidth = 40) {
    const maxValue = Math.max(...Object.values(data));
    
    Object.entries(data).forEach(([label, value]) => {
      const barLength = maxValue > 0 ? Math.round((value / maxValue) * maxWidth) : 0;
      const bar = '█'.repeat(barLength) + '░'.repeat(maxWidth - barLength);
      const percentage = maxValue > 0 ? ((value / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1) : 0;
      
      console.log(`  ${colors.bright}${label.padEnd(30)}${colors.reset} ${colors.cyan}${bar}${colors.reset} ${value} (${percentage}%)`);
    });
  }
  
  /**
   * Cria gráfico de linha ASCII para tendências
   */
  createTrendChart(data, days = 14) {
    const now = new Date();
    const dailyCounts = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const count = data.filter(r => r.created_at.startsWith(dateStr)).length;
      dailyCounts.push({ date: dateStr, count });
    }
    
    const maxCount = Math.max(...dailyCounts.map(d => d.count), 1);
    const height = 8;
    
    console.log(`\n  ${colors.bright}Tendência dos últimos ${days} dias:${colors.reset}\n`);
    
    // Desenhar gráfico
    for (let row = height; row >= 0; row--) {
      const threshold = (row / height) * maxCount;
      let line = row === 0 ? '  └' : '  │';
      
      dailyCounts.forEach(d => {
        if (d.count >= threshold && threshold > 0) {
          line += `${colors.green}█${colors.reset} `;
        } else {
          line += '  ';
        }
      });
      
      if (row === height) {
        line += ` ${maxCount}`;
      } else if (row === 0) {
        line += '─'.repeat(days);
      }
      
      console.log(line);
    }
    
    // Labels de data
    let dateLabels = '   ';
    dailyCounts.forEach((d, i) => {
      if (i === 0 || i === Math.floor(days / 2) || i === days - 1) {
        dateLabels += d.date.slice(5) + ' ';
      } else {
        dateLabels += '  ';
      }
    });
    console.log(`${colors.dim}${dateLabels}${colors.reset}`);
  }
  
  /**
   * Exibe todas as estatísticas
   */
  async displayStats() {
    printHeader('Estatísticas e Relatórios', icons.stats);
    
    console.log(`${icons.loading} Carregando dados...\n`);
    
    try {
      const { data, count } = await this.fetchAllData();
      
      if (data.length === 0) {
        printWarning('Nenhuma solicitação encontrada no banco de dados.');
        printInfo('As estatísticas serão exibidas quando houver dados.');
        return;
      }
      
      const generalStats = this.calculateGeneralStats(data);
      const statusStats = this.calculateStatusStats(data);
      const priorityStats = this.calculatePriorityStats(data);
      const serviceTypeStats = this.calculateServiceTypeStats(data);
      const resolutionTime = this.calculateResolutionTime(data);
      const weekdayDist = this.calculateWeekdayDistribution(data);
      
      // ============ ESTATÍSTICAS GERAIS ============
      console.log(`${colors.bright}${colors.yellow}╔════════════════════════════════════════════════════════╗${colors.reset}`);
      console.log(`${colors.bright}${colors.yellow}║              ${icons.stats} ESTATÍSTICAS GERAIS                    ║${colors.reset}`);
      console.log(`${colors.bright}${colors.yellow}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
      
      console.log(`  ${colors.bright}📊 Total de Solicitações:${colors.reset} ${colors.cyan}${generalStats.total}${colors.reset}`);
      console.log(`  ${colors.bright}📅 Hoje:${colors.reset} ${generalStats.today}`);
      console.log(`  ${colors.bright}📆 Esta Semana:${colors.reset} ${generalStats.thisWeek}`);
      console.log(`  ${colors.bright}🗓️  Este Mês:${colors.reset} ${generalStats.thisMonth}`);
      
      // Taxa de conclusão
      const completionRate = generalStats.total > 0 
        ? ((statusStats.completed / generalStats.total) * 100).toFixed(1) 
        : 0;
      console.log(`  ${colors.bright}✅ Taxa de Conclusão:${colors.reset} ${completionRate}%`);
      
      // ============ POR STATUS ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}${icons.list} DISTRIBUIÇÃO POR STATUS${colors.reset}\n`);
      
      const statusLabels = {
        pending: '⏳ Pendente',
        in_progress: '🔄 Em Andamento',
        completed: '✅ Concluído',
        cancelled: '❌ Cancelado',
      };
      
      const statusData = {};
      Object.entries(statusStats).forEach(([key, value]) => {
        statusData[statusLabels[key] || key] = value;
      });
      
      this.createBarChart(statusData);
      
      // ============ POR PRIORIDADE ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}🎯 DISTRIBUIÇÃO POR PRIORIDADE${colors.reset}\n`);
      
      const priorityLabels = {
        low: '🔵 Baixa',
        medium: '🟢 Média',
        high: '🟡 Alta',
        urgent: '🔴 Urgente',
      };
      
      const priorityData = {};
      Object.entries(priorityStats).forEach(([key, value]) => {
        priorityData[priorityLabels[key] || key] = value;
      });
      
      this.createBarChart(priorityData);
      
      // ============ POR TIPO DE SERVIÇO ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}${icons.service} DISTRIBUIÇÃO POR TIPO DE SERVIÇO${colors.reset}\n`);
      
      // Ordenar por quantidade
      const sortedServices = Object.entries(serviceTypeStats)
        .sort((a, b) => b[1] - a[1]);
      
      const serviceData = {};
      sortedServices.forEach(([service, count]) => {
        serviceData[service.substring(0, 30)] = count;
      });
      
      this.createBarChart(serviceData);
      
      // ============ TEMPO DE RESOLUÇÃO ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}${icons.clock} TEMPO DE RESOLUÇÃO${colors.reset}\n`);
      
      if (resolutionTime.count > 0) {
        console.log(`  ${colors.bright}Tempo Médio:${colors.reset} ${formatDuration(resolutionTime.average)}`);
        console.log(`  ${colors.bright}Mais Rápido:${colors.reset} ${formatDuration(resolutionTime.min)}`);
        console.log(`  ${colors.bright}Mais Lento:${colors.reset} ${formatDuration(resolutionTime.max)}`);
        console.log(`  ${colors.bright}Total Resolvidos:${colors.reset} ${resolutionTime.count}`);
      } else {
        console.log(`  ${colors.dim}Nenhuma solicitação concluída ainda.${colors.reset}`);
      }
      
      // ============ DISTRIBUIÇÃO POR DIA ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}📅 DISTRIBUIÇÃO POR DIA DA SEMANA${colors.reset}\n`);
      
      const weekdayData = {};
      weekdayDist.forEach(d => {
        weekdayData[d.day] = d.count;
      });
      
      this.createBarChart(weekdayData, 30);
      
      // ============ TENDÊNCIA ============
      this.createTrendChart(data, 14);
      
      // ============ TOP CLIENTES ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}${icons.user} TOP 5 CLIENTES (por número de solicitações)${colors.reset}\n`);
      
      const clientCounts = {};
      data.forEach(r => {
        const email = r.email;
        clientCounts[email] = (clientCounts[email] || 0) + 1;
      });
      
      const topClients = Object.entries(clientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      topClients.forEach(([email, count], index) => {
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        console.log(`  ${medals[index]} ${email}: ${count} solicitações`);
      });
      
      // ============ ALERTAS ============
      printSeparator('─', 58);
      console.log(`\n${colors.bright}⚠️ ALERTAS${colors.reset}\n`);
      
      const pendingUrgent = data.filter(r => r.status === 'pending' && r.priority === 'urgent').length;
      const oldPending = data.filter(r => {
        if (r.status !== 'pending') return false;
        const age = Date.now() - new Date(r.created_at).getTime();
        return age > 7 * 24 * 60 * 60 * 1000; // Mais de 7 dias
      }).length;
      
      if (pendingUrgent > 0) {
        console.log(`  ${colors.red}🔴 ${pendingUrgent} solicitações urgentes pendentes!${colors.reset}`);
      }
      
      if (oldPending > 0) {
        console.log(`  ${colors.yellow}⚠️ ${oldPending} solicitações pendentes há mais de 7 dias!${colors.reset}`);
      }
      
      if (pendingUrgent === 0 && oldPending === 0) {
        console.log(`  ${colors.green}✅ Nenhum alerta no momento.${colors.reset}`);
      }
      
      // ============ RODAPÉ ============
      printSeparator('═', 58);
      console.log(`\n${colors.dim}Relatório gerado em: ${formatDate(new Date())}${colors.reset}`);
      console.log(`${colors.dim}Total de registros analisados: ${data.length}${colors.reset}\n`);
      
    } catch (error) {
      printError(`Erro ao gerar estatísticas: ${error.message}`);
    }
  }
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  const stats = new StatsGenerator();
  await stats.displayStats();
}

main().catch(error => {
  printError(`Erro fatal: ${error.message}`);
  process.exit(1);
});
