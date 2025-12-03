#!/usr/bin/env node
/**
 * ============================================================
 * CYBERCLASS - Listagem de Solicitações de Serviço
 * ============================================================
 * Comando: npm run db:list
 * 
 * Lista todas as reservas/ordens de serviço com:
 * - Filtros por status, prioridade, data
 * - Ordenação personalizada
 * - Paginação
 * - Exportação
 */

import readline from 'readline';
import { writeFileSync } from 'fs';
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
  formatStatus,
  formatPriority,
  createTable,
  ensureDirectories,
} from './config.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

// ============================================================
// CLASSE DE LISTAGEM
// ============================================================

class ServiceRequestLister {
  constructor() {
    this.supabase = createAnonClient();
    this.pageSize = 10;
    this.currentPage = 1;
    this.filters = {
      status: null,
      priority: null,
      serviceType: null,
      searchTerm: null,
      dateFrom: null,
      dateTo: null,
    };
    this.orderBy = 'created_at';
    this.orderDir = 'desc';
  }
  
  /**
   * Busca solicitações com filtros
   */
  async fetchRequests() {
    let query = this.supabase
      .from('service_requests')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (this.filters.status) {
      query = query.eq('status', this.filters.status);
    }
    
    if (this.filters.priority) {
      query = query.eq('priority', this.filters.priority);
    }
    
    if (this.filters.serviceType) {
      query = query.eq('service_type', this.filters.serviceType);
    }
    
    if (this.filters.searchTerm) {
      query = query.or(`first_name.ilike.%${this.filters.searchTerm}%,last_name.ilike.%${this.filters.searchTerm}%,email.ilike.%${this.filters.searchTerm}%`);
    }
    
    if (this.filters.dateFrom) {
      query = query.gte('created_at', this.filters.dateFrom);
    }
    
    if (this.filters.dateTo) {
      query = query.lte('created_at', this.filters.dateTo);
    }
    
    // Ordenação
    query = query.order(this.orderBy, { ascending: this.orderDir === 'asc' });
    
    // Paginação
    const from = (this.currentPage - 1) * this.pageSize;
    const to = from + this.pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    return { data, count };
  }
  
  /**
   * Exibe a tabela de resultados
   */
  displayResults(data, count) {
    if (!data || data.length === 0) {
      printWarning('Nenhuma solicitação encontrada com os filtros atuais.');
      return;
    }
    
    const totalPages = Math.ceil(count / this.pageSize);
    
    console.log(`\n${colors.bright}${icons.list} SOLICITAÇÕES DE SERVIÇO${colors.reset}`);
    console.log(`${colors.dim}Página ${this.currentPage} de ${totalPages} (${count} total)${colors.reset}\n`);
    
    // Preparar dados para tabela
    const headers = ['ID', 'Nome', 'Serviço', 'Status', 'Prioridade', 'Data'];
    const rows = data.map(req => [
      req.id.substring(0, 8) + '...',
      `${req.first_name} ${req.last_name}`.substring(0, 20),
      req.service_type.substring(0, 25),
      formatStatus(req.status),
      formatPriority(req.priority),
      formatDate(req.created_at),
    ]);
    
    createTable(headers, rows);
    
    // Mostrar detalhes de navegação
    console.log(`\n${colors.dim}Navegação: [A]nterior | [P]róxima | [D]etalhes | [F]iltros | [E]xportar | [V]oltar${colors.reset}`);
  }
  
