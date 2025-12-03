/**
 * ============================================
 * TIPOS DO BANCO DE DADOS - CYBERCLASS
 * ============================================
 * Definições de tipos para o banco de dados
 */

// Status das ordens de serviço
export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Prioridades
export type ServiceRequestPriority = 'low' | 'normal' | 'high' | 'urgent';

// Tipos de serviço
export type ServiceType =
  | 'Aulas de Inteligência Artificial'
  | 'Mentoria de IA Personalizada'
  | 'Suporte e Assistência Técnica'
  | 'Consultoria e Treinamentos'
  | 'Cibersegurança'
  | 'Desenvolvimento de Sistemas'
  | 'Manutenção e Auxílio Tecnológico';

// Ordem de serviço
export interface ServiceRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  service_type: ServiceType | string;
  description?: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  estimated_value?: number;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Dados de backup
export interface BackupMetadata {
  version: string;
  created_at: string;
  table: string;
  record_count: number;
  project_id: string;
  checksum: string;
}

export interface BackupFile {
  metadata: BackupMetadata;
  data: ServiceRequest[];
}

// Estatísticas
export interface StatusDistribution {
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface PriorityDistribution {
  low: number;
  normal: number;
  high: number;
  urgent: number;
}

export interface ServiceTypeDistribution {
  [serviceType: string]: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
  completed: number;
}

export interface Statistics {
  total: number;
  status_distribution: StatusDistribution;
  priority_distribution: PriorityDistribution;
  service_type_distribution: ServiceTypeDistribution;
  monthly_trends: MonthlyTrend[];
  avg_completion_time_hours?: number;
  completion_rate: number;
  total_estimated_value: number;
}

// Health Check
export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration_ms?: number;
  details?: Record<string, unknown>;
}

export interface HealthReport {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: string;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

// Monitor
export interface MonitorState {
  connected: boolean;
  last_check: Date;
  record_count: number;
  changes_detected: number;
  uptime_seconds: number;
  error_count: number;
}

// Cleanup
export interface CleanupResult {
  action: string;
  records_affected: number;
  details: string[];
}

export interface CleanupReport {
  dry_run: boolean;
  results: CleanupResult[];
  total_affected: number;
  timestamp: string;
}
