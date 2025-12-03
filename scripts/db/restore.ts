#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB RESTORE - Restaurar Backup
 * ============================================
 * Restaura dados de um arquivo de backup JSON
 * 
 * Uso: npm run db:restore
 *      npm run db:restore -- --file=backup_20251203.json
 *      npm run db:restore -- --file=backup.json --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
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
  ServiceRequest,
  SUPABASE_SERVICE_KEY,
} from './config';

interface BackupMetadata {
  version: string;
  createdAt: string;
  createdBy: string;
  projectId: string;
  environment: string;
  tables: {
    name: string;
    count: number;
  }[];
  checksum: string;
}

interface BackupData {
  metadata: BackupMetadata;
  data: {
    service_requests: ServiceRequest[];
  };
}

interface RestoreOptions {
  file?: string;
  dryRun: boolean;
  force: boolean;
}

function parseArgs(): RestoreOptions {
  const args = process.argv.slice(2);
  const options: RestoreOptions = {
    dryRun: false,
    force: false,
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--file=')) {
      options.file = arg.slice(7);
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
    }
    if (arg === '--force') {
      options.force = true;
    }
  });
  
  return options;
}

async function restoreBackup(): Promise<void> {
  printHeader('RESTAURAÇÃO DE BACKUP', icons.restore);
  
  const options = parseArgs();
  const backupDir = path.join(process.cwd(), 'backups');
  
  try {
    // Se não especificou arquivo, listar disponíveis
    if (!options.file) {
      const selectedFile = await selectBackupFile(backupDir);
      if (!selectedFile) {
        logWarning('Nenhum arquivo selecionado. Operação cancelada.');
        return;
      }
      options.file = selectedFile;
    }
    
    const backupPath = path.join(backupDir, options.file);
    
    // Verificar se arquivo existe
    if (!fs.existsSync(backupPath)) {
      logError(`Arquivo não encontrado: ${backupPath}`);
      return;
    }
    
    printSection('Analisando Backup', icons.working);
    console.log(`  ${colors.dim}Arquivo: ${options.file}${colors.reset}`);
    
    // Ler e validar backup
    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    let backupData: BackupData;
    
    try {
      backupData = JSON.parse(backupContent);
    } catch (e) {
      logError('Arquivo de backup inválido ou corrompido');
      return;
    }
    
    // Validar estrutura
    if (!backupData.metadata || !backupData.data) {
      logError('Estrutura de backup inválida');
      return;
    }
    
    // Mostrar informações do backup
    printBackupInfo(backupData);
    
    // Verificar checksum
    const dataString = JSON.stringify(backupData.data);
    const currentChecksum = simpleHash(dataString);
    
    if (currentChecksum !== backupData.metadata.checksum) {
      logWarning('Checksum não corresponde - arquivo pode estar corrompido');
      if (!options.force) {
        console.log(`  ${colors.dim}Use --force para restaurar mesmo assim${colors.reset}`);
        return;
      }
    } else {
      logSuccess('Checksum verificado com sucesso');
    }
    
    // Modo dry-run
    if (options.dryRun) {
      printSection('Modo Dry-Run (Simulação)', icons.info);
      console.log(`  ${colors.yellow}Nenhuma alteração será feita${colors.reset}`);
      console.log(`  ${colors.dim}Registros que seriam restaurados: ${backupData.data.service_requests.length}${colors.reset}`);
      return;
    }
    
    // Confirmar restauração
    if (!options.force) {
      const confirmed = await confirmRestore(backupData);
      if (!confirmed) {
        logWarning('Restauração cancelada pelo usuário');
        return;
      }
    }
    
    // Executar restauração
    await executeRestore(backupData);
    
  } catch (err) {
    logError(`Erro ao restaurar backup: ${err instanceof Error ? err.message : 'Desconhecido'}`);
  }
  
  console.log(`\n${colors.dim}${createLine('─', 60)}${colors.reset}\n`);
}

