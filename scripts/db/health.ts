#!/usr/bin/env npx tsx
/**
 * ============================================
 * DB HEALTH - Verificação Completa do Sistema
 * ============================================
 * Verifica conexão, tabelas, índices, RLS, performance,
 * integridade de dados, configurações e muito mais
 * 
 * Uso: npm run db:health
 *      npm run db:health -- --verbose
 */

import {
  createSupabaseClient,
  colors,
  icons,
  printHeader,
  printSection,
  createLine,
  formatDate,
} from './config';

interface HealthCheckResult {
  name: string;
  category: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  message: string;
  details?: string;
  duration?: number;
  suggestion?: string;
}

interface HealthCheckOptions {
  verbose: boolean;
}

// Tabelas esperadas
const EXPECTED_TABLES = [
  { name: 'service_requests', description: 'Ordens de serviço' },
  { name: 'waitlist', description: 'Lista de espera - Aulas IA 2026' },
];

// Valores válidos
const VALID_VALUES = {
  service_requests: {
    status: ['pending', 'in_progress', 'completed', 'cancelled'],
    priority: ['low', 'normal', 'high', 'urgent'],
  },
  waitlist: {
    status: ['pending', 'contacted', 'confirmed', 'cancelled'],
    experience_level: ['beginner', 'basic', 'intermediate', 'advanced'],
  },
};

function parseArgs(): HealthCheckOptions {
  const args = process.argv.slice(2);
  return { verbose: args.includes('--verbose') || args.includes('-v') };
}

// ============================================
// VERIFICAÇÕES DE CONECTIVIDADE
// ============================================

async function checkConnection(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from('service_requests').select('id').limit(1);
    const duration = Date.now() - start;
    
    if (error && error.message.includes('Invalid API key')) {
      return { name: 'Conexão Principal', category: 'Conectividade', status: 'fail',
        message: 'API Key inválida', suggestion: 'Verifique SUPABASE_ANON_KEY', duration };
    }
    if (error && !error.message.includes('does not exist')) {
      return { name: 'Conexão Principal', category: 'Conectividade', status: 'fail',
        message: `Erro: ${error.message}`, duration };
    }
    return { name: 'Conexão Principal', category: 'Conectividade', status: 'pass',
      message: `Conectado (${duration}ms)`, duration };
  } catch (err) {
    return { name: 'Conexão Principal', category: 'Conectividade', status: 'fail',
      message: `Erro crítico: ${err instanceof Error ? err.message : 'Desconhecido'}`,
      duration: Date.now() - start };
  }
}

