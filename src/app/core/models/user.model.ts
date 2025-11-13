export interface User {
    id: string;
    email: string;
    rol: 'ADMIN' | 'RECOLECTOR' | 'CLIENTE';
    name: string;
    telefono?: string;
    distrito?: string;
    direccion?: string;
    tipoUsuario?: 'Individual' | 'Empresa';
    notificacionesEmail?: boolean;
    notificacionesPush?: boolean;
    recordatorios?: boolean;
}
