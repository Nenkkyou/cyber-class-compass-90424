#!/usr/bin/env npx ts-node
/**
 * ============================================
 * DB BACKUP - Sistema de Backup
 * ============================================
 * Exporta dados para arquivo JSON com metadados
 * 
 * Uso: npm run db:backup
 *      npm run db:backup -- --output=backup_custom.json
 */

import * as fs from 'fs';
import * as path from 'path';
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

function parseArgs(): { output: string } {
  const args = process.argv.slice(2);
  let output = `backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now()}.json`;
  
  args.forEach(arg => {
    if (arg.startsWith('--output=')) {
      output = arg.slice(9);
    }
  });
  
  return { output };
}

async function createBackup(): Promise<void> {
  printHeader('SISTEMA DE BACKUP', icons.backup);
  
  const { output } = parseArgs();
  const backupDir = path.join(process.cwd(), 'backups');
  const backupPath = path.join(backupDir, output);
  
  try {
    // Criar diretório de backups se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logInfo(`Diretório de backups criado: ${backupDir}`);
    }
    
    printSection('Iniciando Backup', icons.working);
    console.log(`  ${colors.dim}Destino: ${backupPath}${colors.reset}`);
    
    const supabase = createSupabaseClient();
    
    // Buscar todos os dados
    console.log(`\n  ${icons.working} Buscando dados...`);
    
    const { data: serviceRequests, error, count } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (error) {
      logError(`Erro ao buscar dados: ${error.message}`);
      return;
    }
    
    console.log(`  ${icons.success} ${count || 0} registros encontrados`);
    
    // Criar estrutura de backup
    const backupData: BackupData = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: 'CyberClass DB Manager',
        projectId: 'avdfdxeywszdzrsifivq',
        environment: process.env.NODE_ENV || 'development',
        tables: [
          { name: 'service_requests', count: count || 0 },
        ],
        checksum: '', // Será preenchido depois
      },
      data: {
        service_requests: serviceRequests || [],
      },
    };
    
    // Calcular checksum simples
    const dataString = JSON.stringify(backupData.data);
    backupData.metadata.checksum = simpleHash(dataString);
    
    // Mostrar progresso
    printSection('Salvando Backup', icons.backup);
    
    // Simular progresso
    for (let i = 0; i <= 100; i += 20) {
      process.stdout.write(`\r  ${createProgressBar(i, 100)}`);
      await sleep(100);
    }
    console.log();
    
    // Salvar arquivo
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    
    // Estatísticas do backup
    const stats = fs.statSync(backupPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    printSection('Backup Concluído', icons.success);
    
    console.log(`\n  ${colors.green}${icons.success} Backup criado com sucesso!${colors.reset}`);
    console.log(`\n  ${colors.bright}Detalhes do Backup:${colors.reset}`);
    console.log(`  ${icons.arrow} Arquivo: ${colors.cyan}${output}${colors.reset}`);
    console.log(`  ${icons.arrow} Tamanho: ${sizeKB} KB`);
    console.log(`  ${icons.arrow} Registros: ${count || 0}`);
    console.log(`  ${icons.arrow} Checksum: ${backupData.metadata.checksum.slice(0, 16)}...`);
    console.log(`  ${icons.arrow} Data: ${formatDate(new Date())}`);
    
    // Listar backups existentes
    printExistingBackups(backupDir);
    
  } catch (err) {
    logError(`Erro ao criar backup: ${err instanceof Error ? err.message : 'Desconhecido'}`);
  }
  
  console.log(`\n${colors.dim}${createLine('─', 60)}${colors.reset}\n`);
}

function printExistingBackups(backupDir: string): void {
  try {
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
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
    
    if (files.length > 0) {
      printSection('Backups Recentes', '📁');
      
      files.forEach((file, index) => {
        const sizeKB = (file.size / 1024).toFixed(2);
        const isLatest = index === 0;
        const prefix = isLatest ? `${colors.green}${icons.star}` : `${colors.dim}${icons.dot}`;
        
        console.log(`  ${prefix} ${file.name}${colors.reset}`);
        console.log(`     ${colors.dim}${sizeKB} KB - ${formatDate(file.date)}${colors.reset}`);
      });
      
      console.log(`\n  ${colors.dim}Total de backups: ${files.length}${colors.reset}`);
    }
  } catch (err) {
    // Ignorar erro ao listar backups
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
createBackup().catch(console.error);
