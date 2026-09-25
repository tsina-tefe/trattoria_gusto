// AppSidebar.tsx

import { NavFooter } from '@/components/nav-footer';
import { NavMain, type NavSection } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type ExternalLinkSection, type NavItem, type PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  Award,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileQuestion,
  FolderKey,
  Globe2,
  History,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UserCog,
  UserCircle,
  FileText,
  ClipboardCheck,
  XCircle,
  BarChart3,
  Settings,
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  Warehouse,
  ShoppingCart,
  MessageSquare,
  Ticket,
  Phone,
  ExternalLink,
  Wallet,
  Plus,
  List,
} from 'lucide-react';
import AppLogo from './app-logo';

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Warehouse,
  TrendingUp,
  Globe2,
  Settings,
  LockKeyhole,
  Shield,
  UserCog,
  Building2,
  ClipboardList,
  Users,
  Phone,
  ShieldCheck,
  FileText,
  FolderKey,
  MessageSquare,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Award,
  ListChecks,
  FileQuestion,
  UserCircle,
  Target,
  History,
  XCircle,
  Ticket,
  Package,
  Sparkles,
  ExternalLink,
  Wallet,
  Plus,
  List,
  ClipboardCheck,
} as const;

const baseSections: NavSection[] = [
  
  {
    label: 'System Administration',
    icon: Settings,
    items: [
      { title: 'Permissions', href: '/permissions', icon: LockKeyhole, permission: 'view permissions' },
      { title: 'Roles', href: '/roles', icon: Shield, permission: 'view roles' },
      { title: 'Users', href: '/users', icon: UserCog, permission: 'view users' },
      { title: 'Departments', href: '/departments', icon: Building2, permission: 'view departments' },
      { title: 'Branches', href: '/branches', icon: Globe2, permission: 'view branches' },
      { title: 'Positions', href: '/positions', icon: ClipboardList, permission: 'view positions' },
      { title: 'Employees', href: '/employees', icon: Users, permission: 'view employees' },
      { title: 'Employee Directory', href: '/directory', icon: Phone, permission: 'view employee directory' },
      { title: 'Managers', href: '/managers', icon: ShieldCheck, permission: 'view managers' },
      { title: 'Other Evaluables', href: '/other-evaluables', icon: FileText, permission: 'view other evaluables' },
      { title: 'External Links', href: '/external-links', icon: ExternalLink, permission: 'manage external links' },
    ],
  },
  {
    label: 'Period Management',
    icon: CalendarIcon,
    items: [
      { title: 'Fiscal Years', href: '/fiscal-years', icon: Calendar, permission: 'view fiscal years' },
      { title: 'Fiscal Months', href: '/fiscal-months', icon: CalendarDays, permission: 'view fiscal months' },
      { title: 'Evaluation Periods', href: '/evaluation-periods', icon: CalendarCheck, permission: 'view evaluation periods' },
    ],
  },
  {
    label: 'Performance Evaluation',
    icon: TrendingUp,
    items: [
      { title: 'Evaluation Types', href: '/evaluation-types', icon: Sparkles, permission: 'view evaluation types' },
      { title: 'Evaluation Categories', href: '/evaluation-categories', icon: ListChecks, permission: 'view evaluation categories' },
      { title: 'Question Groups', href: '/question-groups', icon: FolderKey, permission: 'view question groups' },
      { title: 'Questions', href: '/questions', icon: FileQuestion, permission: 'view questions' },
      { title: 'Evaluator Groups', href: '/evaluator-groups', icon: UserCircle, permission: 'view evaluator groups' },
      { title: 'Evaluatee Groups', href: '/evaluates-groups', icon: Target, permission: 'view evaluates groups' },
      { title: 'All Evaluations', href: '/evaluations', icon: ClipboardCheck, permission: 'view evaluations' },
      { title: 'Evaluation Records', href: '/evaluation-records', icon: ListChecks, permission: 'view evaluation records' },
      { title: 'Evaluator Completion', href: '/evaluator-completion', icon: BarChart3, permission: 'view evaluator completion' },
      { title: 'Fill Evaluation', href: '/my-evaluation', icon: ListChecks, permission: 'Fill Evaluation' },
      { title: 'Evaluation History', href: '/my-evaluation/history', icon: History, permission: 'Evaluation History' },
      { title: 'My Results', href: '/my-results', icon: Award, permission: 'My Results' },
      { title: 'Rejected Evaluations', href: '/rejected-evaluations', icon: XCircle, permission: 'view rejected evaluations' },
    ],
  },
];
const footerNavItems: NavItem[] = [];

export function AppSidebar() {
  const { props } = usePage<PageProps>();
  const externalGroups = buildExternalGroups(props.externalLinks as ExternalLinkSection[] | undefined);
  const sections =
    externalGroups.length > 0
      ? [...baseSections, { label: 'Links', icon: ExternalLink, items: [], groups: externalGroups }]
      : baseSections;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain sections={sections} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function resolveIcon(name?: string | null) {
  if (!name) return undefined;
  return iconMap[name as keyof typeof iconMap] ?? ExternalLink;
}

function buildExternalGroups(sections: ExternalLinkSection[] | undefined) {
  if (!sections?.length) return [];

  return sections.map((section) => ({
    label: section.label,
    icon: resolveIcon(section.icon) ?? ExternalLink,
    items: (section.items ?? section.links ?? []).map((item) => ({
      title: item.title,
      href: item.href,
      permission: item.permission,
      icon: resolveIcon(item.icon ?? item.iconName) ?? resolveIcon(section.icon) ?? ExternalLink,
      target: item.target ?? '_blank',
      rel: item.rel ?? 'noreferrer noopener',
      external: item.external ?? item.is_external ?? true,
    })),
  }));
}


