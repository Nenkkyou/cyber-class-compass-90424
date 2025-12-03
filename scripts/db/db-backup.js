#!/usr/bin/env node
/**
 * ============================================================
 * CYBERCLASS - Sistema de Backup
 * ============================================================
 * Comando: npm run db:backup
 * 
 * Cria backups completos do banco de dados:
 * - Backup de todas as tabelas
 * - Compressão opcional
 * - Rotação automática de backups antigos
 * - Registro de histórico
 */

import { writeFileSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';
import readline from 'readline';
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
  printLoading,
  printProgress,
  formatDate,
  formatDateForFile,
  formatBytes,
  formatDuration,
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
// CLASSE DE BACKUP
// ============================================================

class BackupManager {
  constructor() {
    this.supabase = createAnonClient();
    this.startTime = null;
    this.stats = {
      tables: [],
      totalRecords: 0,
      totalSize: 0,
    };
  }
  
  /**
   * Lista as tabelas disponíveis para backup
   */
  getBackupTables() {
    return [
      { name: 'service_requests', description: 'Solicitações de Serviço' },
      { name: 'system_backups', description: 'Histórico de Backups' },
      { name: 'system_logs', description: 'Logs do Sistema' },
    ];
  }
  
  /**
   * Faz backup de uma tabela específica
   */
  async backupTable(tableName) {
    const { data, error, count } = await this.supabase
      .from(tableName)
      .select('*', { count: 'exact' });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        return { exists: false, data: [], count: 0 };
      }
      throw error;
    }
    
    return { exists: true, data: data || [], count: count || 0 };
  }
  
  /**
   * Cria backup completo
   */
  async createFullBackup(compress = true) {
    this.startTime = Date.now();
    const timestamp = formatDateForFile();
    const tables = this.getBackupTables();
    
    printHeader('Sistema de Backup', icons.backup);
    
    console.log(`${icons.loading} Iniciando backup completo...\n`);
    console.log(`${colors.dim}Timestamp: ${timestamp}${colors.reset}`);
    console.log(`${colors.dim}Compressão: ${compress ? 'Ativada' : 'Desativada'}${colors.reset}\n`);
    
    ensureDirectories();
    
    const backupData = {
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        type: 'full',
        tables: [],
      },
      data: {},
    };
    
    // Backup de cada tabela
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      printProgress(i, tables.length, `Backup ${table.name}`);
      
      try {
        const result = await this.backupTable(table.name);
        
        if (result.exists) {
          backupData.data[table.name] = result.data;
          backupData.metadata.tables.push({
            name: table.name,
            description: table.description,
            records: result.count,
            backedUp: true,
          });
          
          this.stats.tables.push({
            name: table.name,
            records: result.count,
            status: 'success',
          });
          this.stats.totalRecords += result.count;
        } else {
          backupData.metadata.tables.push({
            name: table.name,
            description: table.description,
            records: 0,
            backedUp: false,
            reason: 'Tabela não existe',
          });
          
          this.stats.tables.push({
            name: table.name,
            records: 0,
            status: 'skipped',
          });
        }
      } catch (error) {
        backupData.metadata.tables.push({
          name: table.name,
          description: table.description,
          records: 0,
          backedUp: false,
          reason: error.message,
        });
        
        this.stats.tables.push({
          name: table.name,
          records: 0,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    printProgress(tables.length, tables.length, 'Backup concluído');
    console.log('');
    
    // Salvar arquivo de backup
    let filename, filepath, fileSize;
    
    const jsonData = JSON.stringify(backupData, null, 2);
    
    if (compress) {
      filename = `backup_${timestamp}.json.gz`;
      filepath = join(config.paths.backups, filename);
      const compressed = gzipSync(Buffer.from(jsonData));
      writeFileSync(filepath, compressed);
      fileSize = compressed.length;
    } else {
      filename = `backup_${timestamp}.json`;
      filepath = join(config.paths.backups, filename);
      writeFileSync(filepath, jsonData);
      fileSize = Buffer.byteLength(jsonData);
    }
    
    this.stats.totalSize = fileSize;
    
    // Registrar backup no banco (se a tabela existir)
    try {
      await this.supabase.from('system_backups').insert({
        backup_name: filename,
        backup_type: 'full',
        file_path: filepath,
        file_size: fileSize,
        records_count: this.stats.totalRecords,
        notes: `Backup automático via CLI`,
      });
    } catch (e) {
      // Ignorar erro se tabela não existir
    }
    
    // Exibir resumo
    this.displaySummary(filename, filepath);
    
    // Limpar backups antigos
    if (config.backup.autoCleanup) {
      await this.cleanupOldBackups();
    }
    
    return { filename, filepath, stats: this.stats };
  }
  
  /**
   * Cria backup apenas de solicitações de serviço
   */
  async createServiceRequestsBackup(compress = true) {
    this.startTime = Date.now();
    const timestamp = formatDateForFile();
    
    printHeader('Backup de Solicitações', icons.backup);
    
    console.log(`${icons.loading} Iniciando backup de solicitações...\n`);
    
    ensureDirectories();
    
    try {
      const result = await this.backupTable('service_requests');
      
      if (!result.exists) {
        printWarning('Tabela service_requests não existe.');
        return null;
      }
      
      const backupData = {
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          type: 'service_requests',
          records: result.count,
        },
        data: result.data,
      };
      
      const jsonData = JSON.stringify(backupData, null, 2);
      let filename, filepath, fileSize;
      
      if (compress) {
        filename = `service_requests_${timestamp}.json.gz`;
        filepath = join(config.paths.backups, filename);
        const compressed = gzipSync(Buffer.from(jsonData));
        writeFileSync(filepath, compressed);
        fileSize = compressed.length;
      } else {
        filename = `service_requests_${timestamp}.json`;
        filepath = join(config.paths.backups, filename);
        writeFileSync(filepath, jsonData);
        fileSize = Buffer.byteLength(jsonData);
      }
      
      this.stats.tables.push({
        name: 'service_requests',
        records: result.count,
        status: 'success',
      });
      this.stats.totalRecords = result.count;
      this.stats.totalSize = fileSize;
      
      this.displaySummary(filename, filepath);
      
      return { filename, filepath, stats: this.stats };
      
    } catch (error) {
      printError(`Erro no backup: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Exibe resumo do backup
   */
  displaySummary(filename, filepath) {
    const duration = Date.now() - this.startTime;
    
    printSeparator('═', 58);
    console.log(`\n${colors.bright}${icons.success} BACKUP CONCLUÍDO COM SUCESSO${colors.reset}\n`);
    
    console.log(`${colors.bright}Arquivo:${colors.reset} ${filename}`);
    console.log(`${colors.bright}Caminho:${colors.reset} ${filepath}`);
    console.log(`${colors.bright}Tamanho:${colors.reset} ${formatBytes(this.stats.totalSize)}`);
    console.log(`${colors.bright}Registros:${colors.reset} ${this.stats.totalRecords}`);
    console.log(`${colors.bright}Duração:${colors.reset} ${formatDuration(duration)}`);
    
    console.log(`\n${colors.bright}Detalhes por tabela:${colors.reset}`);
    this.stats.tables.forEach(table => {
      let statusIcon;
      switch (table.status) {
        case 'success':
          statusIcon = `${colors.green}${icons.success}${colors.reset}`;
          break;
        case 'skipped':
          statusIcon = `${colors.yellow}⏭️${colors.reset}`;
          break;
        case 'error':
          statusIcon = `${colors.red}${icons.error}${colors.reset}`;
          break;
      }
      
      console.log(`  ${statusIcon} ${table.name}: ${table.records} registros`);
      if (table.error) {
        console.log(`     ${colors.red}Erro: ${table.error}${colors.reset}`);
      }
    });
    
    console.log('');
  }
  
  /**
   * Lista backups existentes
   */
  listBackups() {
    ensureDirectories();
    
    try {
      const files = readdirSync(config.paths.backups)
        .filter(f => f.startsWith('backup_') || f.startsWith('service_requests_'))
        .map(f => {
          const stats = statSync(join(config.paths.backups, f));
          return {
            name: f,
            size: stats.size,
            created: stats.mtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());
      
      return files;
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Limpa backups antigos
   */
  async cleanupOldBackups() {
    const backups = this.listBackups();
    
    if (backups.length <= config.backup.maxBackups) {
      return 0;
    }
    
    const toDelete = backups.slice(config.backup.maxBackups);
    
    console.log(`\n${icons.cleanup} Limpando ${toDelete.length} backups antigos...`);
    
    toDelete.forEach(backup => {
      try {
        unlinkSync(join(config.paths.backups, backup.name));
        console.log(`  ${icons.check} Removido: ${backup.name}`);
      } catch (error) {
        console.log(`  ${icons.cross} Erro ao remover: ${backup.name}`);
      }
    });
    
    return toDelete.length;
  }
  
  /**
   * Menu interativo de backup
   */
  async showMenu() {
    printHeader('Sistema de Backup', icons.backup);
    
    // Listar backups existentes
    const backups = this.listBackups();
    
    console.log(`${colors.bright}${icons.list} Backups Existentes: ${backups.length}${colors.reset}\n`);
    
    if (backups.length > 0) {
      const recent = backups.slice(0, 5);
      recent.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.name}`);
        console.log(`     ${colors.dim}Tamanho: ${formatBytes(b.size)} | Criado: ${formatDate(b.created)}${colors.reset}`);
      });
      
      if (backups.length > 5) {
        console.log(`\n  ${colors.dim}... e mais ${backups.length - 5} backups${colors.reset}`);
      }
    } else {
      console.log(`  ${colors.dim}Nenhum backup encontrado.${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}Opções:${colors.reset}`);
    console.log('  [1] Backup Completo (todas as tabelas)');
    console.log('  [2] Backup de Solicitações de Serviço');
    console.log('  [3] Listar Todos os Backups');
    console.log('  [4] Limpar Backups Antigos');
    console.log('  [0] Sair');
    
    const choice = await question(`\n${icons.arrow} Escolha: `);
    
    switch (choice.trim()) {
      case '1':
        const compress1 = await question('Comprimir backup? [S/n]: ');
        await this.createFullBackup(compress1.toLowerCase() !== 'n');
        break;
        
      case '2':
        const compress2 = await question('Comprimir backup? [S/n]: ');
        await this.createServiceRequestsBackup(compress2.toLowerCase() !== 'n');
        break;
        
      case '3':
        this.displayAllBackups();
        break;
        
      case '4':
        const removed = await this.cleanupOldBackups();
        if (removed === 0) {
          printInfo('Nenhum backup para limpar.');
        } else {
          printSuccess(`${removed} backups removidos.`);
        }
        break;
        
      case '0':
        break;
        
      default:
        printWarning('Opção inválida.');
    }
    
    rl.close();
  }
  
  /**
   * Exibe todos os backups
   */
  displayAllBackups() {
    const backups = this.listBackups();
    
    console.log(`\n${colors.bright}${icons.list} TODOS OS BACKUPS${colors.reset}\n`);
    
    if (backups.length === 0) {
      printInfo('Nenhum backup encontrado.');
      return;
    }
    
    let totalSize = 0;
    
    backups.forEach((b, i) => {
      console.log(`  ${colors.cyan}${i + 1}.${colors.reset} ${b.name}`);
      console.log(`     ${colors.dim}Tamanho: ${formatBytes(b.size)} | Criado: ${formatDate(b.created)}${colors.reset}`);
      totalSize += b.size;
    });
    
    printSeparator('─', 50);
    console.log(`  ${colors.bright}Total: ${backups.length} backups | ${formatBytes(totalSize)}${colors.reset}`);
  }
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const manager = new BackupManager();
  
  // Se passou --full ou --service-requests, executa diretamente
  if (args.includes('--full')) {
    await manager.createFullBackup(!args.includes('--no-compress'));
  } else if (args.includes('--service-requests')) {
    await manager.createServiceRequestsBackup(!args.includes('--no-compress'));
  } else if (args.includes('--list')) {
    manager.displayAllBackups();
  } else if (args.includes('--cleanup')) {
    const removed = await manager.cleanupOldBackups();
    console.log(`${removed} backups removidos.`);
  } else {
    // Sem argumentos, mostra menu interativo
    await manager.showMenu();
  }
}

main().catch(error => {
  printError(`Erro fatal: ${error.message}`);
  rl.close();
  process.exit(1);
});
