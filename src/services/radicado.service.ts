class RadicadoService {
  private counter = 1000; // Empieza en 1000

  /**
   * Genera radicado único
   */
  generateRadicado(categoria: string): string {
    const year = new Date().getFullYear();
    const categoryCode = this.getCategoryCode(categoria);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Formato: LEGAL-LAB-20241118-AB3F
    return `LEGAL-${categoryCode}-${date}-${random}`;
  }

  /**
   * Genera radicado simple
   */
  generateSimpleRadicado(): string {
    const year = new Date().getFullYear();
    const num = String(this.counter++).padStart(6, '0');
    
    // Formato: LM-2024-001234
    return `LM-${year}-${num}`;
  }

  /**
   * Códigos de categorías
   */
  private getCategoryCode(categoria: string): string {
    const codes: Record<string, string> = {
      'Derecho Laboral': 'LAB',
      'Derecho Penal': 'PEN',
      'Derecho de Familia': 'FAM',
      'Derecho Civil': 'CIV',
      'Derecho Comercial': 'COM',
      'Derecho de Tránsito': 'TRA',
      'Derecho Inmobiliario': 'INM',
    };
    
    return codes[categoria] || 'GEN';
  }

  /**
   * Validar formato de radicado
   */
  validateRadicado(radicado: string): boolean {
    // Formato: LEGAL-XXX-YYYYMMDD-XXXX o LM-YYYY-XXXXXX
    const regex1 = /^LEGAL-[A-Z]{3}-\d{8}-[A-Z0-9]{4}$/;
    const regex2 = /^LM-\d{4}-\d{6}$/;
    
    return regex1.test(radicado) || regex2.test(radicado);
  }
}

export const radicadoService = new RadicadoService();