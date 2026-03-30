"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Server, LogOut, Building, User as UserIcon, Sun, Moon, Laptop, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { usePermissions, USER_ROLES } from '@/components/permissions-provider';
import type { UserRole } from '@/components/permissions-provider';
import { useBuilding } from '@/components/building-provider';
import { NAV_SECTIONS, USER_MENU_ITEMS } from '@/lib/menu-config';
import { useKonamiCode } from '@/hooks/use-konami-code';
import { DeveloperMenu } from '@/components/developer-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

const NoAccessPage = () => {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                       <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle>Acesso Limitado</CardTitle>
                    <CardDescription>Sua conta está ativa, mas você ainda não tem permissão para acessar nenhum prédio ou sala.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Entre em contato com um administrador do sistema para solicitar acesso.</p>
                     <Button className="mt-6" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />Sair
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: session } = useSession();
  
  const { user: dbUser, realRole, viewAs, setViewAsRole, isDeveloper, hasPermission } = usePermissions();
  const { buildings, activebuilding_id, setActivebuilding_id, pendingApprovalsCount } = useBuilding();
  
  const showDeveloperMenu = useKonamiCode();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const hiddenMenuItems = dbUser?.preferences?.hiddenMenuItems || [];
  
  const getVisibleNavSections = () => {
    return NAV_SECTIONS.map(section => {
      if (section.isDeveloper && !isDeveloper) return null;
      if (section.permission && !hasPermission(section.permission)) return null;
      
      const visibleItems = section.items.filter(item => 
        hasPermission(item.permission) && !hiddenMenuItems.includes(item.href)
      );
      
      if (visibleItems.length === 0) return null;
      return { ...section, items: visibleItems };
    }).filter(Boolean);
  }

  const visibleNavSections = getVisibleNavSections();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const roleLabels: Record<UserRole, string> = {
    developer: 'Desenvolvedor', manager: 'Gerente', project_manager: 'Gerente de Projeto',
    supervisor_1: 'Supervisor 1', supervisor_2: 'Supervisor 2', technician_1: 'Técnico 1',
    technician_2: 'Técnico 2', guest: 'Convidado',
  };
  
  const accessiblebuildings = React.useMemo(() => {
    if (!dbUser || !buildings) return [];
    const visibleBuildings = buildings.filter(b => b.name === 'Prédio Dev' ? isDeveloper : true);

    if (isDeveloper || realRole === 'manager' || realRole === 'project_manager') {
        return visibleBuildings;
    }
    
    if (dbUser.accessible_building_ids && dbUser.accessible_building_ids.length > 0) {
        return visibleBuildings.filter(b => dbUser.accessible_building_ids?.includes(b.id));
    }
    return [];
  }, [dbUser, isDeveloper, realRole, buildings]);

  React.useEffect(() => {
      if (accessiblebuildings.length > 0 && !accessiblebuildings.some(b => b.id === activebuilding_id)) {
          setActivebuilding_id(accessiblebuildings[0].id);
      } else if (accessiblebuildings.length === 0 && activebuilding_id) {
          setActivebuilding_id('');
      }
  }, [accessiblebuildings, activebuilding_id, setActivebuilding_id]);

  if (dbUser && accessiblebuildings.length === 0 && !isDeveloper) {
    return <NoAccessPage />;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Server className="h-6 w-6 text-primary" />
            <span className="text-lg">InfraVision</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-4 text-sm font-medium">
            {visibleNavSections.map((section, index) => (
              section && (
                <div key={section.title} className={index > 0 ? 'mt-4 pt-4 border-t' : 'mt-4'}>
                  <h3 className="px-4 mb-2 text-xs text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary relative ${pathname.startsWith(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                      <item.icon className="h-4 w-4" />{item.label}
                       {item.href === '/approvals' && pendingApprovalsCount > 0 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                          </span>
                      )}
                    </Link>
                  ))}
                </div>
              )
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col sm:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1" />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alterar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}><Sun className="mr-2 h-4 w-4" /><span>Claro</span></DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4" /><span>Escuro</span></DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}><Laptop className="mr-2 h-4 w-4" /><span>Sistema</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" disabled={accessiblebuildings.length === 0}>
                    <Building className="mr-2 h-4 w-4" />
                    <span>{accessiblebuildings.find(b => b.id === activebuilding_id)?.name || 'Nenhum Prédio Acessível'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mudar de Prédio</DropdownMenuLabel>
                 <DropdownMenuRadioGroup value={activebuilding_id} onValueChange={setActivebuilding_id}>
                    {accessiblebuildings.map(building => (
                        <DropdownMenuRadioItem key={building.id} value={building.id}>{building.name}</DropdownMenuRadioItem>
                    ))}
                 </DropdownMenuRadioGroup>
              </DropdownMenuContent>
           </DropdownMenu>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="secondary" className="relative h-10 w-10 rounded-full">
                   <Avatar className="h-9 w-9">
                      <AvatarImage src={dbUser?.photo_url ?? undefined} alt={dbUser?.display_name ?? 'User'} />
                      <AvatarFallback>{getInitials(dbUser?.display_name)}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <p className="text-sm font-medium leading-none">{dbUser?.display_name}</p>
                    <p className="text-xs text-muted-foreground leading-none mt-1">
                      {roleLabels[viewAs]} {isDeveloper && realRole !== viewAs ? '(Visualizando)' : ''}
                    </p>
                </DropdownMenuLabel>
                 {isDeveloper && (
                  <>
                  <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger><span>Ver como</span></DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                         <DropdownMenuRadioGroup value={viewAs} onValueChange={(value) => setViewAsRole(value as UserRole)}>
                          {USER_ROLES.map(role => (
                            <DropdownMenuRadioItem key={role} value={role}>{roleLabels[role]}</DropdownMenuRadioItem>
                          ))}
                         </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}
                 <DropdownMenuSeparator />
                 {USER_MENU_ITEMS.map(item => (
                   hasPermission(item.permission) && (
                    <DropdownMenuItem key={item.href} onSelect={() => router.push(item.href)}>
                        <item.icon className="mr-2 h-4 w-4" /><span>{item.label}</span>
                    </DropdownMenuItem>
                   )
                 ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
      {isDeveloper && showDeveloperMenu && <DeveloperMenu />}
    </div>
  );
}