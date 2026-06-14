import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Datos iniciales embebidos — solo se usan en la primera ejecución cuando Firestore está vacío.
// NO modificar estos datos aquí; para actualizar socios usá el panel de admin.

const INITIAL_USERS = [
  {
    id: 'USR-001', dni: '12345678', nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@gmail.com', telefono: '1152341234',
    plan: 'mensual', fechaAlta: '2025-01-15', fechaVencimiento: '2026-06-15',
    habilitado: true, saldo: 0,
    rutina: ['Sentadillas', 'Press de banca', 'Remo con barra', 'Plancha'],
    historialPagos: [
      { id: 'PAY-001', fecha: '2026-05-01', monto: 15000, concepto: 'Cuota Mensual - Mayo 2026', metodo: 'terminal' },
      { id: 'PAY-002', fecha: '2026-04-01', monto: 15000, concepto: 'Cuota Mensual - Abril 2026', metodo: 'terminal' }
    ]
  },
  {
    id: 'USR-002', dni: '87654321', nombre: 'María González',
    email: 'mariagonzalez@hotmail.com', telefono: '1162345678',
    plan: 'trimestral', fechaAlta: '2025-03-20', fechaVencimiento: '2026-06-20',
    habilitado: true, saldo: 0,
    rutina: ['Curl de bíceps', 'Extensión de tríceps', 'Peso muerto', 'Hip thrust'],
    historialPagos: [
      { id: 'PAY-003', fecha: '2026-03-20', monto: 40000, concepto: 'Cuota Trimestral - Mar/Jun 2026', metodo: 'terminal' }
    ]
  },
  {
    id: 'USR-003', dni: '11223344', nombre: 'Luciano Pérez',
    email: 'lucianop@yahoo.com', telefono: '1145678901',
    plan: 'mensual', fechaAlta: '2024-08-10', fechaVencimiento: '2026-04-10',
    habilitado: false, saldo: 15000, rutina: [],
    historialPagos: [
      { id: 'PAY-004', fecha: '2026-03-10', monto: 15000, concepto: 'Cuota Mensual - Marzo 2026', metodo: 'terminal' }
    ]
  },
  {
    id: 'USR-004', dni: '55667788', nombre: 'Valentina Suárez',
    email: 'vsuarez@gmail.com', telefono: '1178901234',
    plan: 'anual', fechaAlta: '2026-01-01', fechaVencimiento: '2026-12-31',
    habilitado: true, saldo: 0,
    rutina: ['Sentadillas', 'Estocadas', 'Puente de glúteos', 'Abductores', 'Abdominales'],
    historialPagos: [
      { id: 'PAY-005', fecha: '2026-01-01', monto: 140000, concepto: 'Cuota Anual 2026', metodo: 'terminal' }
    ]
  },
  {
    id: 'USR-005', dni: '99887766', nombre: 'Facundo Díaz',
    email: 'facudiaz@gmail.com', telefono: '1167890123',
    plan: 'mensual', fechaAlta: '2026-05-01', fechaVencimiento: '2026-06-01',
    habilitado: true, saldo: 0,
    rutina: ['Press militar', 'Jalón al pecho', 'Remo en polea', 'Elevaciones laterales'],
    historialPagos: [
      { id: 'PAY-006', fecha: '2026-05-01', monto: 15000, concepto: 'Cuota Mensual - Mayo 2026', metodo: 'terminal' }
    ]
  },
  {
    id: 'USR-006', dni: '33445566', nombre: 'Sofía Martínez',
    email: 'sofiamartinez@gmail.com', telefono: '1189012345',
    plan: 'trimestral', fechaAlta: '2025-11-15', fechaVencimiento: '2026-08-15',
    habilitado: true, saldo: 0,
    rutina: ['Bicicleta estática', 'Elíptica', 'Abdominales', 'Plancha lateral'],
    historialPagos: [
      { id: 'PAY-007', fecha: '2026-02-15', monto: 40000, concepto: 'Cuota Trimestral - Feb/May 2026', metodo: 'terminal' }
    ]
  },
  {
    id: 'USR-ADMIN', dni: '99999999', nombre: 'Admin GymTotal',
    email: 'admin@gymtotal.com', telefono: '1199999999',
    plan: 'pase libre', fechaAlta: '2026-01-01', fechaVencimiento: '2027-12-31',
    habilitado: true, saldo: 0, rol: 'admin', rutina: [], historialPagos: []
  }
];

