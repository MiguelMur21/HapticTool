export interface User {
    usuario_id: number;     // ID del usuario
    nombre: string;         // Nombre completo
    email: string;          // Correo electrónico
    rol: {
        rol_id: number;       // ID del rol (1=usuario_normal, 2=admin, 3=superadmin)
        nombre: string;       // Nombre del rol
    };
    access_token?: string;  // Token JWT o de sesión 
}
