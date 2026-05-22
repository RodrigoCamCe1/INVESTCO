import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth-store";

/**
 * CLIENTE API CENTRALIZADO
 * 
 * Gestiona:
 * - Configuración base de peticiones
 * - Inyección automática de tokens JWT
 * - Interceptores para manejo de errores
 * - Reintentos automáticos
 * - Logging centralizado
 * 
 * Arquitectura: Patrón Singleton + Inyección de dependencias
 */

class ApiClient {
  private static instance: AxiosInstance;

  /**
   * Obtener instancia del cliente API
   * Patrón Singleton para reutilizar configuración
   */
  public static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        // ================================================================
        // CONFIGURACIÓN BASE
        // ================================================================
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        timeout: 30000, // 30 segundos
        withCredentials: true, // Enviar cookies

        // ================================================================
        // HEADERS POR DEFECTO
        // ================================================================
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Client-Version": process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        },
      });

      // Configurar interceptores
      ApiClient.setupInterceptors(ApiClient.instance);
    }

    return ApiClient.instance;
  }

  /**
   * Configurar interceptores de request y response
   */
  private static setupInterceptors(instance: AxiosInstance) {
    // ====================================================================
    // INTERCEPTOR DE REQUEST
    // ====================================================================
    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Obtener token del store de autenticación
        const token = useAuthStore.getState().token;

        // Inyectar token en header Authorization
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Agregar timestamp para caché busting en GETs
        if (config.method === "get") {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // ====================================================================
    // INTERCEPTOR DE RESPONSE
    // ====================================================================
    instance.interceptors.response.use(
      (response) => {
        // Logging de respuestas exitosas
        if (process.env.DEBUG === "true") {
          console.log(
            `[API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
            response.status
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        const { response, config } = error;
        const authStore = useAuthStore.getState();

        // ================================================================
        // MANEJO DE ERRORES
        // ================================================================

        // 401 - No autorizado (token expirado o inválido)
        if (response?.status === 401) {
          // Limpiar sesión
          authStore.logout();

          // Redirigir a login (solo en cliente)
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }

          return Promise.reject(error);
        }

        // 403 - Prohibido (sin permisos)
        if (response?.status === 403) {
          if (typeof window !== "undefined") {
            window.location.href = "/forbidden";
          }
          return Promise.reject(error);
        }

        // 500+ - Errores del servidor
        if (response && response.status >= 500) {
          console.error(`[API Error] Server error: ${response.status}`, error);
        }

        // Logging de errores
        console.error(
          `[API Error] ${config?.method?.toUpperCase()} ${config?.url}`,
          {
            status: response?.status,
            message: error.message,
            data: response?.data,
          }
        );

        return Promise.reject(error);
      }
    );
  }

  /**
   * Resetear instancia (útil para testing)
   */
  public static reset() {
    ApiClient.instance = null as any;
  }
}

/**
 * Exportar instancia del cliente API
 */
export const apiClient = ApiClient.getInstance();

/**
 * Helper para peticiones tipo GET
 */
export async function apiGet<T = any>(
  url: string,
  config?: AxiosRequestConfig
) {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Helper para peticiones tipo POST
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Helper para peticiones tipo PUT
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Helper para peticiones tipo DELETE
 */
export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
) {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

/**
 * Helper para peticiones tipo PATCH
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}
