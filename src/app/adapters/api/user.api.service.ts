import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Importar los modelos específicos del usuario
import {
  CitaUsuario,
  EstadisticasUsuario,
  PuntoReciclaje,
  HistorialReciclaje,
  NotificacionUsuario,
  PerfilUsuario,
  DashboardData,
  SolicitudCita,
  RespuestaApi,
  FiltrosBusqueda,
  MaterialType,
  MATERIALES_INFO
} from '../../core/models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  // ====================================================================
  // 1. DATOS MOCK PARA EL USUARIO
  // ====================================================================

  private mockEstadisticas: EstadisticasUsuario = {
    citasCompletadas: 12,
    materialReciclado: 68.5, // kg
    puntosGanados: 1250,
    impactoAmbiental: {
      co2Ahorrado: 23.4,
      aguaAhorrada: 340,
      energiaAhorrada: 45.6,
      arbolesEquivalentes: 2.8
    },
    racha: {
      dias: 7,
      ultimaFecha: '2024-03-18',
      mejor: 21
    }
  };

  private mockCitasPendientes: CitaUsuario[] = [
    {
      id: 'C001',
      fecha: '2024-03-20',
      hora: '10:00 AM',
      direccion: 'Av. Larco 123, Miraflores',
      material: 'plastico',
      cantidad: '8 kg',
      estado: 'Confirmada',
      recolector: 'Juan Pérez',
      notas: 'Botellas y envases limpios',
      fechaCreacion: '2024-03-15',
      fechaActualizacion: '2024-03-16'
    },
    {
      id: 'C002',
      fecha: '2024-03-22',
      hora: '2:00 PM',
      direccion: 'Jr. Puno 456, San Isidro',
      material: 'papel',
      cantidad: '5 kg',
      estado: 'Pendiente',
      fechaCreacion: '2024-03-18'
    }
  ];

  private mockPuntosReciclaje: PuntoReciclaje[] = [
    {
      id: 'P001',
      nombre: 'EcoPoint Miraflores',
      direccion: 'Av. Larco 345, Miraflores',
      coordenadas: { lat: -12.1195, lng: -77.0282 },
      distancia: '0.8 km',
      tiempoViaje: '3 min',
      materiales: ['plastico', 'papel', 'vidrio'],
      horario: {
        lunes: { abierto: true, inicio: '08:00', fin: '18:00' },
        martes: { abierto: true, inicio: '08:00', fin: '18:00' },
        miercoles: { abierto: true, inicio: '08:00', fin: '18:00' },
        jueves: { abierto: true, inicio: '08:00', fin: '18:00' },
        viernes: { abierto: true, inicio: '08:00', fin: '18:00' },
        sabado: { abierto: true, inicio: '09:00', fin: '16:00' },
        domingo: { abierto: false }
      },
      estado: 'Abierto',
      calificacion: 4.8,
      telefono: '01-234-5678',
      servicios: [
        { nombre: 'Pesaje electrónico', disponible: true },
        { nombre: 'Certificado de reciclaje', disponible: true },
        { nombre: 'Estacionamiento', disponible: true }
      ]
    },
    {
      id: 'P002',
      nombre: 'ReciclaMax San Isidro',
      direccion: 'Av. Javier Prado 1234, San Isidro',
      coordenadas: { lat: -12.0969, lng: -77.0362 },
      distancia: '1.2 km',
      tiempoViaje: '5 min',
      materiales: ['plastico', 'papel', 'electronicos'],
      horario: {
        lunes: { abierto: true, inicio: '09:00', fin: '17:00' },
        martes: { abierto: true, inicio: '09:00', fin: '17:00' },
        miercoles: { abierto: true, inicio: '09:00', fin: '17:00' },
        jueves: { abierto: true, inicio: '09:00', fin: '17:00' },
        viernes: { abierto: true, inicio: '09:00', fin: '17:00' },
        sabado: { abierto: false },
        domingo: { abierto: false }
      },
      estado: 'Abierto',
      calificacion: 4.5,
      telefono: '01-345-6789',
      servicios: [
        { nombre: 'Reciclaje de electrónicos', disponible: true },
        { nombre: 'Compra de materiales', disponible: true }
      ]
    }
  ];

  private mockHistorial: HistorialReciclaje[] = [
    {
      id: 'H001',
      fecha: '2024-03-15',
      material: 'plastico',
      cantidad: 12.5,
      puntoReciclaje: 'EcoPoint Miraflores',
      puntosGanados: 125,
      impacto: { co2: 4.2, agua: 65, energia: 8.3 }
    },
    {
      id: 'H002',
      fecha: '2024-03-10',
      material: 'papel',
      cantidad: 8.0,
      puntoReciclaje: 'ReciclaMax San Isidro',
      puntosGanados: 80,
      impacto: { co2: 2.8, agua: 45, energia: 5.2 }
    },
    {
      id: 'H003',
      fecha: '2024-03-05',
      material: 'vidrio',
      cantidad: 15.2,
      puntoReciclaje: 'EcoPoint Miraflores',
      puntosGanados: 152,
      impacto: { co2: 5.1, agua: 78, energia: 10.1 }
    }
  ];

  private mockNotificaciones: NotificacionUsuario[] = [
    {
      id: 'N001',
      tipo: 'cita_confirmada',
      titulo: 'Cita confirmada',
      mensaje: 'Tu cita del 20/03 a las 10:00 AM ha sido confirmada',
      fecha: '2024-03-16 14:30',
      leida: false
    },
    {
      id: 'N002',
      tipo: 'puntos_ganados',
      titulo: '¡Puntos ganados!',
      mensaje: 'Has ganado 125 puntos por tu último reciclaje',
      fecha: '2024-03-15 16:45',
      leida: true
    }
  ];

  constructor() { }

  // ====================================================================
  // 2. MÉTODOS DE API PARA EL DASHBOARD
  // ====================================================================

  // Obtener todos los datos del dashboard
  getDashboardData(): Observable<DashboardData> {
    const data: DashboardData = {
      estadisticas: this.mockEstadisticas,
      citasPendientes: this.mockCitasPendientes,
      puntosRecomendados: this.mockPuntosReciclaje.slice(0, 3),
      notificaciones: this.mockNotificaciones.filter(n => !n.leida).slice(0, 5),
      historialReciente: this.mockHistorial.slice(0, 5)
    };
    
    return of(data).pipe(delay(500));
  }

  // Obtener estadísticas del usuario
  getEstadisticas(): Observable<EstadisticasUsuario> {
    return of(this.mockEstadisticas).pipe(delay(200));
  }

  // Obtener citas pendientes
  getCitasPendientes(): Observable<CitaUsuario[]> {
    return of(this.mockCitasPendientes).pipe(delay(300));
  }

  // Obtener historial completo
  getHistorialReciclaje(limite?: number): Observable<HistorialReciclaje[]> {
    const historial = limite ? this.mockHistorial.slice(0, limite) : this.mockHistorial;
    return of(historial).pipe(delay(300));
  }

  // Obtener puntos de reciclaje cercanos
  getPuntosReciclaje(filtros?: FiltrosBusqueda): Observable<PuntoReciclaje[]> {
    let puntos = [...this.mockPuntosReciclaje];
    
    if (filtros) {
      if (filtros.materiales && filtros.materiales.length > 0) {
        puntos = puntos.filter(punto => 
          filtros.materiales!.some(material => punto.materiales.includes(material))
        );
      }
      
      if (filtros.abierto !== undefined) {
        puntos = puntos.filter(punto => 
          filtros.abierto ? punto.estado === 'Abierto' : true
        );
      }
      
      if (filtros.conCalificacion) {
        puntos = puntos.filter(punto => punto.calificacion >= filtros.conCalificacion!);
      }
    }
    
    return of(puntos).pipe(delay(400));
  }

  // Obtener notificaciones
  getNotificaciones(): Observable<NotificacionUsuario[]> {
    return of(this.mockNotificaciones).pipe(delay(200));
  }

  // ====================================================================
  // 3. MÉTODOS DE ACCIÓN
  // ====================================================================

  // Solicitar nueva cita
  solicitarCita(solicitud: SolicitudCita): Observable<RespuestaApi<CitaUsuario>> {
    // Simular validación
    if (!solicitud.material || !solicitud.cantidad || !solicitud.fechaPreferida) {
      return throwError(() => ({ 
        success: false, 
        error: 'Datos incompletos para la solicitud' 
      }));
    }

    // Crear nueva cita
    const nuevaCita: CitaUsuario = {
      id: `C${Date.now()}`,
      fecha: solicitud.fechaPreferida,
      hora: solicitud.horaPreferida,
      direccion: solicitud.direccion,
      material: solicitud.material,
      cantidad: solicitud.cantidad,
      estado: 'Pendiente',
      notas: solicitud.notas,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    // Agregar a las citas pendientes
    this.mockCitasPendientes.unshift(nuevaCita);

    return of({ 
      success: true, 
      data: nuevaCita,
      message: 'Cita solicitada correctamente' 
    }).pipe(delay(800));
  }

  // Cancelar cita
  cancelarCita(citaId: string): Observable<RespuestaApi<boolean>> {
    const index = this.mockCitasPendientes.findIndex(cita => cita.id === citaId);
    
    if (index === -1) {
      return throwError(() => ({ 
        success: false, 
        error: 'Cita no encontrada' 
      }));
    }

    this.mockCitasPendientes[index].estado = 'Cancelada';
    
    return of({ 
      success: true, 
      data: true,
      message: 'Cita cancelada correctamente' 
    }).pipe(delay(500));
  }

  // Marcar notificación como leída
  marcarNotificacionLeida(notificacionId: string): Observable<RespuestaApi<boolean>> {
    const notificacion = this.mockNotificaciones.find(n => n.id === notificacionId);
    
    if (!notificacion) {
      return throwError(() => ({ 
        success: false, 
        error: 'Notificación no encontrada' 
      }));
    }

    notificacion.leida = true;
    
    return of({ 
      success: true, 
      data: true 
    }).pipe(delay(200));
  }

  // ====================================================================
  // 4. MÉTODOS AUXILIARES
  // ====================================================================

  // Obtener información de material
  getMaterialInfo(material: MaterialType) {
    return MATERIALES_INFO[material] || {
      nombre: 'Desconocido',
      color: '#6B7280',
      icono: '❓',
      descripcion: 'Material no identificado'
    };
  }

  // Calcular puntos por cantidad de material
  calcularPuntos(material: MaterialType, cantidad: number): number {
    const multiplicadores = {
      plastico: 10,
      papel: 8,
      vidrio: 12,
      metal: 15,
      electronicos: 20,
      baterias: 25,
      aceite: 30,
      organico: 5,
      carton: 8
    };
    
    return Math.round(cantidad * (multiplicadores[material] || 10));
  }

  // Obtener punto más cercano
  getPuntoMasCercano(): Observable<PuntoReciclaje | null> {
    const puntosCercanos = this.mockPuntosReciclaje
      .filter(p => p.estado === 'Abierto')
      .sort((a, b) => parseFloat(a.distancia) - parseFloat(b.distancia));
    
    return of(puntosCercanos[0] || null).pipe(delay(200));
  }
}