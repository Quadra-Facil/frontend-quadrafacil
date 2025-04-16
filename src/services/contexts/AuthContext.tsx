import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    authToken: string | null;
    isAuthenticated: boolean;
    user: any;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// Rotas que não requerem autenticação
const PUBLIC_ROUTES = ['/', '/signout', '/recovery-pass'];

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authToken, setAuthToken] = useState<string | null>(getToken());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation(); // Hook para acessar a rota atual

    const decodeToken = (token: string): any => {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const token = getToken();
        const currentPath = location.pathname;

        // Se estiver em uma rota pública, não faz nada
        if (PUBLIC_ROUTES.includes(currentPath)) {
            return;
        }

        // Se não houver token, redireciona para login
        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            navigate('/');
            return;
        }

        // Se houver token mas ainda não está autenticado
        if (token && !isAuthenticated) {
            setIsAuthenticated(true);
            setAuthToken(token);
            const userData = decodeToken(token);
            setUser(userData);

            // Se já estava tentando acessar uma rota, não redireciona para /principal
            if (currentPath === '/') {
                navigate('/principal');
            }
        }

        // Se estava autenticado mas o token foi removido
        if (isAuthenticated && !token) {
            setIsAuthenticated(false);
            setUser(null);
            navigate('/');
        }
    }, [authToken, isAuthenticated, navigate, location.pathname]);

    const login = (token: string): void => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        const userData = decodeToken(token);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = (): void => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ authToken, isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };