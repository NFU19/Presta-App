export type AppRouteParams = {
  "/": undefined;
  "/landing": undefined;
  "/login": undefined;
  "/register": undefined;
  "/handle-redirect": undefined;
  "/modal": undefined;
  "/loan-request-modal": {
    id: string;
    nombre: string;
    categoria: string;
  };
  "/product-details": {
    id: string;
    nombre: string;
    categoria: string;
    estado: string;
    imagen?: string;
  };
  "/(tabs)": undefined;
  "/(tabs)/index": undefined;
  "/(tabs)/dashboard": undefined;
  "/(tabs)/profile": undefined;
  "/(tabs)/history": undefined;
  "/admin": undefined;
  "/admin/index": undefined;
  "/admin/equipos": undefined;
  "/admin/equipos/modal": undefined;
};

// Type-safe navigation
export type AppRoutes = keyof AppRouteParams;

// Helper types for type-safe navigation
export type NavigateOptions<T extends AppRoutes> = {
  pathname: T;
  params?: AppRouteParams[T];
};

// Augment the global ReactNavigation namespace
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRouteParams {
      // This empty interface creates a proper type augmentation
      _: never;
    }
  }
}