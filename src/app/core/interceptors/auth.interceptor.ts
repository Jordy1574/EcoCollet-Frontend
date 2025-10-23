import { Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const router = inject(Router);

  // Agregar token si existe y no es una petición de auth
  let authReq = req;
  const token = localStorage.getItem(environment.tokenKey);
  
  if (token && !req.url.includes('/auth/')) {
    authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  } else {
    // Para peticiones sin token, asegurar headers básicos
    authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Manejar la respuesta
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es error 401, limpiar tokens y redirigir a login
      if (error.status === 401 && !req.url.includes('/auth/')) {
        // Limpiar almacenamiento local
        localStorage.removeItem(environment.tokenKey);
        localStorage.removeItem(environment.refreshTokenKey);
        localStorage.removeItem('user');
        
        // Redirigir a login
        router.navigate(['/login']);
      }

      // Para otros errores, simplemente propagar
      return throwError(() => error);
    })
  );
};

export const loggingInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  console.log(`HTTP ${req.method} to ${req.url}`);
  
  const startTime = Date.now();
  
  return next(req).pipe(
    tap({
      next: (response: any) => {
        const endTime = Date.now();
        console.log(`HTTP ${req.method} to ${req.url} completed in ${endTime - startTime}ms`);
      },
      error: (error: any) => {
        const endTime = Date.now();
        console.error(`HTTP ${req.method} to ${req.url} failed in ${endTime - startTime}ms:`, error);
      }
    })
  );
};