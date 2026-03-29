"use client";

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Faz o logout via NextAuth e redireciona para a nossa tela de login oficial
        await signOut({ callbackUrl: '/login', redirect: true });
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        window.location.href = '/login'; // Fallback de segurança
      }
    };

    performLogout();
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <p className="mt-2 font-semibold text-primary">Encerrando sessão...</p>
      </div>
    </div>
  );
}