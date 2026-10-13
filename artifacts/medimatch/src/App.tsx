import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import { SignInPage, SignUpPage } from '@/pages/AuthPages';
import BeforeAfterPage from '@/pages/BeforeAfterPage';
import ClinicDashboardPage from '@/pages/ClinicDashboardPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PartnerDashboardPage from '@/pages/PartnerDashboardPage';
import PatientAccountPage from '@/pages/PatientAccountPage';
import PatientCarePage from '@/pages/PatientCarePage';
import StaffCareDashboard from '@/pages/StaffCareDashboard';

// Resolves the key from the hostname so the same build can serve several
// Clerk domains.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Empty in development (Clerk is called directly) and set automatically in
// production. Do not gate this on the environment.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

// MediMATCH palette: blue #0a66c2, navy #002d71, soft #f5f6fa.
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#0a66c2',
    colorForeground: '#002d71',
    colorMutedForeground: '#5b6b86',
    colorDanger: '#c4343c',
    colorBackground: '#ffffff',
    colorInput: '#ffffff',
    colorInputForeground: '#002d71',
    colorNeutral: '#002d71',
    colorMuted: '#f5f6fa',
    colorPrimaryForeground: '#ffffff',
    colorRing: '#0a66c2',
    colorModalBackdrop: 'rgba(0, 45, 113, 0.45)',
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox:
      'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#d8e5ee] shadow-[0_25px_65px_rgba(0,45,113,0.09)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#002d71] font-bold tracking-tight',
    headerSubtitle: 'text-[#5b6b86]',
    socialButtonsBlockButtonText: 'text-[#002d71] font-semibold',
    formFieldLabel: 'text-[#002d71] font-semibold',
    footerActionLink: 'text-[#0a66c2] font-semibold hover:text-[#002d71]',
    footerActionText: 'text-[#5b6b86]',
    dividerText: 'text-[#5b6b86]',
    identityPreviewEditButton: 'text-[#0a66c2]',
    formFieldSuccessText: 'text-[#147b60]',
    alertText: 'text-[#c4343c]',
    logoBox: 'flex justify-center',
    logoImage: 'h-9 w-auto',
    socialButtonsBlockButton:
      'border border-[#d8e5ee] bg-white hover:border-[#0a66c2] hover:bg-[#f5f9ff]',
    formButtonPrimary:
      'bg-[#0a66c2] text-white font-semibold shadow-none hover:bg-[#002d71]',
    formFieldInput:
      'border border-[#d8e5ee] bg-white text-[#002d71] placeholder:text-[#8a9bb0] focus:border-[#0a66c2] focus:ring-[3px] focus:ring-[#0a66c2]/15',
    footerAction: 'flex justify-center',
    dividerLine: 'bg-[#e0e8f0]',
    alert: 'border border-[#f3c9cc] bg-[#fdf2f3]',
    otpCodeFieldInput: 'border border-[#d8e5ee] text-[#002d71]',
    formFieldRow: 'gap-3',
    main: 'gap-5',
  },
};

// Clears cached account data when the signed-in user changes.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        client.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Routes() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/before-after" component={BeforeAfterPage} />
        {/* "/*?" matches the bare URL and Clerk's sub-paths (OAuth, verification). */}
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/appointments" component={PatientCarePage} />
        <Route path="/account" component={PatientAccountPage} />
        <Route path="/employee" component={ClinicDashboardPage} />
        <Route path="/clinic" component={ClinicDashboardPage} />
        <Route path="/partner" component={PartnerDashboardPage} />
        <Route path="/ceo" component={AdminDashboardPage} />
        <Route path="/admin" component={AdminDashboardPage} />
        <Route path="/care-dashboard" component={StaffCareDashboard} />
        <Route component={NotFoundPage} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Sign in to MediMATCH',
            subtitle: 'Continue to your care workspace',
          },
        },
        signUp: {
          start: {
            title: 'Create your MediMATCH account',
            subtitle: 'Book care and follow every next step',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Routes />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
