import { KeyboardDismissWrapper } from "@/components/ui/keyboard-dismiss-wrapper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const EquipoModalScreen = () => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [serie, setSerie] = useState("");
  const [estado, setEstado] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [foto, setFoto] = useState("");
  const [especificaciones, setEspecificaciones] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEstadoOptions, setShowEstadoOptions] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const router = useRouter();
  const { id } = useLocalSearchParams();

  const estadoOptions = ['disponible', 'agotado'];

  const handleEstadoSelect = (selectedEstado: string) => {
    setEstado(selectedEstado);
    setShowEstadoOptions(false);
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchArticulo();
    }
  }, [id]);

  const fetchArticulo = async () => {
    try {
      fetch(`http://217.182.64.251:8002/articulos/id/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setNombre(data.nombre || "");
          setCategoria(data.categoria || "");
          setMarca(data.marca || "");
          setModelo(data.modelo || "");
          setSerie(data.serie || "");
          setEstado(data.estado || "");
          setUbicacion(data.ubicacion || "");
          setCantidad(data.cantidad ? data.cantidad.toString() : "1");
          setFoto(data.foto || "");
          setEspecificaciones(data.especificaciones || "");
        })
        .catch((error) => {
          Alert.alert("Error", "No se pudo cargar el equipo.");
          console.error("Error fetching equipo: ", error);
        });
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el equipo.");
      console.error("Error fetching equipo: ", error);
    }
  };

  const handleSave = async () => {
    if (!nombre || !categoria) {
      Alert.alert(
        "Error",
        "Por favor, completa los campos nombre y categoría.",
      );
      return;
    }

    // Validar cantidad
    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      Alert.alert("Error", "La cantidad debe ser un número mayor a 0.");
      return;
    }

    const equipoData = {
      nombre,
      categoria,
      marca,
      modelo,
      serie,
      estado,
      ubicacion,
      cantidad: cantidadNum,
      foto,
      especificaciones,
    };

    try {
      if (isEditMode) {
        // make a post request to create articulo
        await fetch(`http://217.182.64.251:8002/articulos/crear`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, ...equipoData }),
        });
        Alert.alert("Éxito", "Equipo actualizado correctamente.");
      } else {
        await fetch(`http://217.182.64.251:8002/articulos/crear`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(equipoData),
        });
        Alert.alert("Éxito", "Equipo creado correctamente.");
      }
    } catch (error) {
      console.error("Error saving document: ", error);
      Alert.alert("Error", "No se pudo guardar el equipo.");
    }
  };

  return (
    <KeyboardDismissWrapper>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formWrapper}>
          <Text style={styles.title}>
            {isEditMode ? "Editar Equipo" : "Añadir Equipo"}
          </Text>

          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Text style={styles.label}>Nombre del Equipo *</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej. Laptop Dell Inspiron"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Categoría *</Text>
              <TextInput
                style={styles.input}
                value={categoria}
                onChangeText={setCategoria}
                placeholder="Ej. Laptop, Monitor, Proyector"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                value={marca}
                onChangeText={setMarca}
                placeholder="Ej. Dell, HP, Lenovo"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Modelo</Text>
              <TextInput
                style={styles.input}
                value={modelo}
                onChangeText={setModelo}
                placeholder="Ej. Inspiron 15 3000"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Serie</Text>
              <TextInput
                style={styles.input}
                value={serie}
                onChangeText={setSerie}
                placeholder="Ej. SN123456789"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Estado</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowEstadoOptions(!showEstadoOptions)}
              >
                <Text style={{ fontSize: 16, color: estado ? "#000" : "#999" }}>
                  {estado || "Selecciona el estado"}
                </Text>
              </TouchableOpacity>
              {showEstadoOptions && (
                <View style={styles.dropdownContainer}>
                  {estadoOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownOption,
                        hoveredOption === option && styles.dropdownOptionHovered
                      ]}
                      onPress={() => handleEstadoSelect(option)}
                      onMouseEnter={() => setHoveredOption(option)}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={ubicacion}
                onChangeText={setUbicacion}
                placeholder="Ej. Laboratorio 1, Estante B"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Cantidad (Stock) *</Text>
              <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                placeholder="Ej. 5"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formField, styles.formFieldFull]}>
              <Text style={styles.label}>Foto (URL)</Text>
              <TextInput
                style={styles.input}
                value={foto}
                onChangeText={setFoto}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </View>

            <View style={[styles.formField, styles.formFieldFull]}>
              <Text style={styles.label}>Especificaciones Técnicas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={especificaciones}
                onChangeText={setEspecificaciones}
                placeholder="Ej. Procesador Intel Core i7, 16GB RAM, SSD 512GB..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {foto ? (
              <View style={[styles.formField, styles.formFieldFull]}>
                <Text style={styles.label}>Previsualización</Text>
                <View style={styles.previewWrapper}>
                  <Image
                    source={{ uri: foto }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonGhost]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, styles.buttonGhostText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardDismissWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#f5f7fb",
  },
  formWrapper: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e6edf5",
    ...Platform.select({
      web: { boxShadow: "0 18px 48px rgba(10,37,64,0.12)" },
      default: {
        shadowColor: "#0A2540",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0A2540",
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  formField: {
    width: "48%",
    minWidth: 260,
    flexGrow: 1,
  },
  formFieldFull: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e4e9f2",
    ...Platform.select({
      web: { transition: "border-color 0.15s ease, box-shadow 0.15s ease" },
    }),
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  previewWrapper: {
    width: "100%",
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6edf5",
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 260,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  buttonPrimary: {
    backgroundColor: "#0A66FF",
    ...Platform.select({
      web: { boxShadow: "0 12px 24px rgba(10,102,255,0.25)" },
    }),
  },
  buttonGhost: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e9f2",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonGhostText: { color: "#4b5563" },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e9f2",
    borderRadius: 12,
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  dropdownOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    backgroundColor: "#fff",
    ...Platform.select({
      web: {
        transition: "all 1s ease-in-out",
      },
    }),
  },
  dropdownOptionHovered: {
    backgroundColor: "#b8b8b8",
    transform: "scale(1.02)",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
});

export default EquipoModalScreen;
