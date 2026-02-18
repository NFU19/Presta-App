import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "success" | "warning" | "info";
}

const mockNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Solicitud aprobada",
    message: "Tu préstamo de la Laptop Dell XPS fue aprobado.",
    timestamp: "Hace 2 horas",
    type: "success",
  },
  {
    id: "n-2",
    title: "Recordatorio de devolución",
    message: "Entrega el Teclado Redragon mañana antes de las 12:00.",
    timestamp: "Hace 6 horas",
    type: "warning",
  },
  {
    id: "n-3",
    title: "Solicitud rechazada",
    message: "La Cámara Canon no está disponible en la fecha solicitada.",
    timestamp: "Ayer",
    type: "info",
  },
];

const typeStyles = {
  success: {
    icon: "checkmark-circle-outline" as const,
    color: Colors.light.success,
  },
  warning: {
    icon: "alert-circle-outline" as const,
    color: Colors.light.warning,
  },
  info: {
    icon: "information-circle-outline" as const,
    color: Colors.light.primary,
  },
};

const NotificationsScreen = () => {
  const router = useRouter();
  const data = useMemo(() => mockNotifications, []);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const tokens = typeStyles[item.type];
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${tokens.color}1A` },
            ]}
          >
            {" "}
            {/* 10% alpha */}
            <Ionicons name={tokens.icon} size={22} color={tokens.color} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.cardTimestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header hideLeftButton>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notificaciones</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={18} color={Colors.light.textDark} />
          </TouchableOpacity>
        </View>
      </Header>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.textDark,
  },
  iconButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardLeft: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.textDark,
  },
  cardMessage: {
    fontSize: 14,
    color: Colors.light.text,
  },
  cardTimestamp: {
    fontSize: 12,
    color: Colors.light.gray,
  },
});

export default NotificationsScreen;
