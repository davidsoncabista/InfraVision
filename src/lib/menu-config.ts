
import {
    LayoutGrid,
    HardDrive,
    Network,
    FileText,
    CheckSquare,
    History,
    Users,
    ShieldCheck,
    FlaskConical,
    Building,
    Trash2,
    Replace,
    DatabaseZap,
    AlertTriangle,
    Settings,
    User as UserIcon,
    FilePlus,
    Upload,
    Server as ServerIcon,
} from 'lucide-react';
import { ComponentType } from 'react';

export interface NavItem {
    href: string;
    label: string;
    icon: ComponentType<any>;
    permission: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
    permission?: string;
    isDeveloper?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { href: '/evidence', label: 'Central de Evidências', icon: FilePlus, permission: 'page:evidence:view' },
        { href: '/datacenter', label: 'Footprint', icon: LayoutGrid, permission: 'page:datacenter:view' },
        { href: '/inventory', label: 'Equipamentos', icon: HardDrive, permission: 'page:inventory:view' },
        { href: '/connections', label: 'Conexões', icon: Network, permission: 'page:connections:view' },
        { href: '/depara', label: 'De/Para', icon: Replace, permission: 'page:depara:view' },
        { href: '/reports', label: 'Relatórios', icon: FileText, permission: 'page:reports:view' },
      ]
    },
    {
      title: 'Supervisionar',
      permission: 'section:supervisor:view',
      items: [
        { href: '/incidents', label: 'Incidentes', icon: AlertTriangle, permission: 'page:incidents:view' },
        { href: '/approvals', label: 'Aprovações', icon: CheckSquare, permission: 'page:approvals:view' },
        { href: '/audit', label: 'Auditoria (Log)', icon: History, permission: 'page:audit:view' },
        { href: '/trash', label: 'Lixeira', icon: Trash2, permission: 'page:trash:view' },
      ]
    },
    {
      title: 'Gerenciamento',
      permission: 'section:management:view',
      items: [
        { href: '/users', label: 'Usuários', icon: Users, permission: 'page:users:view' },
        { href: '/permissions', label: 'Permissões', icon: ShieldCheck, permission: 'page:permissions:view' },
        { href: '/buildings', label: 'Prédios', icon: Building, permission: 'page:buildings:view' },
        { href: '/system', label: 'Sistema', icon: Settings, permission: 'page:system:view' },
      ]
    },
    {
      title: 'Desenvolvimento',
      isDeveloper: true,
      items: [
        { href: '/database-setup', label: 'Setup do Banco', icon: DatabaseZap, permission: '*' },
      ]
    }
];

// Itens que aparecerão no menu dropdown do usuário
export const USER_MENU_ITEMS: NavItem[] = [
    { href: '/profile', label: 'Meu Perfil', icon: UserIcon, permission: 'page:profile:view' },
    { href: '/settings', label: 'Preferências', icon: Settings, permission: 'page:settings:view' },
    { href: '/import', label: 'Importar Dados', icon: Upload, permission: 'page:import:view' },
];
