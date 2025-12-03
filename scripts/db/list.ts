#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB LIST - Listar Ordens de Serviço
 * ============================================
 * Lista todas as ordens com filtros e formatação
 * 
 * Uso: npm run db:list
 *      npm run db:list -- --status=pending
 *      npm run db:list -- --limit=10
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
  STATUS_LABELS,
  PRIORITY_LABELS,
  ServiceRequest,
} from './config';

interface ListOptions {
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

function parseArgs(): ListOptions {
  const args = process.argv.slice(2);
  const options: ListOptions = {
    limit: 20,
    offset: 0,
    orderBy: 'created_at',
    orderDir: 'desc',
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      switch (key) {
        case 'status':
          options.status = value;
          break;
        case 'priority':
          options.priority = value;
          break;
        case 'limit':
          options.limit = parseInt(value, 10);
          break;
        case 'offset':
          options.offset = parseInt(value, 10);
          break;
        case 'search':
          options.search = value;
          break;
        case 'order':
          options.orderBy = value;
          break;
        case 'dir':
          options.orderDir = value as 'asc' | 'desc';
          break;
      }
    }
  });
  
  return options;
}

async function listServiceRequests(): Promise<void> {
  printHeader('LISTAGEM DE ORDENS DE SERVIÇO', icons.list);
  
  const options = parseArgs();
  const supabase = createSupabaseClient();
  
  // Mostrar filtros ativos
  printSection('Filtros Ativos', '🔍');
  console.log(`  ${colors.dim}Status:${colors.reset} ${options.status || 'Todos'}`);
  console.log(`  ${colors.dim}Prioridade:${colors.reset} ${options.priority || 'Todas'}`);
  console.log(`  ${colors.dim}Limite:${colors.reset} ${options.limit}`);
  console.log(`  ${colors.dim}Ordenar por:${colors.reset} ${options.orderBy} (${options.orderDir})`);
  if (options.search) {
    console.log(`  ${colors.dim}Busca:${colors.reset} "${options.search}"`);
  }
  
  try {
    // Construir query
    let query = supabase
      .from('service_requests')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.priority) {
      query = query.eq('priority', options.priority);
    }
    
    if (options.search) {
      query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }
    
    // Ordenação e paginação
    query = query
      .order(options.orderBy || 'created_at', { ascending: options.orderDir === 'asc' })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      logError(`Erro ao listar: ${error.message}`);
      return;
    }
    
    if (!data || data.length === 0) {
      logWarning('Nenhuma ordem de serviço encontrada');
      printEmptyState();
      return;
    }
    
    // Mostrar contagem
    printSection(`Resultados (${data.length} de ${count || 0})`, icons.chart);
    
    // Listar cada ordem
    data.forEach((request: ServiceRequest, index: number) => {
      printServiceRequest(request, index + 1 + (options.offset || 0));
    });
    
    // Mostrar paginação
    if (count && count > (options.limit || 20)) {
      printPagination(options.offset || 0, options.limit || 20, count);
    }
    
    // Resumo por status
    printStatusSummary(data);
    
  } catch (err) {
    logError(`Erro inesperado: ${err instanceof Error ? err.message : 'Desconhecido'}`);
  }
}

