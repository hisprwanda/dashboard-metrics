// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthorities } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
    requiredAuthorities: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredAuthorities }) => {
    const { authorities } = useAuthorities();

    const hasAccess = requiredAuthorities.every(authority => authorities.includes(authority));

    return hasAccess ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