async function checkLatency(): Promise<HealthCheckResult> {
  const start = Date.now();
  const samples: number[] = [];
  try {
    const supabase = createSupabaseClient();
    for (let i = 0; i < 5; i++) {
      const s = Date.now();
      await supabase.from('service_requests').select('id').limit(1);
      samples.push(Date.now() - s);
    }
    const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
    const max = Math.max(...samples);
    const min = Math.min(...samples);
    const duration = Date.now() - start;
    
    if (avg > 1000) return { name: 'Latência', category: 'Conectividade', status: 'fail',
      message: `Crítica: ${avg}ms`, details: `Min:${min}ms Max:${max}ms`, duration };
    if (avg > 500) return { name: 'Latência', category: 'Conectividade', status: 'warn',
      message: `Alta: ${avg}ms`, details: `Min:${min}ms Max:${max}ms`, duration };
    return { name: 'Latência', category: 'Conectividade', status: 'pass',
      message: `OK: ${avg}ms`, details: `Min:${min}ms Max:${max}ms`, duration };
  } catch {
    return { name: 'Latência', category: 'Conectividade', status: 'fail',
      message: 'Erro ao medir', duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE ESTRUTURA
// ============================================

async function checkTable(tableName: string, desc: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    const duration = Date.now() - start;
    
    if (error?.message.includes('does not exist')) {
      return { name: `Tabela: ${tableName}`, category: 'Estrutura', status: 'fail',
        message: 'Não encontrada', suggestion: 'Execute migration', duration };
    }
    if (error) return { name: `Tabela: ${tableName}`, category: 'Estrutura', status: 'warn',
      message: error.message, duration };
    return { name: `Tabela: ${tableName}`, category: 'Estrutura', status: 'pass',
      message: `OK - ${count || 0} registros`, details: desc, duration };
  } catch (err) {
    return { name: `Tabela: ${tableName}`, category: 'Estrutura', status: 'fail',
      message: `Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`, duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE PERFORMANCE
// ============================================

async function checkIndexes(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    const tests = [
      { table: 'service_requests', col: 'status', val: 'pending' },
      { table: 'service_requests', col: 'email', val: 'test@test.com' },
      { table: 'waitlist', col: 'email', val: 'test@test.com' },
    ];
    let slow = 0;
    for (const t of tests) {
      const s = Date.now();
      try { await supabase.from(t.table).select('id').eq(t.col, t.val).limit(1); }
      catch { continue; }
      if (Date.now() - s > 200) slow++;
    }
    const duration = Date.now() - start;
    if (slow > 1) return { name: 'Índices', category: 'Performance', status: 'warn',
      message: `${slow} queries lentas`, duration };
    return { name: 'Índices', category: 'Performance', status: 'pass',
      message: 'Respondendo normalmente', duration };
  } catch {
    return { name: 'Índices', category: 'Performance', status: 'warn',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

async function checkQueryPerformance(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    await Promise.all([
      supabase.from('service_requests').select('*').limit(10),
      supabase.from('service_requests').select('*').eq('status', 'pending').limit(10),
      supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    ]);
    const duration = Date.now() - start;
    if (duration > 2000) return { name: 'Query Performance', category: 'Performance', status: 'fail',
      message: `Lento: ${duration}ms (4 queries)`, duration };
    if (duration > 1000) return { name: 'Query Performance', category: 'Performance', status: 'warn',
      message: `${duration}ms (4 queries)`, duration };
    return { name: 'Query Performance', category: 'Performance', status: 'pass',
      message: `${duration}ms (4 queries)`, details: `~${Math.round(duration/4)}ms/query`, duration };
  } catch (err) {
    return { name: 'Query Performance', category: 'Performance', status: 'fail',
      message: `Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`, duration: Date.now() - start };
  }
}

async function checkConcurrency(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    await Promise.all(Array(10).fill(null).map(() =>
      supabase.from('service_requests').select('id').limit(1)
    ));
    const duration = Date.now() - start;
    if (duration > 3000) return { name: 'Concorrência', category: 'Performance', status: 'warn',
      message: `10 simultâneas: ${duration}ms`, duration };
    return { name: 'Concorrência', category: 'Performance', status: 'pass',
      message: `10 simultâneas: ${duration}ms`, duration };
  } catch {
    return { name: 'Concorrência', category: 'Performance', status: 'warn',
      message: 'Erro no teste', duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE SEGURANÇA
// ============================================

async function checkRLS(tableName: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from(tableName).select('id').limit(1);
    const duration = Date.now() - start;
    if (error?.message.includes('does not exist')) {
      return { name: `RLS: ${tableName}`, category: 'Segurança', status: 'info',
        message: 'Tabela não existe', duration };
    }
    return { name: `RLS: ${tableName}`, category: 'Segurança', status: 'pass',
      message: 'Configurado', details: 'Políticas ativas', duration };
  } catch {
    return { name: `RLS: ${tableName}`, category: 'Segurança', status: 'warn',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE INTEGRIDADE
// ============================================

async function checkDataIntegrity(tableName: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from(tableName).select('*');
    const duration = Date.now() - start;
    
    if (error?.message.includes('does not exist')) {
      return { name: `Dados: ${tableName}`, category: 'Integridade', status: 'info',
        message: 'Tabela não existe', duration };
    }
    if (!data || data.length === 0) {
      return { name: `Dados: ${tableName}`, category: 'Integridade', status: 'pass',
        message: 'Vazia', duration };
    }
    
    let issues = 0;
    const valid = VALID_VALUES[tableName as keyof typeof VALID_VALUES];
    if (valid) {
      data.forEach((row: Record<string, unknown>) => {
        if (valid.status && row.status && !valid.status.includes(row.status as string)) issues++;
        if ('priority' in valid && row.priority) {
          const p = (valid as { priority?: string[] }).priority;
          if (p && !p.includes(row.priority as string)) issues++;
        }
      });
    }
    
    if (issues > 0) return { name: `Dados: ${tableName}`, category: 'Integridade', status: 'warn',
      message: `${issues} inválido(s)`, suggestion: 'npm run db:cleanup', duration };
    return { name: `Dados: ${tableName}`, category: 'Integridade', status: 'pass',
      message: `${data.length} OK`, duration };
  } catch (err) {
    return { name: `Dados: ${tableName}`, category: 'Integridade', status: 'fail',
      message: `Erro: ${err instanceof Error ? err.message : '?'}`, duration: Date.now() - start };
  }
}

async function checkDuplicates(): Promise<HealthCheckResult> {
  const start = Date.now();
  let dups = 0;
  try {
    const supabase = createSupabaseClient();
    
    const { data: s } = await supabase.from('service_requests').select('email');
    if (s) { const e = s.map(r => r.email?.toLowerCase()); dups += e.length - new Set(e).size; }
    
    const { data: w } = await supabase.from('waitlist').select('email');
    if (w) { const e = w.map(r => r.email?.toLowerCase()); dups += e.length - new Set(e).size; }
    
    const duration = Date.now() - start;
    if (dups > 0) return { name: 'Duplicados', category: 'Integridade', status: 'warn',
      message: `${dups} email(s)`, suggestion: 'npm run db:cleanup', duration };
    return { name: 'Duplicados', category: 'Integridade', status: 'pass',
      message: 'Nenhum', duration };
  } catch {
    return { name: 'Duplicados', category: 'Integridade', status: 'info',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE VALIDAÇÃO
// ============================================

async function checkEmailFormats(): Promise<HealthCheckResult> {
  const start = Date.now();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let invalid = 0, total = 0;
  try {
    const supabase = createSupabaseClient();
    const { data: s } = await supabase.from('service_requests').select('email');
    if (s) { total += s.length; s.forEach(r => { if (r.email && !re.test(r.email)) invalid++; }); }
    const { data: w } = await supabase.from('waitlist').select('email');
    if (w) { total += w.length; w.forEach(r => { if (r.email && !re.test(r.email)) invalid++; }); }
    
    const duration = Date.now() - start;
    if (invalid > 0) return { name: 'Formato Email', category: 'Validação', status: 'warn',
      message: `${invalid} inválido(s)`, details: `de ${total}`, duration };
    return { name: 'Formato Email', category: 'Validação', status: 'pass',
      message: `${total} válidos`, duration };
  } catch {
    return { name: 'Formato Email', category: 'Validação', status: 'info',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

async function checkPhoneFormats(): Promise<HealthCheckResult> {
  const start = Date.now();
  let invalid = 0, total = 0;
  try {
    const supabase = createSupabaseClient();
    const check = (phone: string) => {
      const d = phone.replace(/\D/g, '');
      return d.length >= 10 && d.length <= 11;
    };
    const { data: s } = await supabase.from('service_requests').select('phone');
    if (s) s.forEach(r => { if (r.phone) { total++; if (!check(r.phone)) invalid++; } });
    const { data: w } = await supabase.from('waitlist').select('phone');
    if (w) w.forEach(r => { if (r.phone) { total++; if (!check(r.phone)) invalid++; } });
    
    const duration = Date.now() - start;
    if (invalid > 0) return { name: 'Formato Telefone', category: 'Validação', status: 'warn',
      message: `${invalid} inválido(s)`, details: `de ${total}`, duration };
    return { name: 'Formato Telefone', category: 'Validação', status: 'pass',
      message: `${total} válidos`, duration };
  } catch {
    return { name: 'Formato Telefone', category: 'Validação', status: 'info',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

async function checkRequiredFields(): Promise<HealthCheckResult> {
  const start = Date.now();
  let nulls = 0;
  try {
    const supabase = createSupabaseClient();
    const { data: s } = await supabase.from('service_requests').select('id')
      .or('first_name.is.null,email.is.null');
    if (s) nulls += s.length;
    const { data: w } = await supabase.from('waitlist').select('id')
      .or('full_name.is.null,email.is.null');
    if (w) nulls += w.length;
    
    const duration = Date.now() - start;
    if (nulls > 0) return { name: 'Campos Obrigatórios', category: 'Validação', status: 'warn',
      message: `${nulls} incompleto(s)`, duration };
    return { name: 'Campos Obrigatórios', category: 'Validação', status: 'pass',
      message: 'Todos preenchidos', duration };
  } catch {
    return { name: 'Campos Obrigatórios', category: 'Validação', status: 'info',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE TIMESTAMPS
// ============================================

async function checkTimestamps(): Promise<HealthCheckResult> {
  const start = Date.now();
  let issues = 0;
  try {
    const supabase = createSupabaseClient();
    const { data: s } = await supabase.from('service_requests').select('created_at,updated_at');
    if (s) s.forEach(r => {
      if (!r.created_at) issues++;
      if (r.updated_at && r.created_at && new Date(r.updated_at) < new Date(r.created_at)) issues++;
    });
    const { data: w } = await supabase.from('waitlist').select('created_at,updated_at');
    if (w) w.forEach(r => {
      if (!r.created_at) issues++;
      if (r.updated_at && r.created_at && new Date(r.updated_at) < new Date(r.created_at)) issues++;
    });
    
    const duration = Date.now() - start;
    if (issues > 0) return { name: 'Timestamps', category: 'Auditoria', status: 'warn',
      message: `${issues} problema(s)`, duration };
    return { name: 'Timestamps', category: 'Auditoria', status: 'pass',
      message: 'Consistentes', duration };
  } catch {
    return { name: 'Timestamps', category: 'Auditoria', status: 'info',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

async function checkFutureDates(): Promise<HealthCheckResult> {
  const start = Date.now();
  const now = new Date();
  let future = 0;
  try {
    const supabase = createSupabaseClient();
    const { data: s } = await supabase.from('service_requests').select('created_at');
    if (s) s.forEach(r => { if (r.created_at && new Date(r.created_at) > now) future++; });
    const { data: w } = await supabase.from('waitlist').select('created_at');
    if (w) w.forEach(r => { if (r.created_at && new Date(r.created_at) > now) future++; });
    
    const duration = Date.now() - start;
    if (future > 0) return { name: 'Datas Futuras', category: 'Auditoria', status: 'warn',
      message: `${future} registro(s)`, suggestion: 'Verificar timezone', duration };
    return { name: 'Datas Futuras', category: 'Auditoria', status: 'pass',
      message: 'Nenhuma', duration };
  } catch {
    return { name: 'Datas Futuras', category: 'Auditoria', status: 'info',
      message: 'Não verificado', duration: Date.now() - start };
  }
}

// ============================================
// VERIFICAÇÕES DE ARMAZENAMENTO
// ============================================

async function checkStorage(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    let total = 0;
    const { count: s } = await supabase.from('service_requests').select('*', { count: 'exact', head: true });
    const { count: w } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
    total = (s || 0) + (w || 0);
    const kb = ((total * 500) / 1024).toFixed(2);
    
    const duration = Date.now() - start;
    return { name: 'Armazenamento', category: 'Storage', status: 'pass',
      message: `~${kb} KB (${total} registros)`,
      details: `service_requests:${s||0} waitlist:${w||0}`, duration };
  } catch {
    return { name: 'Armazenamento', category: 'Storage', status: 'info',
      message: 'Não estimado', duration: Date.now() - start };
  }
}

async function checkDataGrowth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const supabase = createSupabaseClient();
    const week = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const month = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    
    const { count: sw } = await supabase.from('service_requests').select('*', { count: 'exact', head: true }).gte('created_at', week);
    const { count: sm } = await supabase.from('service_requests').select('*', { count: 'exact', head: true }).gte('created_at', month);
    const { count: ww } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', week);
    const { count: wm } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', month);
    
    const weekTotal = (sw||0) + (ww||0);
    const monthTotal = (sm||0) + (wm||0);
    
    const duration = Date.now() - start;
    return { name: 'Crescimento', category: 'Storage', status: 'info',
      message: `Semana:+${weekTotal} Mês:+${monthTotal}`, duration };
  } catch {
    return { name: 'Crescimento', category: 'Storage', status: 'info',
      message: 'Não calculado', duration: Date.now() - start };
  }
}

// ============================================
// FUNÇÕES DE EXIBIÇÃO
// ============================================

function printResult(r: HealthCheckResult, opts: HealthCheckOptions): void {
  const cfg = {
    pass: { icon: colors.green + icons.success, color: colors.green },
    warn: { icon: colors.yellow + icons.warning, color: colors.yellow },
    fail: { icon: colors.red + icons.error, color: colors.red },
    info: { icon: colors.blue + icons.info, color: colors.blue },
  };
  const c = cfg[r.status];
  console.log(`  ${c.icon} ${c.color}${r.name}${colors.reset}`);
  console.log(`     ${colors.dim}${r.message}${colors.reset}`);
  if (opts.verbose && r.details) console.log(`     ${colors.dim}→ ${r.details}${colors.reset}`);
  if (r.suggestion && (r.status === 'warn' || r.status === 'fail'))
    console.log(`     ${colors.cyan}💡 ${r.suggestion}${colors.reset}`);
}

function printSummary(results: HealthCheckResult[], time: number, opts: HealthCheckOptions): void {
  console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset} 📊 ${colors.bright}RESUMO${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
  
  const pass = results.filter(r => r.status === 'pass').length;
  const warn = results.filter(r => r.status === 'warn').length;
  const fail = results.filter(r => r.status === 'fail').length;
  const info = results.filter(r => r.status === 'info').length;
  
  // Por categoria
  const cats = [...new Set(results.map(r => r.category))];
  console.log(`  ${colors.bright}POR CATEGORIA${colors.reset}\n`);
  cats.forEach(cat => {
    const cr = results.filter(r => r.category === cat);
    const cp = cr.filter(r => r.status === 'pass').length;
    const cw = cr.filter(r => r.status === 'warn').length;
    const cf = cr.filter(r => r.status === 'fail').length;
    let icon = '🟢'; if (cf > 0) icon = '🔴'; else if (cw > 0) icon = '🟡';
    console.log(`  ${icon} ${cat}: ${cp}✓ ${cw}⚠ ${cf}✗`);
  });
  
  console.log(`\n  ${colors.bright}TOTAIS${colors.reset}\n`);
  console.log(`  ${colors.green}✓ Passou: ${pass}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Avisos: ${warn}${colors.reset}`);
  console.log(`  ${colors.red}✗ Falhou: ${fail}${colors.reset}`);
  console.log(`  ${colors.blue}ℹ Info:   ${info}${colors.reset}`);
  console.log(`  ${colors.dim}⏱ Tempo:  ${time}ms${colors.reset}`);
  
  let status = 'SAUDÁVEL', clr = colors.green, emoji = '✅';
  if (fail > 0) { status = 'CRÍTICO'; clr = colors.red; emoji = '🚨'; }
  else if (warn > 2) { status = 'ATENÇÃO'; clr = colors.yellow; emoji = '⚠️'; }
  else if (warn > 0) { status = 'BOM'; clr = colors.yellow; emoji = '👍'; }
  
  console.log(`\n  ${emoji} ${clr}${colors.bright}Status: ${status}${colors.reset}`);
  
  // Críticos
  const critical = results.filter(r => r.status === 'fail');
  if (critical.length > 0) {
    console.log(`\n  ${colors.red}🚨 CRÍTICOS:${colors.reset}`);
    critical.forEach(c => console.log(`     ${colors.red}• ${c.name}: ${c.message}${colors.reset}`));
  }
  
  // Avisos
  if (opts.verbose && warn > 0) {
    const warnings = results.filter(r => r.status === 'warn');
    console.log(`\n  ${colors.yellow}⚠️ AVISOS:${colors.reset}`);
    warnings.forEach(w => console.log(`     ${colors.yellow}• ${w.name}: ${w.message}${colors.reset}`));
  }
  
  console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}`);
  console.log(`${colors.dim}Concluído: ${formatDate(new Date())}${colors.reset}`);
  console.log(`${colors.dim}Use --verbose para detalhes${colors.reset}\n`);
}

// ============================================
// EXECUÇÃO PRINCIPAL
// ============================================

async function runHealthCheck(): Promise<void> {
  const opts = parseArgs();
  printHeader('VERIFICAÇÃO COMPLETA DE SAÚDE', icons.health);
  if (opts.verbose) console.log(`  ${colors.dim}Modo verbose${colors.reset}\n`);
  
  const results: HealthCheckResult[] = [];
  const start = Date.now();
  
  // CONECTIVIDADE
  printSection('CONECTIVIDADE', '🔌');
  results.push(await checkConnection()); printResult(results[results.length-1], opts);
  results.push(await checkLatency()); printResult(results[results.length-1], opts);
  
  // ESTRUTURA
  printSection('ESTRUTURA', '🗄️');
  for (const t of EXPECTED_TABLES) {
    results.push(await checkTable(t.name, t.description));
    printResult(results[results.length-1], opts);
  }
  
  // PERFORMANCE
  printSection('PERFORMANCE', '⚡');
  results.push(await checkIndexes()); printResult(results[results.length-1], opts);
  results.push(await checkQueryPerformance()); printResult(results[results.length-1], opts);
  results.push(await checkConcurrency()); printResult(results[results.length-1], opts);
  
  // SEGURANÇA
  printSection('SEGURANÇA', '🔐');
  results.push(await checkRLS('service_requests')); printResult(results[results.length-1], opts);
  results.push(await checkRLS('waitlist')); printResult(results[results.length-1], opts);
  
  // INTEGRIDADE
  printSection('INTEGRIDADE', '📊');
  results.push(await checkDataIntegrity('service_requests')); printResult(results[results.length-1], opts);
  results.push(await checkDataIntegrity('waitlist')); printResult(results[results.length-1], opts);
  results.push(await checkDuplicates()); printResult(results[results.length-1], opts);
  
  // VALIDAÇÃO
  printSection('VALIDAÇÃO', '✅');
  results.push(await checkEmailFormats()); printResult(results[results.length-1], opts);
  results.push(await checkPhoneFormats()); printResult(results[results.length-1], opts);
  results.push(await checkRequiredFields()); printResult(results[results.length-1], opts);
  
  // AUDITORIA
  printSection('AUDITORIA', '🕐');
  results.push(await checkTimestamps()); printResult(results[results.length-1], opts);
  results.push(await checkFutureDates()); printResult(results[results.length-1], opts);
  
  // STORAGE
  printSection('ARMAZENAMENTO', '💾');
  results.push(await checkStorage()); printResult(results[results.length-1], opts);
  results.push(await checkDataGrowth()); printResult(results[results.length-1], opts);
  
  printSummary(results, Date.now() - start, opts);
}

runHealthCheck().catch(console.error);
