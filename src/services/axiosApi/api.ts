import axios, { AxiosError } from 'axios';
import { parseCookies } from 'nookies';

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  // const authContext = useContext(AuthContext);
  // const { logout }: any = authContext;

  const api = axios.create({
    // baseURL: 'http://localhost:5214/', // URL do backend
    baseURL: 'http://alancarloscesar-001-site1.ktempurl.com'
  });

  // Adicionar um interceptor de requisição para incluir o token em todas as requisições
  api.interceptors.request.use((config) => {
    // Recupera o token do cookie ou do localStorage
    const token = cookies['authToken'] || localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Interceptor de resposta para tratar erro 401
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Caso o erro seja 401, fazer logout ou outra ação necessária
        if (typeof window !== undefined) {
          // logout();
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
