import { Redirect } from 'expo-router';

export default function Index() {
  // Redirige directamente al landing page
  return <Redirect href="./landing" />;
}
