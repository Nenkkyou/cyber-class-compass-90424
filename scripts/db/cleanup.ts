#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB CLEANUP - Limpar Dados Problemáticos
 * ============================================
 * Remove ou corrige dados com problemas de integridade
 * 
 * Uso: npm run db:cleanup
 *      npm run db:cleanup -- --dry-run
 *      npm run db:cleanup -- --fix-status
 *      npm run db:cleanup -- --remove-old=30
 */

import * as readline from 'readline';
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
  ServiceRequest,
} from './config';

interface CleanupOptions {
  dryRun: boolean;
  fixStatus: boolean;
  fixPriority: boolean;
  removeOld: number | null; // dias
  removeOrphans: boolean;
  removeCancelled: boolean;
}

interface CleanupReport {
  invalidStatus: ServiceRequest[];
  invalidPriority: ServiceRequest[];
  invalidEmail: ServiceRequest[];
  oldRecords: ServiceRequest[];
  cancelledRecords: ServiceRequest[];
  duplicates: ServiceRequest[];
}

function parseArgs(): CleanupOptions {
  const args = process.argv.slice(2);
  const options: CleanupOptions = {
    dryRun: false,
    fixStatus: false,
    fixPriority: false,
    removeOld: null,
    removeOrphans: false,
    removeCancelled: false,
  };
  
  args.forEach(arg => {
    if (arg === '--dry-run') options.dryRun = true;
    if (arg === '--fix-status') options.fixStatus = true;
    if (arg === '--fix-priority') options.fixPriority = true;
    if (arg === '--remove-orphans') options.removeOrphans = true;
    if (arg === '--remove-cancelled') options.removeCancelled = true;
    if (arg.startsWith('--remove-old=')) {
      options.removeOld = parseInt(arg.slice(13), 10);
    }
  });
  
  return options;
}

async function runCleanup(): Promise<void> {
  printHeader('LIMPEZA E MANUTENÇÃO DO BANCO', icons.cleanup);
  
  const options = parseArgs();
  const supabase = createSupabaseClient();
  
  if (options.dryRun) {
    console.log(`${colors.yellow}${icons.warning} MODO DRY-RUN: Nenhuma alteração será feita${colors.reset}\n`);
  }
  
  try {
    // Buscar todos os dados
    printSection('Analisando Dados', icons.working);
    
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      logError(`Erro ao buscar dados: ${error.message}`);
      return;
    }
    
    if (!data || data.length === 0) {
      logInfo('Nenhum dado para analisar');
      return;
    }
    
    console.log(`  ${icons.success} ${data.length} registros encontrados`);
    
    // Gerar relatório
    const report = analyzeData(data, options);
    printReport(report);
    
    // Se não há problemas
    const totalIssues = 
      report.invalidStatus.length +
      report.invalidPriority.length +
      report.invalidEmail.length +
      report.oldRecords.length +
      report.cancelledRecords.length +
      report.duplicates.length;
    
    if (totalIssues === 0) {
      logSuccess('Nenhum problema encontrado! Banco de dados está limpo.');
      return;
    }
    
    // Perguntar se deseja continuar (se não for dry-run)
    if (!options.dryRun) {
      const confirmed = await confirmCleanup(report);
      if (!confirmed) {
        logWarning('Limpeza cancelada pelo usuário');
        return;
      }
      
      // Executar limpeza
      await executeCleanup(report, options);
    }
    
  } catch (err) {
    logError(`Erro inesperado: ${err instanceof Error ? err.message : 'Desconhecido'}`);
  }
  
  console.log(`\n${colors.dim}${createLine('─', 60)}${colors.reset}\n`);
}

function analyzeData(data: ServiceRequest[], options: CleanupOptions): CleanupReport {
  const report: CleanupReport = {
    invalidStatus: [],
    invalidPriority: [],
    invalidEmail: [],
    oldRecords: [],
    cancelledRecords: [],
    duplicates: [],
  };
  
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailsSeen = new Set<string>();
  
  data.forEach(record => {
    // Verificar status inválido
    if (!validStatuses.includes(record.status)) {
      report.invalidStatus.push(record);
    }
    
    // Verificar prioridade inválida
    if (!validPriorities.includes(record.priority)) {
      report.invalidPriority.push(record);
    }
    
    // Verificar email inválido
    if (!record.email || !emailRegex.test(record.email)) {
      report.invalidEmail.push(record);
    }
    
    // Verificar registros antigos
    if (options.removeOld) {
      const createdAt = new Date(record.created_at);
      const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld > options.removeOld && record.status === 'completed') {
        report.oldRecords.push(record);
      }
    }
    
    // Verificar cancelados
    if (options.removeCancelled && record.status === 'cancelled') {
      report.cancelledRecords.push(record);
    }
    
    // Verificar duplicados (mesmo email + mesmo serviço no mesmo dia)
    const key = `${record.email}-${record.service_type}-${new Date(record.created_at).toDateString()}`;
    if (emailsSeen.has(key)) {
      report.duplicates.push(record);
    } else {
      emailsSeen.add(key);
    }
  });
  
  return report;
}