async function selectBackupFile(backupDir: string): Promise<string | null> {
  if (!fs.existsSync(backupDir)) {
    logError('Diretório de backups não encontrado');
    return null;
  }
  
  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const stats = fs.statSync(path.join(backupDir, f));
      return {
        name: f,
        size: stats.size,
        date: stats.mtime,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  if (files.length === 0) {
    logError('Nenhum arquivo de backup encontrado');
    return null;
  }
  
  printSection('Backups Disponíveis', '📁');
  
  files.forEach((file, index) => {
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`  ${colors.cyan}[${index + 1}]${colors.reset} ${file.name}`);
    console.log(`      ${colors.dim}${sizeKB} KB - ${formatDate(file.date)}${colors.reset}`);
  });
  
  console.log(`\n  ${colors.dim}[0] Cancelar${colors.reset}`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`\n${colors.yellow}Selecione o backup (1-${files.length}): ${colors.reset}`, (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      
      if (isNaN(index) || index < 0 || index >= files.length) {
        resolve(null);
      } else {
        resolve(files[index].name);
      }
    });
  });
}

function printBackupInfo(backupData: BackupData): void {
  const { metadata } = backupData;
  
  console.log(`\n  ${colors.bright}Informações do Backup:${colors.reset}`);
  console.log(`  ${icons.arrow} Versão: ${metadata.version}`);
  console.log(`  ${icons.arrow} Criado em: ${formatDate(metadata.createdAt)}`);
  console.log(`  ${icons.arrow} Criado por: ${metadata.createdBy}`);
  console.log(`  ${icons.arrow} Ambiente: ${metadata.environment}`);
  console.log(`  ${icons.arrow} Projeto: ${metadata.projectId}`);
  
  console.log(`\n  ${colors.bright}Tabelas:${colors.reset}`);
  metadata.tables.forEach(table => {
    console.log(`  ${icons.arrow} ${table.name}: ${table.count} registros`);
  });
}

async function confirmRestore(backupData: BackupData): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  console.log(`\n${colors.yellow}${icons.warning} ATENÇÃO: Esta operação irá ADICIONAR dados ao banco!${colors.reset}`);
  console.log(`${colors.dim}Registros duplicados serão ignorados (baseado no ID).${colors.reset}`);
  
  return new Promise((resolve) => {
    rl.question(`\n${colors.yellow}Deseja continuar? (s/N): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
    });
  });
}

async function executeRestore(backupData: BackupData): Promise<void> {
  printSection('Executando Restauração', icons.working);
  
  const supabase = createSupabaseClient(true); // Usar service role
  const requests = backupData.data.service_requests;
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  console.log(`\n  ${colors.dim}Restaurando ${requests.length} registros...${colors.reset}`);
  
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    
    // Mostrar progresso
    process.stdout.write(`\r  ${createProgressBar(i + 1, requests.length)} ${i + 1}/${requests.length}`);
    
    try {
      // Tentar inserir (upsert para evitar duplicatas)
      const { error } = await supabase
        .from('service_requests')
        .upsert(request, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        });
      
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          skipped++;
        } else {
          errors++;
        }
      } else {
        inserted++;
      }
    } catch (err) {
      errors++;
    }
    
    // Pequeno delay para não sobrecarregar
    await sleep(50);
  }
  
  console.log('\n');
  
  // Resultado
  printSection('Resultado da Restauração', icons.chart);
  
  console.log(`  ${colors.green}${icons.success} Inseridos: ${inserted}${colors.reset}`);
  console.log(`  ${colors.yellow}${icons.warning} Ignorados (duplicados): ${skipped}${colors.reset}`);
  
  if (errors > 0) {
    console.log(`  ${colors.red}${icons.error} Erros: ${errors}${colors.reset}`);
  }
  
  if (inserted > 0) {
    logSuccess('Restauração concluída com sucesso!');
  } else if (skipped === requests.length) {
    logInfo('Todos os registros já existem no banco');
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar
restoreBackup().catch(console.error);
