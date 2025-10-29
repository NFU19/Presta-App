
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const HandleRedirectScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, let's get their role from Firestore
        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('User role:', userData.role);
          // Redirect based on role
          if (userData.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          // Fallback if user doc doesn't exist
          console.log('User document not found, redirecting to user view.');
          router.replace('/(tabs)');
        }
      } else {
        // User is signed out
        router.replace('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
});

export default HandleRedirectScreen;
