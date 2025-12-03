#!/usr/bin/env node
/**
 * ============================================================
 * CYBERCLASS - Health Check do Sistema
 * ============================================================
 * Comando: npm run db:health
 * 
 * Verificação completa de saúde do sistema:
 * - Conectividade com Supabase
 * - Status das tabelas
 * - Verificação de dados
 * - Performance
 * - Integridade do banco
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
  formatDuration,
  createTable,
} from './config.js';

// ============================================================
// VERIFICAÇÕES DE SAÚDE
// ============================================================

class HealthChecker {
  constructor() {
    this.supabase = createAnonClient();
    this.results = [];
    this.startTime = Date.now();
  }
  
  /**
   * Adiciona resultado de um check
   */
  addResult(name, status, message, duration = null) {
    this.results.push({
      name,
      status,
      message,
      duration,
    });
  }
  
  /**
   * Verifica conectividade com Supabase
   */
  async checkConnection() {
    const checkName = 'Conexão Supabase';
    const start = Date.now();
    
    try {
      // Tenta fazer uma query simples
      const { data, error } = await this.supabase
        .from('service_requests')
        .select('count', { count: 'exact', head: true });
      
      const duration = Date.now() - start;
      
      if (error) {
        // Se erro for de tabela não existir, a conexão está ok
        if (error.message.includes('does not exist')) {
          this.addResult(checkName, 'warning', 'Conectado, mas tabela não existe', duration);
        } else {
          throw error;
        }
      } else {
        this.addResult(checkName, 'success', `Conectado em ${duration}ms`, duration);
      }
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica tabela service_requests
   */
  async checkServiceRequestsTable() {
    const checkName = 'Tabela service_requests';
    const start = Date.now();
    
    try {
      const { count, error } = await this.supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true });
      
      const duration = Date.now() - start;
      
      if (error) {
        if (error.message.includes('does not exist')) {
          this.addResult(checkName, 'error', 'Tabela não existe');
        } else {
          throw error;
        }
      } else {
        this.addResult(checkName, 'success', `${count || 0} registros encontrados`, duration);
      }
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica tabela system_backups
   */
  async checkBackupsTable() {
    const checkName = 'Tabela system_backups';
    const start = Date.now();
    
    try {
      const { count, error } = await this.supabase
        .from('system_backups')
        .select('*', { count: 'exact', head: true });
      
      const duration = Date.now() - start;
      
      if (error) {
        if (error.message.includes('does not exist')) {
          this.addResult(checkName, 'warning', 'Tabela não existe (opcional)');
        } else {
          throw error;
        }
      } else {
        this.addResult(checkName, 'success', `${count || 0} backups registrados`, duration);
      }
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica tabela system_logs
   */
  async checkLogsTable() {
    const checkName = 'Tabela system_logs';
    const start = Date.now();
    
    try {
      const { count, error } = await this.supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true });
      
      const duration = Date.now() - start;
      
      if (error) {
        if (error.message.includes('does not exist')) {
          this.addResult(checkName, 'warning', 'Tabela não existe (opcional)');
        } else {
          throw error;
        }
      } else {
        this.addResult(checkName, 'success', `${count || 0} logs registrados`, duration);
      }
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica latência do banco
   */
  async checkLatency() {
    const checkName = 'Latência do Banco';
    const iterations = 5;
    const times = [];
    
    try {
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await this.supabase.from('service_requests').select('id').limit(1);
        times.push(Date.now() - start);
      }
      
      const avgLatency = Math.round(times.reduce((a, b) => a + b) / times.length);
      const minLatency = Math.min(...times);
      const maxLatency = Math.max(...times);
      
      let status = 'success';
      if (avgLatency > 500) status = 'error';
      else if (avgLatency > 200) status = 'warning';
      
      this.addResult(
        checkName,
        status,
        `Média: ${avgLatency}ms (min: ${minLatency}ms, max: ${maxLatency}ms)`,
        avgLatency
      );
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica solicitações pendentes
   */
  async checkPendingRequests() {
    const checkName = 'Solicitações Pendentes';
    
    try {
      const { count, error } = await this.supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (error) {
        if (!error.message.includes('does not exist')) {
          throw error;
        }
        this.addResult(checkName, 'warning', 'Não foi possível verificar');
        return;
      }
      
      const pendingCount = count || 0;
      let status = 'success';
      
      if (pendingCount > config.monitor.alertThresholds.pendingRequests) {
        status = 'error';
      } else if (pendingCount > config.monitor.alertThresholds.pendingRequests / 2) {
        status = 'warning';
      }
      
      this.addResult(checkName, status, `${pendingCount} pendentes`);
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica solicitações urgentes
   */
  async checkUrgentRequests() {
    const checkName = 'Solicitações Urgentes';
    
    try {
      const { count, error } = await this.supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'urgent')
        .neq('status', 'completed')
        .neq('status', 'cancelled');
      
      if (error) {
        if (!error.message.includes('does not exist')) {
          throw error;
        }
        this.addResult(checkName, 'warning', 'Não foi possível verificar');
        return;
      }
      
      const urgentCount = count || 0;
      let status = 'success';
      
      if (urgentCount > config.monitor.alertThresholds.urgentRequests) {
        status = 'error';
      } else if (urgentCount > 0) {
        status = 'warning';
      }
      
      this.addResult(checkName, status, `${urgentCount} urgentes não resolvidas`);
    } catch (error) {
      this.addResult(checkName, 'error', error.message);
    }
  }
  
  /**
   * Verifica integridade dos dados
   */
  async checkDataIntegrity() {
    const checkName = 'Integridade dos Dados';
    const issues = [];
    
    try {
      // Verificar emails válidos
      const { data: invalidEmails, error: emailError } = await this.supabase
        .from('service_requests')
        .select('id, email')
        .not('email', 'like', '%@%.%');
      
      if (emailError && !emailError.message.includes('does not exist')) {
        throw emailError;
      }
      
      if (invalidEmails?.length > 0) {
        issues.push(`${invalidEmails.length} emails inválidos`);
      }
      
      // Verificar telefones válidos
      const { data: invalidPhones, error: phoneError } = await this.supabase
        .from('service_requests')
        .select('id, phone')
        .or('phone.is.null,phone.eq.');
      
      if (phoneError && !phoneError.message.includes('does not exist')) {
        throw phoneError;
      }
      
      if (invalidPhones?.length > 0) {
        issues.push(`${invalidPhones.length} telefones vazios`);
      }
      
      if (issues.length === 0) {
        this.addResult(checkName, 'success', 'Nenhum problema encontrado');
      } else {
        this.addResult(checkName, 'warning', issues.join(', '));
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        this.addResult(checkName, 'warning', 'Tabela não existe');
      } else {
        this.addResult(checkName, 'error', error.message);
      }
    }
  }
  
  /**
   * Verifica Edge Functions
   */
  async checkEdgeFunctions() {
    const checkName = 'Edge Functions';
    const start = Date.now();
    
    try {
      // Tentar invocar a função de envio de email (com corpo inválido para não enviar de verdade)
      const { error } = await this.supabase.functions.invoke('send-service-request', {
        body: { test: true },
      });
      
      const duration = Date.now() - start;
      
      // Se houver erro 400, a função está funcionando (só rejeitou dados inválidos)
      if (error && error.message.includes('400')) {
        this.addResult(checkName, 'success', `Função send-service-request ativa (${duration}ms)`, duration);
      } else if (error) {
        this.addResult(checkName, 'warning', `Função respondeu com: ${error.message}`, duration);
      } else {
        this.addResult(checkName, 'success', `Função ativa (${duration}ms)`, duration);
      }
    } catch (error) {
      this.addResult(checkName, 'warning', `Não foi possível verificar: ${error.message}`);
    }
  }
  
  /**
   * Executa todos os checks
   */
  async runAllChecks() {
    printHeader('Health Check do Sistema', icons.health);
    
    console.log(`${icons.loading} Executando verificações...\n`);
    
    // Executar checks em sequência
    await this.checkConnection();
    await this.checkServiceRequestsTable();
    await this.checkBackupsTable();
    await this.checkLogsTable();
    await this.checkLatency();
    await this.checkPendingRequests();
    await this.checkUrgentRequests();
    await this.checkDataIntegrity();
    await this.checkEdgeFunctions();
    
    // Exibir resultados
    this.displayResults();
  }
  
  /**
   * Exibe resultados formatados
   */
  displayResults() {
    const totalDuration = Date.now() - this.startTime;
    
    printSeparator();
    console.log(`\n${colors.bright}${icons.stats} RESULTADOS DO HEALTH CHECK${colors.reset}\n`);
    
    // Contadores
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    // Exibir cada resultado
    this.results.forEach(result => {
      let icon, color;
      
      switch (result.status) {
        case 'success':
          icon = icons.success;
          color = colors.green;
          break;
        case 'warning':
          icon = icons.warning;
          color = colors.yellow;
          break;
        case 'error':
          icon = icons.error;
          color = colors.red;
          break;
        default:
          icon = icons.info;
          color = colors.white;
      }
      
      const duration = result.duration ? ` ${colors.dim}(${result.duration}ms)${colors.reset}` : '';
      console.log(`  ${icon} ${colors.bright}${result.name}:${colors.reset} ${color}${result.message}${colors.reset}${duration}`);
    });
    
    // Resumo
    printSeparator();
    console.log(`\n${colors.bright}${icons.stats} RESUMO${colors.reset}`);
    console.log(`  ${colors.green}${icons.success} Sucesso: ${successCount}${colors.reset}`);
    console.log(`  ${colors.yellow}${icons.warning} Avisos: ${warningCount}${colors.reset}`);
    console.log(`  ${colors.red}${icons.error} Erros: ${errorCount}${colors.reset}`);
    console.log(`  ${colors.dim}${icons.clock} Tempo total: ${formatDuration(totalDuration)}${colors.reset}`);
    
    // Status geral
    console.log('');
    if (errorCount > 0) {
      console.log(`${colors.bgRed}${colors.white}${colors.bright}  ❌ SISTEMA COM PROBLEMAS  ${colors.reset}`);
    } else if (warningCount > 0) {
      console.log(`${colors.bgYellow}${colors.black}${colors.bright}  ⚠️ SISTEMA COM AVISOS  ${colors.reset}`);
    } else {
      console.log(`${colors.bgGreen}${colors.black}${colors.bright}  ✅ SISTEMA SAUDÁVEL  ${colors.reset}`);
    }
    console.log('');
  }
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  try {
    const healthChecker = new HealthChecker();
    await healthChecker.runAllChecks();
  } catch (error) {
    printError(`Erro fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