const INITIAL_PRODUCTS = [
  { id: 'PRD-001', nombre: 'Remera GymTotal Dry-Fit', categoria: 'Ropa', precio: 18000, stock: 25, descripcion: 'Remera de alto rendimiento con tecnología Dry-Fit.', colores: ['Negro', 'Azul', 'Blanco'], tallas: ['S', 'M', 'L', 'XL'], emoji: '👕' },
  { id: 'PRD-002', nombre: 'Short GymTotal Training', categoria: 'Ropa', precio: 14000, stock: 18, descripcion: 'Short deportivo con bolsillo lateral.', colores: ['Negro', 'Azul'], tallas: ['S', 'M', 'L', 'XL'], emoji: '🩳' },
  { id: 'PRD-003', nombre: 'Bidón GymTotal 1L', categoria: 'Accesorios', precio: 8500, stock: 40, descripcion: 'Bidón de 1 litro con tapa a presión. Libre de BPA.', colores: ['Negro', 'Azul', 'Gris'], tallas: null, emoji: '🧴' },
  { id: 'PRD-004', nombre: 'Guantes de Entrenamiento', categoria: 'Accesorios', precio: 11000, stock: 15, descripcion: 'Guantes con palma reforzada y muñequera de soporte.', colores: ['Negro'], tallas: ['S/M', 'L/XL'], emoji: '🥊' },
  { id: 'PRD-005', nombre: 'Proteína Whey 1kg', categoria: 'Suplementos', precio: 45000, stock: 12, descripcion: '24g de proteína por porción.', colores: null, tallas: ['Chocolate', 'Vainilla'], emoji: '🥛' },
  { id: 'PRD-006', nombre: 'Creatina Monohidratada 300g', categoria: 'Suplementos', precio: 22000, stock: 20, descripcion: 'Creatina pura micronizada. Sin sabor.', colores: null, tallas: null, emoji: '⚗️' },
  { id: 'PRD-007', nombre: 'Toalla GymTotal Microfibra', categoria: 'Accesorios', precio: 7500, stock: 30, descripcion: 'Toalla de microfibra de secado rápido 60x120cm.', colores: ['Azul', 'Gris', 'Negro'], tallas: null, emoji: '🏊' },
  { id: 'PRD-008', nombre: 'Correa para Espalda Baja', categoria: 'Accesorios', precio: 16000, stock: 10, descripcion: 'Cinturón lumbar de cuero para levantamiento de pesas.', colores: ['Negro', 'Marrón'], tallas: ['S', 'M', 'L'], emoji: '🔧' },
  { id: 'PRD-009', nombre: 'Pre-Workout Energy', categoria: 'Suplementos', precio: 28000, stock: 15, descripcion: 'Pre-entreno con cafeína, beta-alanina y citrulina.', colores: null, tallas: null, emoji: '⚡' },
  { id: 'PRD-010', nombre: 'Mochila GymTotal', categoria: 'Accesorios', precio: 32000, stock: 8, descripcion: 'Mochila deportiva 30L con compartimento para zapatillas.', colores: ['Negro', 'Azul'], tallas: null, emoji: '🎒' }
];

const INITIAL_ASSISTANCE = [
  { id: 'AST-001', usuarioId: 'USR-001', usuarioNombre: 'Carlos Rodríguez', tipo: 'tecnica', descripcion: 'Necesito corrección en la técnica de sentadillas', estado: 'atendido', fecha: '2026-05-25T10:30:00', atendidoPor: 'Prof. Marcos Gómez' },
  { id: 'AST-002', usuarioId: 'USR-004', usuarioNombre: 'Valentina Suárez', tipo: 'nueva_rutina', descripcion: 'Quiero actualizar mi rutina de glúteos', estado: 'pendiente', fecha: '2026-05-26T09:15:00', atendidoPor: null },
  { id: 'AST-003', usuarioId: 'USR-002', usuarioNombre: 'María González', tipo: 'lesion', descripcion: 'Siento molestias en el hombro derecho al hacer press', estado: 'en_curso', fecha: '2026-05-26T11:00:00', atendidoPor: 'Prof. Laura Sánchez' }
];

export async function seedDatabaseIfEmpty() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));

    if (!usersSnapshot.empty) {
      console.log('Firestore ya tiene datos. Saltando seeder.');
      return;
    }

    console.log('Firestore vacío. Cargando datos iniciales...');

    const writes = [
      ...INITIAL_USERS.map((u) => setDoc(doc(db, 'users', u.id), u)),
      ...INITIAL_PRODUCTS.map((p) => setDoc(doc(db, 'products', p.id), p)),
      ...INITIAL_ASSISTANCE.map((a) => setDoc(doc(db, 'assistance', a.id), a)),
    ];

    await Promise.all(writes);
    console.log('Siembra completada con éxito.');
  } catch (error) {
    console.error('Error durante la siembra:', error);
  }
}
