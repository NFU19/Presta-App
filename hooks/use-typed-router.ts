import { useRouter } from 'expo-router';
import { AppRoutes, NavigateOptions } from '../types/router';

export function useTypedRouter() {
  const router = useRouter();

  function push<T extends AppRoutes>(options: NavigateOptions<T>) {
    router.push(options as any);
  }

  function replace<T extends AppRoutes>(options: NavigateOptions<T>) {
    router.replace(options as any);
  }

  return {
    ...router,
    push,
    replace
  };
}