function printServiceRequest(request: ServiceRequest, index: number): void {
  const statusInfo = STATUS_LABELS[request.status] || STATUS_LABELS.pending;
  const priorityInfo = PRIORITY_LABELS[request.priority] || PRIORITY_LABELS.normal;
  
  console.log(`\n${colors.cyan}${createLine('─', 60)}${colors.reset}`);
  console.log(`${colors.bright}#${index}${colors.reset} ${colors.dim}ID: ${request.id.slice(0, 8)}...${colors.reset}`);
  console.log(`${colors.cyan}${createLine('─', 60)}${colors.reset}`);
  
  // Status e Prioridade
  console.log(`  ${statusInfo.icon} ${statusInfo.color}${statusInfo.label}${colors.reset}  ${priorityInfo.icon} ${priorityInfo.color}${priorityInfo.label}${colors.reset}`);
  
  // Dados do cliente
  console.log(`\n  ${colors.bright}👤 Cliente:${colors.reset}`);
  console.log(`     Nome: ${request.first_name} ${request.last_name}`);
  console.log(`     Email: ${colors.cyan}${request.email}${colors.reset}`);
  console.log(`     Telefone: ${formatPhone(request.phone)}`);
  
  // Serviço
  console.log(`\n  ${colors.bright}🔧 Serviço:${colors.reset}`);
  console.log(`     Tipo: ${colors.yellow}${request.service_type}${colors.reset}`);
  
  // Descrição (truncada)
  const maxDescLength = 100;
  const truncatedDesc = request.description.length > maxDescLength 
    ? request.description.slice(0, maxDescLength) + '...' 
    : request.description;
  console.log(`     Descrição: ${colors.dim}${truncatedDesc}${colors.reset}`);
  
  // Metadados
  if (request.assigned_to || request.estimated_value) {
    console.log(`\n  ${colors.bright}📋 Detalhes:${colors.reset}`);
    if (request.assigned_to) {
      console.log(`     Responsável: ${request.assigned_to}`);
    }
    if (request.estimated_value) {
      console.log(`     Valor Estimado: ${formatCurrency(request.estimated_value)}`);
    }
  }
  
  if (request.notes) {
    console.log(`     Notas: ${colors.dim}${request.notes}${colors.reset}`);
  }
  
  // Timestamps
  console.log(`\n  ${colors.bright}🕐 Datas:${colors.reset}`);
  console.log(`     Criado: ${formatDate(request.created_at)}`);
  console.log(`     Atualizado: ${formatDate(request.updated_at)}`);
  if (request.completed_at) {
    console.log(`     Concluído: ${colors.green}${formatDate(request.completed_at)}${colors.reset}`);
  }
}

function printEmptyState(): void {
  console.log(`\n${colors.dim}${createLine('─', 40)}${colors.reset}`);
  console.log(`${colors.dim}📭 Nenhuma ordem de serviço encontrada${colors.reset}`);
  console.log(`${colors.dim}${createLine('─', 40)}${colors.reset}`);
  console.log(`\n${colors.dim}Dicas:${colors.reset}`);
  console.log(`  ${icons.arrow} Remova filtros para ver todos os registros`);
  console.log(`  ${icons.arrow} Use --status=pending para filtrar por status`);
  console.log(`  ${icons.arrow} Use --search=termo para buscar`);
}

function printPagination(offset: number, limit: number, total: number): void {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  console.log(`\n${colors.dim}${createLine('─', 40)}${colors.reset}`);
  console.log(`${colors.dim}📄 Página ${currentPage} de ${totalPages}${colors.reset}`);
  
  if (currentPage < totalPages) {
    console.log(`${colors.dim}   Próxima: npm run db:list -- --offset=${offset + limit}${colors.reset}`);
  }
  if (currentPage > 1) {
    console.log(`${colors.dim}   Anterior: npm run db:list -- --offset=${Math.max(0, offset - limit)}${colors.reset}`);
  }
}

function printStatusSummary(data: ServiceRequest[]): void {
  const statusCounts: Record<string, number> = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
  
  data.forEach(request => {
    if (statusCounts[request.status] !== undefined) {
      statusCounts[request.status]++;
    }
  });
  
  printSection('Resumo por Status', icons.chart);
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > 0) {
      const info = STATUS_LABELS[status];
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`  ${info.icon} ${info.label.padEnd(15)} ${colors.dim}${bar}${colors.reset} ${count}`);
    }
  });
  
  console.log(`\n${colors.dim}${createLine('─', 60)}${colors.reset}`);
  console.log(`${colors.dim}Listagem concluída em ${formatDate(new Date())}${colors.reset}\n`);
}

// Executar
listServiceRequests().catch(console.error);
