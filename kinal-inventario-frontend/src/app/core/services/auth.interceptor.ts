import { HttpInterceptorFn } from "@angular/common/http";

const TOKEN_KEY = "kinal_token";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(cloned);
    }
  } catch {
    console.warn("[authInterceptor] No se pudo acceder a localStorage");
  }
  return next(req);
};
