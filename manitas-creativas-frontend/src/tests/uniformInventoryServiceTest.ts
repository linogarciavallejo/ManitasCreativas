import { entradaUniformeService, EntradaUniformeCreate } from '../services/entradaUniformeService';

// Test data for uniform inventory
const testEntradaUniforme: EntradaUniformeCreate = {
  fechaEntrada: '2025-01-15',
  notas: 'Entrada de prueba para el inventario de uniformes',
  detalles: [
    {
      prendaUniformeId: 1,
      cantidad: 25,
      subtotal: 750.00
    },
    {
      prendaUniformeId: 2,
      cantidad: 30,
      subtotal: 900.00
    }
  ]
};

// Test functions
export const testUniformInventoryService = {
  // Test getting all entries
  async testGetAllEntradas() {
    try {
      const entradas = await entradaUniformeService.getAllEntradasUniforme();
      console.log('✓ getAllEntradasUniforme:', entradas.length, 'entries found');
      return entradas;
    } catch (error) {
      console.error('✗ getAllEntradasUniforme failed:', error);
      throw error;
    }
  },

  // Test getting active entries
  async testGetActiveEntradas() {
    try {
      const entradas = await entradaUniformeService.getActiveEntradasUniforme();
      console.log('✓ getActiveEntradasUniforme:', entradas.length, 'active entries found');
      return entradas;
    } catch (error) {
      console.error('✗ getActiveEntradasUniforme failed:', error);
      throw error;
    }
  },

  // Test creating a new entry
  async testCreateEntrada(usuarioCreacionId: number) {
    try {
      const newEntrada = await entradaUniformeService.createEntradaUniforme(testEntradaUniforme, usuarioCreacionId);
      console.log('✓ createEntradaUniforme: Entry created with ID', newEntrada.id);
      return newEntrada;
    } catch (error) {
      console.error('✗ createEntradaUniforme failed:', error);
      throw error;
    }
  },

  // Test getting entry by ID
  async testGetEntradaById(id: number) {
    try {
      const entrada = await entradaUniformeService.getEntradaUniformeById(id);
      console.log('✓ getEntradaUniformeById: Found entry', entrada.id);
      return entrada;
    } catch (error) {
      console.error('✗ getEntradaUniformeById failed:', error);
      throw error;
    }
  },

  // Test getting entries by date range
  async testGetEntradasByDateRange(startDate: string, endDate: string) {
    try {
      const entradas = await entradaUniformeService.getEntradasUniformeByDateRange(startDate, endDate);
      console.log('✓ getEntradasUniformeByDateRange:', entradas.length, 'entries in date range');
      return entradas;
    } catch (error) {
      console.error('✗ getEntradasUniformeByDateRange failed:', error);
      throw error;
    }
  },

  // Test getting entries by user
  async testGetEntradasByUsuario(usuarioId: number) {
    try {
      const entradas = await entradaUniformeService.getEntradasUniformeByUsuario(usuarioId);
      console.log('✓ getEntradasUniformeByUsuario:', entradas.length, 'entries for user');
      return entradas;
    } catch (error) {
      console.error('✗ getEntradasUniformeByUsuario failed:', error);
      throw error;
    }
  },

  // Run all tests
  async runAllTests(usuarioCreacionId: number = 1) {
    console.log('🧪 Starting Uniform Inventory Service Tests...');
    
    try {
      // Test read operations
      await this.testGetAllEntradas();
      await this.testGetActiveEntradas();
      
      // Test date range (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await this.testGetEntradasByDateRange(startDate, endDate);
      
      // Test user-specific entries
      await this.testGetEntradasByUsuario(usuarioCreacionId);
      
      console.log('✅ All Uniform Inventory Service tests passed!');
      
    } catch (error) {
      console.error('❌ Some tests failed:', error);
    }
  }
};

// Export test data and functions
export { testEntradaUniforme };
