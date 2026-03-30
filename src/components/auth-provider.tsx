"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionsProvider } from '@/components/permissions-provider';
import { getUserByEmail } from '@/lib/user-actions';
import type { User as DbUser } from '@/lib/user-service';
import { BuildingProvider } from '@/components/building-provider';
import { getBuildingsList } from '@/lib/building-actions';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- COMPONENTES DE INTERFACE MANTIDOS ---
const FullPageLoader = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </div>
);

const ConnectionErrorScreen = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <WifiOff className="h-6 w-6 text-destructive" />
                </div>
              <CardTitle className="mt-4 text-2xl">Falha de Conexão</CardTitle>
              <CardDescription>
                Não foi possível conectar ao banco de dados da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Verifique se o banco PostgreSQL está rodando corretamente no Docker.
                </p>
                <div className="rounded-md border bg-muted p-3 text-left text-sm">
                    <p className="font-semibold">Detalhes do Erro:</p>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-destructive">
                        {error}
                    </pre>
                </div>
              <Button onClick={onRetry}>Tentar Novamente</Button>
            </CardContent>
        </Card>
    </div>
);

// --- LÓGICA DE ESTADO (AGORA COM NEXTAUTH) ---
function AuthStateWrapper({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchDbData() {
      if (session?.user?.email) {
        setDbLoading(true);
        try {
          // Busca os dados locais (sem Firebase)
          const userRecord = await getUserByEmail(session.user.email);
          const buildingsData = await getBuildingsList();
          
          if (userRecord) setDbUser(userRecord);
          setBuildings(buildingsData || []);
        } catch (error: any) {
          console.error("Erro ao buscar dados do DB:", error);
          setConnectionError(error.message);
        } finally {
          setDbLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchDbData();
    } else if (status === 'unauthenticated') {
      setDbUser(null);
      setBuildings([]);
    }
  }, [session, status]);

  const isPublicPage = pathname === '/login' || pathname === '/login1' || pathname === '/logout';

  if (connectionError) {
     return <ConnectionErrorScreen error={connectionError} onRetry={() => window.location.reload()} />
  }

  if (status === 'loading' || dbLoading) {
    return <FullPageLoader />;
  }

  // Redireciona usuários não logados
  if (status === 'unauthenticated' && !isPublicPage) {
    router.push('/login');
    return <FullPageLoader />;
  }

  // Redireciona usuários já logados que tentam acessar a tela de login
  if (status === 'authenticated' && dbUser && isPublicPage && pathname !== '/logout') {
    router.push('/datacenter');
    return <FullPageLoader />;
  }

  // Libera páginas públicas (como Login e Logout)
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Envelopa a aplicação para usuários logados
  if (status === 'authenticated' && dbUser) {
    return (
      <PermissionsProvider user={dbUser}>
        <BuildingProvider initialBuildings={buildings}>
          <AppLayout>{children}</AppLayout>
        </BuildingProvider>
      </PermissionsProvider>
    );
  }

  return <FullPageLoader />;
}

// --- PROVIDER PRINCIPAL EXPORTADO ---
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateWrapper>{children}</AuthStateWrapper>
    </SessionProvider>
  );
}