import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthApiService } from '../adapters/api/auth.api.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
	constructor(private auth: AuthApiService, private router: Router) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = localStorage.getItem(environment.tokenKey);
		let authReq = req;

		if (token) {
			authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
		}

		return next.handle(authReq).pipe(
			catchError((err: HttpErrorResponse) => {
				if (err.status === 401) {
					// Token inválido o expirado
					this.auth.logoutLocal();
					this.router.navigate(['/login']);
				}
				return throwError(() => err);
			})
		);
	}
}

