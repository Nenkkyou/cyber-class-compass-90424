# 🗄️ CyberClass Database Manager

Sistema completo de gerenciamento do banco de dados para o site CyberClass.

## 📋 Índice

- [Instalação](#instalação)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Uso Detalhado](#uso-detalhado)
- [Configuração](#configuração)
- [Estrutura de Arquivos](#estrutura-de-arquivos)

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# ou com bun
bun install
```

## 📦 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run db` | Menu interativo com todas as opções |
| `npm run db:health` | Verificar saúde do sistema |
| `npm run db:list` | Listar ordens de serviço |
| `npm run db:stats` | Estatísticas e relatórios |
| `npm run db:backup` | Exportar dados para JSON |
| `npm run db:restore` | Restaurar de um backup |
| `npm run db:monitor` | Monitoramento em tempo real |
| `npm run db:cleanup` | Limpeza de dados |
| `npm run db:live` | Dashboard em tempo real |

## 📖 Uso Detalhado

### 🏥 Health Check (`npm run db:health`)

Realiza uma verificação completa do sistema:
- ✅ Conexão com o banco de dados
- ✅ Existência da tabela `service_requests`
- ✅ Verificação de índices
- ✅ Políticas RLS
- ✅ Integridade dos dados
- ✅ Performance de queries
- ✅ Estimativa de armazenamento

### 📋 Listar Registros (`npm run db:list`)

Lista ordens de serviço com filtros:

```bash
# Listar todos
npm run db:list

# Filtrar por status
npm run db:list -- --status=pending
npm run db:list -- --status=completed

# Filtrar por prioridade
npm run db:list -- --priority=urgent

# Buscar por termo
npm run db:list -- --search="João"

# Limitar resultados
npm run db:list -- --limit=10

# Ordenar
npm run db:list -- --sort=created_at --order=asc
```

### 📊 Estatísticas (`npm run db:stats`)

Gera relatórios completos:
- Distribuição por status (gráfico de barras ASCII)
- Distribuição por prioridade
- Distribuição por tipo de serviço
- Tendências mensais
- Métricas de tempo
- Alertas e recomendações

### 💾 Backup (`npm run db:backup`)

Exporta dados para arquivo JSON:
- Gera arquivo com timestamp
- Inclui checksum SHA-256
- Metadados completos
- Lista backups existentes

```bash
# Backup padrão
npm run db:backup

# Backups são salvos em ./backups/
```

### 📥 Restaurar (`npm run db:restore`)

Restaura dados de um backup:
- Seleção interativa de arquivo
- Verificação de checksum
- Modo dry-run para teste
- Tratamento de duplicados

```bash
# Restauração interativa
npm run db:restore

# Restaurar arquivo específico
npm run db:restore -- --file=backup_2024-01-15.json

# Modo dry-run (apenas simula)
npm run db:restore -- --dry-run
```

### 📡 Monitor (`npm run db:monitor`)

Monitora o banco em tempo real:
- Contagem de registros ao vivo
- Detecção de alterações
- Status da conexão
- Uptime tracking

```bash
# Monitor padrão (refresh a cada 5s)
npm run db:monitor

# Alterar intervalo de refresh
npm run db:monitor -- --interval=10
```

### 🧹 Cleanup (`npm run db:cleanup`)

Limpeza e manutenção:
- Remove registros inválidos
- Detecta duplicados
- Arquiva registros antigos
- Valida emails

```bash
# Cleanup padrão (dry-run)
npm run db:cleanup -- --dry-run

# Executar limpeza real
npm run db:cleanup
```

### 🚀 Live Dashboard (`npm run db:live`)

Painel completo em tempo real:
- Todas as métricas ao vivo
- Alertas urgentes
- Últimas ordens
- Gráficos de status

```bash
# Dashboard padrão
npm run db:live

# Alterar refresh (em segundos)
npm run db:live -- --refresh=3
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-para-admin
```

### Tabela do Banco de Dados

A tabela `service_requests` deve ter a seguinte estrutura:

```sql
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  service_type VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  priority VARCHAR DEFAULT 'normal',
  estimated_value DECIMAL,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📁 Estrutura de Arquivos

```
scripts/
└── db/
    ├── config.ts      # Configurações centralizadas
    ├── menu.ts        # Menu interativo principal
    ├── health.ts      # Verificação de saúde
    ├── list.ts        # Listagem de registros
    ├── stats.ts       # Estatísticas e relatórios
    ├── backup.ts      # Sistema de backup
    ├── restore.ts     # Restauração de backups
    ├── monitor.ts     # Monitoramento em tempo real
    ├── cleanup.ts     # Limpeza de dados
    └── live.ts        # Dashboard ao vivo

backups/              # Diretório de backups (criado automaticamente)
```

## 🎨 Cores e Ícones

Os scripts utilizam cores ANSI e ícones Unicode para uma experiência visual rica no terminal:

- 🟢 Sucesso / Conexão OK
- 🟡 Aviso / Em andamento
- 🔴 Erro / Urgente
- 🔵 Informação

## 🛡️ Segurança

- As chaves de API são carregadas do `.env`
- A Service Role Key é necessária apenas para operações admin
- O Anon Key é usado para operações básicas

## 📝 Logs

Todos os scripts geram logs formatados com:
- Timestamps
- Níveis de severidade
- Cores distintivas
- Ícones visuais

---

Desenvolvido com ❤️ para CyberClass
