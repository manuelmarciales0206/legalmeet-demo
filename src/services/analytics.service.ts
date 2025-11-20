import { conversationService } from './conversation.service';

export interface CaseStats {
  radicado: string;
  categoria: string;
  urgencia: 'BAJA' | 'MEDIA' | 'ALTA';
  timestamp: Date;
  estimatedRevenue: number;
}

class AnalyticsService {
  private cases: CaseStats[] = [];

  /**
   * Registrar caso clasificado
   */
  registerCase(caseData: CaseStats): void {
    this.cases.push(caseData);
    console.log('📊 Caso registrado en analytics:', caseData.radicado);
  }

  /**
   * Obtener estadísticas generales
   */
  getGeneralStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const casesToday = this.cases.filter(c => c.timestamp >= today);
    const casesThisWeek = this.cases.filter(c => c.timestamp >= weekAgo);

    const totalRevenue = this.cases.reduce((sum, c) => sum + c.estimatedRevenue, 0);
    const avgRevenue = this.cases.length > 0 ? totalRevenue / this.cases.length : 0;

    return {
      totalCases: this.cases.length,
      casesToday: casesToday.length,
      casesThisWeek: casesThisWeek.length,
      activeConversations: conversationService.getStats().activeConversations,
      totalRevenue,
      avgRevenue,
    };
  }

  /**
   * Distribución por categorías
   */
  getCategoryDistribution() {
    const distribution: Record<string, number> = {};

    this.cases.forEach(c => {
      distribution[c.categoria] = (distribution[c.categoria] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Distribución por urgencia
   */
  getUrgencyDistribution() {
    const distribution = {
      BAJA: 0,
      MEDIA: 0,
      ALTA: 0,
    };

    this.cases.forEach(c => {
      distribution[c.urgencia]++;
    });

    return [
      { name: 'Baja', value: distribution.BAJA, color: '#22c55e' },
      { name: 'Media', value: distribution.MEDIA, color: '#eab308' },
      { name: 'Alta', value: distribution.ALTA, color: '#ef4444' },
    ];
  }

  /**
   * Últimos casos
   */
  getRecentCases(limit: number = 10) {
    return this.cases
      .slice()
      .reverse()
      .slice(0, limit)
      .map(c => ({
        radicado: c.radicado,
        categoria: c.categoria,
        urgencia: c.urgencia,
        timestamp: c.timestamp.toLocaleString('es-CO'),
        revenue: c.estimatedRevenue,
      }));
  }

  /**
   * Casos por día (últimos 7 días)
   */
  getCasesByDay() {
    const days: Record<string, number> = {};
    const now = new Date();

    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      days[key] = 0;
    }

    // Contar casos
    this.cases.forEach(c => {
      const key = c.timestamp.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      if (key in days) {
        days[key]++;
      }
    });

    return Object.entries(days).map(([day, cases]) => ({ day, cases }));
  }

  /**
   * Obtener todos los datos para el dashboard
   */
  getDashboardData() {
    return {
      general: this.getGeneralStats(),
      categories: this.getCategoryDistribution(),
      urgencies: this.getUrgencyDistribution(),
      recentCases: this.getRecentCases(),
      casesByDay: this.getCasesByDay(),
    };
  }
}

export const analyticsService = new AnalyticsService();