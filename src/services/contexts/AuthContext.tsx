import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importa a função de decodificação

// Define os tipos de dados do contexto
interface AuthContextType {
    authToken: string | null;
    isAuthenticated: boolean;
    user: any; // Dados do usuário extraídos do token
    login: (token: string) => void;
    logout: () => void;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para verificar se o token está presente no localStorage
const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

interface AuthProviderProps {
    children: ReactNode;
}

// Criar o AuthProvider para fornecer o estado global
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authToken, setAuthToken] = useState<string | null>(getToken());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null); // Estado para armazenar os dados do usuário
    const navigate = useNavigate(); // Hook para navegação

    // Função para decodificar o token
    const decodeToken = (token: string): any => {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            return null;
        }
    };

    // Verifica se o token é válido quando o componente carrega
    useEffect(() => {
        if (authToken) {
            setIsAuthenticated(true);
            const userData = decodeToken(authToken); // Decodifica o token
            setUser(userData); // Armazena os dados do usuário no estado
            navigate('/principal'); // Redireciona para a tela principal
        } else {
            setIsAuthenticated(false);
            setUser(null); // Limpa os dados do usuário se não houver token
            navigate('/'); // Redireciona para a tela principal
        }
    }, [authToken, navigate]);

    // Função para fazer login
    const login = (token: string): void => {
        localStorage.setItem('authToken', token); // Salva o token no localStorage
        setAuthToken(token);
        const userData = decodeToken(token);
        setUser(userData); // Armazena os dados do usuário
    };

    // Função para fazer logout
    const logout = (): void => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null); // Limpa os dados do usuário no logout
        setIsAuthenticated(false);
        navigate('/login'); // Redireciona para a tela de login
    };

    return (
        <AuthContext.Provider value={{ authToken, isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
