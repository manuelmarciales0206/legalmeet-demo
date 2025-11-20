interface PriceRange {
  min: number;
  max: number;
  urgencyMultiplier: number;
}

class PricingService {
  private prices: Record<string, PriceRange> = {
    'Derecho Laboral': {
      min: 80000,
      max: 150000,
      urgencyMultiplier: 1.3
    },
    'Derecho Penal': {
      min: 150000,
      max: 300000,
      urgencyMultiplier: 1.5
    },
    'Derecho de Familia': {
      min: 100000,
      max: 200000,
      urgencyMultiplier: 1.2
    },
    'Derecho Civil': {
      min: 90000,
      max: 180000,
      urgencyMultiplier: 1.25
    },
    'Derecho Comercial': {
      min: 120000,
      max: 250000,
      urgencyMultiplier: 1.3
    },
    'Derecho de Tránsito': {
      min: 60000,
      max: 120000,
      urgencyMultiplier: 1.2
    },
    'Derecho Inmobiliario': {
      min: 100000,
      max: 200000,
      urgencyMultiplier: 1.25
    },
  };

  /**
   * Estimar costo de consulta
   */
  estimateCost(categoria: string, urgencia: 'BAJA' | 'MEDIA' | 'ALTA'): {
    min: number;
    max: number;
    estimated: number;
  } {
    const priceRange = this.prices[categoria] || this.prices['Derecho Civil'];
    
    let min = priceRange.min;
    let max = priceRange.max;
    
    // Aplicar multiplicador de urgencia
    if (urgencia === 'ALTA') {
      min = Math.round(min * priceRange.urgencyMultiplier);
      max = Math.round(max * priceRange.urgencyMultiplier);
    } else if (urgencia === 'MEDIA') {
      const mediumMultiplier = 1 + ((priceRange.urgencyMultiplier - 1) * 0.5);
      min = Math.round(min * mediumMultiplier);
      max = Math.round(max * mediumMultiplier);
    }
    
    // Precio estimado (promedio + variación aleatoria)
    const avg = (min + max) / 2;
    const variation = (max - min) * 0.2; // 20% de variación
    const estimated = Math.round(avg + (Math.random() - 0.5) * variation);
    
    return { min, max, estimated };
  }

  /**
   * Formatear precio colombiano
   */
  formatPrice(amount: number): string {
    return `$${amount.toLocaleString('es-CO')} COP`;
  }

  /**
   * Obtener texto de rango de precios
   */
  getPriceRangeText(categoria: string, urgencia: 'BAJA' | 'MEDIA' | 'ALTA'): string {
    const { min, max, estimated } = this.estimateCost(categoria, urgencia);
    
    return `💵 Costo estimado: ${this.formatPrice(estimated)}\n` +
           `   (Rango: ${this.formatPrice(min)} - ${this.formatPrice(max)})`;
  }
}

export const pricingService = new PricingService();