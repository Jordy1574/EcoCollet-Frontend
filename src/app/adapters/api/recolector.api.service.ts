import { Injectable } from '@angular/core';
import { Recoleccion, RecolectorStats, AgendaItem, RendimientoSemanal } from '../../core/models/recolector.models';
import { of, Observable, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RecolectorApiService {
    // MOCK DATA (Simulando la respuesta del servidor)
    private mockStats: RecolectorStats = {
        pendientes: 5,
        enCurso: 1,
        completadas: 2,
        totalRecollectadoKg: 47
    };

    private mockAgenda: AgendaItem[] = [
        { id: '#001', hora: '8:30 AM', direccion: 'Av. Larco 123', material: 'Plástico', cantidad: '12 kg', estado: 'Completada' },
        { id: '#002', hora: '10:00 AM', direccion: 'Jr. Colón 456', material: 'Papel', cantidad: '8 kg', estado: 'En proceso' },
        { id: '#003', hora: '11:30 AM', direccion: 'Av. Pardo 789', material: 'Vidrio', cantidad: '15 kg', estado: 'Pendiente' },
        { id: '#004', hora: '2:00 PM', direccion: 'Av. Benavides 321', material: 'Plástico', cantidad: '10 kg', estado: 'Pendiente' },
    ];
    
    private mockRendimiento: RendimientoSemanal[] = [
        { dia: 'Lun', kg: 45 }, { dia: 'Mar', kg: 52 }, { dia: 'Mié', kg: 38 }, 
        { dia: 'Jue', kg: 67 }, { dia: 'Vie', kg: 43 }, { dia: 'Sáb', kg: 29 }, 
        { dia: 'Dom', kg: 35 }
    ];

    getStats(): Observable<RecolectorStats> {
        return of(this.mockStats).pipe(delay(200));
    }

    getAgendaHoy(): Observable<AgendaItem[]> {
        return of(this.mockAgenda.filter(r => ['Pendiente', 'En proceso'].includes(r.estado))).pipe(delay(300));
    }

    // Lógica para simular aceptar una recolección
    aceptarRecoleccion(id: string): Observable<AgendaItem> {
        const item = this.mockAgenda.find(a => a.id === id);
        if (item && item.estado === 'Pendiente') {
            item.estado = 'En proceso';
            // Simular actualización de stats
            this.mockStats.enCurso += 1;
            this.mockStats.pendientes -= 1;
            return of(item).pipe(delay(300));
        }
        return throwError(() => new Error('No se pudo aceptar la recolección.'));
    }
}