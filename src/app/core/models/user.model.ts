export interface User {
    id: string;
    email: string;
    role: 'admin' | 'recolector' | 'usuario';
    name: string;
}
