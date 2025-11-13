export interface User {
    id: string;
    email: string;
    rol: 'ADMIN' | 'RECOLECTOR' | 'CLIENTE';
    name: string;
}
