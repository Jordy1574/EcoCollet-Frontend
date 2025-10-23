export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api', // Spring Boot puerto por defecto 8080
  wsUrl: 'ws://localhost:8080', // Para WebSockets si los necesitas
  apiVersion: 'v1',
  tokenKey: 'ecollet_token',
  refreshTokenKey: 'ecollet_refresh_token'
};