function printReport(report: CleanupReport): void {
  printSection('Relatório de Problemas', icons.chart);
  
  const issues = [
    { label: 'Status inválido', count: report.invalidStatus.length, icon: '⚠️' },
    { label: 'Prioridade inválida', count: report.invalidPriority.length, icon: '⚠️' },
    { label: 'Email inválido', count: report.invalidEmail.length, icon: '📧' },
    { label: 'Registros antigos', count: report.oldRecords.length, icon: '📅' },
    { label: 'Cancelados', count: report.cancelledRecords.length, icon: '❌' },
    { label: 'Duplicados', count: report.duplicates.length, icon: '📋' },
  ];
  
  issues.forEach(issue => {
    const color = issue.count > 0 ? colors.yellow : colors.green;
    const statusIcon = issue.count > 0 ? icons.warning : icons.success;
    console.log(`  ${issue.icon} ${issue.label.padEnd(25)} ${color}${issue.count}${colors.reset} ${statusIcon}`);
  });
  
  // Detalhes dos problemas
  if (report.invalidStatus.length > 0) {
    console.log(`\n  ${colors.dim}Status inválidos encontrados:${colors.reset}`);
    report.invalidStatus.slice(0, 3).forEach(r => {
      console.log(`    ${icons.arrow} ${r.id.slice(0, 8)}... - Status: "${r.status}"`);
    });
    if (report.invalidStatus.length > 3) {
      console.log(`    ${colors.dim}... e mais ${report.invalidStatus.length - 3}${colors.reset}`);
    }
  }
  
  if (report.invalidEmail.length > 0) {
    console.log(`\n  ${colors.dim}Emails inválidos encontrados:${colors.reset}`);
    report.invalidEmail.slice(0, 3).forEach(r => {
      console.log(`    ${icons.arrow} ${r.id.slice(0, 8)}... - Email: "${r.email}"`);
    });
    if (report.invalidEmail.length > 3) {
      console.log(`    ${colors.dim}... e mais ${report.invalidEmail.length - 3}${colors.reset}`);
    }
  }
  
  if (report.duplicates.length > 0) {
    console.log(`\n  ${colors.dim}Possíveis duplicados:${colors.reset}`);
    report.duplicates.slice(0, 3).forEach(r => {
      console.log(`    ${icons.arrow} ${r.first_name} ${r.last_name} - ${r.email}`);
    });
    if (report.duplicates.length > 3) {
      console.log(`    ${colors.dim}... e mais ${report.duplicates.length - 3}${colors.reset}`);
    }
  }
}

async function confirmCleanup(report: CleanupReport): Promise<boolean> {
  const totalActions = 
    report.invalidStatus.length +
    report.invalidPriority.length +
    report.oldRecords.length +
    report.cancelledRecords.length +
    report.duplicates.length;
  
  if (totalActions === 0) {
    return false;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  console.log(`\n${colors.yellow}${icons.warning} Ações que serão executadas:${colors.reset}`);
  
  if (report.invalidStatus.length > 0) {
    console.log(`  ${icons.arrow} Corrigir ${report.invalidStatus.length} status inválidos → "pending"`);
  }
  if (report.invalidPriority.length > 0) {
    console.log(`  ${icons.arrow} Corrigir ${report.invalidPriority.length} prioridades inválidas → "normal"`);
  }
  if (report.oldRecords.length > 0) {
    console.log(`  ${icons.arrow} Remover ${report.oldRecords.length} registros antigos`);
  }
  if (report.cancelledRecords.length > 0) {
    console.log(`  ${icons.arrow} Remover ${report.cancelledRecords.length} registros cancelados`);
  }
  if (report.duplicates.length > 0) {
    console.log(`  ${icons.arrow} Remover ${report.duplicates.length} registros duplicados`);
  }
  
  return new Promise((resolve) => {
    rl.question(`\n${colors.yellow}Deseja executar a limpeza? (s/N): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
    });
  });
}

async function executeCleanup(report: CleanupReport, options: CleanupOptions): Promise<void> {
  printSection('Executando Limpeza', icons.working);
  
  const supabase = createSupabaseClient(true);
  
  let fixed = 0;
  let removed = 0;
  let errors = 0;
  
  // Corrigir status inválidos
  for (const record of report.invalidStatus) {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'pending' })
        .eq('id', record.id);
      
      if (error) errors++;
      else fixed++;
    } catch (e) {
      errors++;
    }
  }
  
  // Corrigir prioridades inválidas
  for (const record of report.invalidPriority) {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ priority: 'normal' })
        .eq('id', record.id);
      
      if (error) errors++;
      else fixed++;
    } catch (e) {
      errors++;
    }
  }
  
  // Remover registros antigos
  if (options.removeOld) {
    for (const record of report.oldRecords) {
      try {
        const { error } = await supabase
          .from('service_requests')
          .delete()
          .eq('id', record.id);
        
        if (error) errors++;
        else removed++;
      } catch (e) {
        errors++;
      }
    }
  }
  
  // Remover cancelados
  if (options.removeCancelled) {
    for (const record of report.cancelledRecords) {
      try {
        const { error } = await supabase
          .from('service_requests')
          .delete()
          .eq('id', record.id);
        
        if (error) errors++;
        else removed++;
      } catch (e) {
        errors++;
      }
    }
  }
  
  // Remover duplicados
  for (const record of report.duplicates) {
    try {
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', record.id);
      
      if (error) errors++;
      else removed++;
    } catch (e) {
      errors++;
    }
  }
  
  // Resultado
  printSection('Resultado da Limpeza', icons.chart);
  
  console.log(`  ${colors.green}${icons.success} Corrigidos: ${fixed}${colors.reset}`);
  console.log(`  ${colors.yellow}${icons.warning} Removidos: ${removed}${colors.reset}`);
  
  if (errors > 0) {
    console.log(`  ${colors.red}${icons.error} Erros: ${errors}${colors.reset}`);
  }
  
  logSuccess('Limpeza concluída!');
}

// Executar
runCleanup().catch(console.error);
