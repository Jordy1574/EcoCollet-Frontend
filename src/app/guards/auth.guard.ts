import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthApiService } from '../adapters/api/auth.api.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private auth: AuthApiService, private router: Router) {}

	canActivate(): boolean | UrlTree {
		if (this.auth.isAuthenticated()) {
			return true;
		}

		// Redirigir a login si no está autenticado
		return this.router.parseUrl('/login');
	}
}

