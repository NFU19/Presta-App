import { Redirect } from 'expo-router';

// This component redirects the user to the login screen by default.
export default function EntryPoint() {
  return <Redirect href="/login" />;
}
