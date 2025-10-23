import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthApiService } from '../adapters/api/auth.api.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
	constructor(private auth: AuthApiService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
		const expectedRoles: string[] = route.data['roles'] || [];

		if (!this.auth.isAuthenticated()) {
			return this.router.parseUrl('/login');
		}

		const user = this.auth.getCurrentUser();
		if (!user) return this.router.parseUrl('/login');

		if (expectedRoles.length === 0 || expectedRoles.includes(user.rol)) {
			return true;
		}

		// Si no tiene permiso, redirigir a dashboard o página de acceso denegado
		return this.router.parseUrl('/');
	}
}