  /**
   * Exibe detalhes de uma solicitação
   */
  async showDetails(requestId) {
    const { data, error } = await this.supabase
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (error) {
      printError(`Erro ao buscar detalhes: ${error.message}`);
      return;
    }
    
    if (!data) {
      printWarning('Solicitação não encontrada.');
      return;
    }
    
    console.log(`\n${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║              ${icons.service} DETALHES DA SOLICITAÇÃO                 ║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚══════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    console.log(`${colors.bright}ID:${colors.reset} ${data.id}`);
    printSeparator('─', 50);
    
    console.log(`\n${colors.yellow}${icons.user} DADOS DO CLIENTE${colors.reset}`);
    console.log(`  ${colors.bright}Nome:${colors.reset} ${data.first_name} ${data.last_name}`);
    console.log(`  ${colors.bright}Email:${colors.reset} ${data.email}`);
    console.log(`  ${colors.bright}Telefone:${colors.reset} ${data.phone}`);
    
    console.log(`\n${colors.yellow}${icons.service} SERVIÇO${colors.reset}`);
    console.log(`  ${colors.bright}Tipo:${colors.reset} ${data.service_type}`);
    console.log(`  ${colors.bright}Status:${colors.reset} ${formatStatus(data.status)}`);
    console.log(`  ${colors.bright}Prioridade:${colors.reset} ${formatPriority(data.priority)}`);
    
    console.log(`\n${colors.yellow}📝 DESCRIÇÃO${colors.reset}`);
    console.log(`  ${colors.dim}${data.description}${colors.reset}`);
    
    if (data.internal_notes) {
      console.log(`\n${colors.yellow}📋 NOTAS INTERNAS${colors.reset}`);
      console.log(`  ${colors.dim}${data.internal_notes}${colors.reset}`);
    }
    
    console.log(`\n${colors.yellow}${icons.calendar} DATAS${colors.reset}`);
    console.log(`  ${colors.bright}Criado em:${colors.reset} ${formatDate(data.created_at)}`);
    console.log(`  ${colors.bright}Atualizado:${colors.reset} ${formatDate(data.updated_at)}`);
    if (data.completed_at) {
      console.log(`  ${colors.bright}Concluído:${colors.reset} ${formatDate(data.completed_at)}`);
    }
    
    console.log(`\n${colors.yellow}ℹ️ METADADOS${colors.reset}`);
    console.log(`  ${colors.bright}Origem:${colors.reset} ${data.source}`);
    if (data.ip_address) {
      console.log(`  ${colors.bright}IP:${colors.reset} ${data.ip_address}`);
    }
    
    printSeparator('─', 50);
  }
  
  /**
   * Menu de filtros
   */
  async showFilterMenu() {
    console.log(`\n${colors.bright}${icons.stats} FILTROS ATUAIS${colors.reset}`);
    console.log(`  Status: ${this.filters.status || 'Todos'}`);
    console.log(`  Prioridade: ${this.filters.priority || 'Todas'}`);
    console.log(`  Tipo de Serviço: ${this.filters.serviceType || 'Todos'}`);
    console.log(`  Busca: ${this.filters.searchTerm || 'Nenhuma'}`);
    console.log(`  Data de: ${this.filters.dateFrom || 'Não definida'}`);
    console.log(`  Data até: ${this.filters.dateTo || 'Não definida'}`);
    console.log(`  Ordenar por: ${this.orderBy} (${this.orderDir})`);
    
    console.log(`\n${colors.bright}Opções de Filtro:${colors.reset}`);
    console.log('  [1] Filtrar por Status');
    console.log('  [2] Filtrar por Prioridade');
    console.log('  [3] Filtrar por Tipo de Serviço');
    console.log('  [4] Buscar por Nome/Email');
    console.log('  [5] Filtrar por Data');
    console.log('  [6] Alterar Ordenação');
    console.log('  [7] Limpar Filtros');
    console.log('  [0] Voltar');
    
    const choice = await question(`\n${icons.arrow} Escolha: `);
    
    switch (choice.trim()) {
      case '1':
        await this.filterByStatus();
        break;
      case '2':
        await this.filterByPriority();
        break;
      case '3':
        await this.filterByServiceType();
        break;
      case '4':
        await this.filterBySearch();
        break;
      case '5':
        await this.filterByDate();
        break;
      case '6':
        await this.changeOrder();
        break;
      case '7':
        this.clearFilters();
        printSuccess('Filtros limpos!');
        break;
      case '0':
        return;
    }
  }
  
  async filterByStatus() {
    console.log(`\nStatus disponíveis:`);
    config.statusTypes.forEach((s, i) => {
      console.log(`  [${i + 1}] ${formatStatus(s)}`);
    });
    console.log('  [0] Todos');
    
    const choice = await question('Escolha: ');
    const idx = parseInt(choice) - 1;
    
    if (choice === '0') {
      this.filters.status = null;
    } else if (idx >= 0 && idx < config.statusTypes.length) {
      this.filters.status = config.statusTypes[idx];
    }
    
    this.currentPage = 1;
  }
  
  async filterByPriority() {
    console.log(`\nPrioridades disponíveis:`);
    config.priorityTypes.forEach((p, i) => {
      console.log(`  [${i + 1}] ${formatPriority(p)}`);
    });
    console.log('  [0] Todas');
    
    const choice = await question('Escolha: ');
    const idx = parseInt(choice) - 1;
    
    if (choice === '0') {
      this.filters.priority = null;
    } else if (idx >= 0 && idx < config.priorityTypes.length) {
      this.filters.priority = config.priorityTypes[idx];
    }
    
    this.currentPage = 1;
  }
  
  async filterByServiceType() {
    console.log(`\nTipos de serviço:`);
    config.serviceTypes.forEach((s, i) => {
      console.log(`  [${i + 1}] ${s}`);
    });
    console.log('  [0] Todos');
    
    const choice = await question('Escolha: ');
    const idx = parseInt(choice) - 1;
    
    if (choice === '0') {
      this.filters.serviceType = null;
    } else if (idx >= 0 && idx < config.serviceTypes.length) {
      this.filters.serviceType = config.serviceTypes[idx];
    }
    
    this.currentPage = 1;
  }
  
  async filterBySearch() {
    const term = await question('Digite o termo de busca (nome ou email): ');
    this.filters.searchTerm = term.trim() || null;
    this.currentPage = 1;
  }
  
  async filterByDate() {
    console.log('\nFormato de data: YYYY-MM-DD');
    const from = await question('Data inicial (ou Enter para ignorar): ');
    const to = await question('Data final (ou Enter para ignorar): ');
    
    this.filters.dateFrom = from.trim() || null;
    this.filters.dateTo = to.trim() || null;
    this.currentPage = 1;
  }
  
  async changeOrder() {
    console.log('\nOrdenar por:');
    console.log('  [1] Data de criação');
    console.log('  [2] Nome');
    console.log('  [3] Status');
    console.log('  [4] Prioridade');
    
    const field = await question('Campo: ');
    const fieldMap = {
      '1': 'created_at',
      '2': 'first_name',
      '3': 'status',
      '4': 'priority',
    };
    
    if (fieldMap[field]) {
      this.orderBy = fieldMap[field];
    }
    
    const dir = await question('Direção [A]sc / [D]esc: ');
    this.orderDir = dir.toLowerCase() === 'a' ? 'asc' : 'desc';
    this.currentPage = 1;
  }
  
  clearFilters() {
    this.filters = {
      status: null,
      priority: null,
      serviceType: null,
      searchTerm: null,
      dateFrom: null,
      dateTo: null,
    };
    this.currentPage = 1;
  }
  
  /**
   * Exporta os resultados
   */
  async exportResults() {
    try {
      // Buscar todos os dados com filtros atuais (sem paginação)
      let query = this.supabase.from('service_requests').select('*');
      
      if (this.filters.status) query = query.eq('status', this.filters.status);
      if (this.filters.priority) query = query.eq('priority', this.filters.priority);
      if (this.filters.serviceType) query = query.eq('service_type', this.filters.serviceType);
      if (this.filters.dateFrom) query = query.gte('created_at', this.filters.dateFrom);
      if (this.filters.dateTo) query = query.lte('created_at', this.filters.dateTo);
      
      query = query.order(this.orderBy, { ascending: this.orderDir === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      ensureDirectories();
      
      const filename = `export_${new Date().toISOString().slice(0, 10)}.json`;
      const filepath = `${config.paths.backups}/${filename}`;
      
      writeFileSync(filepath, JSON.stringify(data, null, 2));
      
      printSuccess(`Exportado para: ${filepath}`);
      printInfo(`${data.length} registros exportados`);
    } catch (error) {
      printError(`Erro ao exportar: ${error.message}`);
    }
  }
  
  /**
   * Loop principal
   */
  async run() {
    printHeader('Listagem de Solicitações', icons.list);
    
    let running = true;
    
    while (running) {
      try {
        const { data, count } = await this.fetchRequests();
        this.displayResults(data, count);
        
        const input = await question(`\n${icons.arrow} Comando: `);
        const cmd = input.toLowerCase().trim();
        
        switch (cmd) {
          case 'a':
            if (this.currentPage > 1) this.currentPage--;
            break;
          case 'p':
            if (this.currentPage < Math.ceil(count / this.pageSize)) this.currentPage++;
            break;
          case 'd':
            const id = await question('ID da solicitação (ou parte): ');
            if (id.trim()) {
              // Buscar por ID parcial
              const match = data.find(r => r.id.startsWith(id.trim()));
              if (match) {
                await this.showDetails(match.id);
                await question('\nPressione ENTER para continuar...');
              } else {
                printWarning('Solicitação não encontrada na página atual.');
              }
            }
            break;
          case 'f':
            await this.showFilterMenu();
            break;
          case 'e':
            await this.exportResults();
            await question('\nPressione ENTER para continuar...');
            break;
          case 'v':
          case 'q':
            running = false;
            break;
        }
        
        console.clear();
        printHeader('Listagem de Solicitações', icons.list);
        
      } catch (error) {
        if (error.message.includes('does not exist')) {
          printWarning('Tabela service_requests não existe.');
          printInfo('Execute a migration para criar a tabela.');
          running = false;
        } else {
          printError(`Erro: ${error.message}`);
          await question('\nPressione ENTER para continuar...');
        }
      }
    }
    
    rl.close();
  }
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  const lister = new ServiceRequestLister();
  await lister.run();
}

main().catch(error => {
  printError(`Erro fatal: ${error.message}`);
  rl.close();
  process.exit(1);
});
