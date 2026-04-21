import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";
import { showMessage } from "@/utils/alert";
import { useEvent } from "@/context/EventContext";
import { useFonts } from "expo-font";
import { useLocalSearchParams } from "expo-router";
import { useLocalization } from "@/context/LocalizationContext";
import { useRouter } from "expo-router";

export default function JoinEventScreen() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();
  const { t } = useLocalization();
  const { joinEvent } = useEvent();
  const params = useLocalSearchParams<{ code?: string; rejoin?: string }>();
  const [fontsLoaded] = useFonts({
    GreatVibes: require("@/assets/GreatVibes-Regular.ttf"),
  });

  useEffect(() => {
    const joinEventIfNeeded = async () => {
      if (params.code && params.rejoin === "1") {
        await joinEvent(params.code);
        router.replace("/dashboard");
      } else if (params.code) {
        setCode(params.code);
      }
    };

    joinEventIfNeeded();
  }, [params.code, params.rejoin]);

  if (!fontsLoaded) {
    return null;
  }

  const handleJoinWithCode = async (eventCode?: string) => {
    const trimmedCode = (eventCode ?? code).trim();

    if (!trimmedCode) {
      showMessage(t("joinEvent.requiredTitle"), t("joinEvent.codeRequired"));
      return;
    }

    setIsLoading(true);

    try {
      await joinEvent(trimmedCode);
      router.replace("/identify");
    } catch (error) {
      console.error("Join event error:", error);
      showMessage(t("joinEvent.errorTitle"), t("joinEvent.errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);
    const scannedCode = data.trim().toUpperCase();
    setCode(scannedCode);
    handleJoinWithCode(scannedCode);
  };

  if (showScanner) {
    // Lazy-load camera for QR scanning
    const CameraView = require("expo-camera").CameraView;

    return (
      <View style={styles.scannerContainer}>
        <StatusBar style="light" />
        <CameraView
          style={styles.scanner}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerText}>{t("joinEvent.scanHint")}</Text>
          <TouchableOpacity
            style={styles.scannerCloseButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.scannerCloseText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <StatusBar style="dark" />
        <LanguageSwitcher />

        <View style={styles.content}>
          <Card>
            <Text style={[styles.text, styles.title]}>
              {t("joinEvent.title")}
            </Text>
            <Text style={[styles.text, styles.subtitle]}>
              {t("joinEvent.subtitle")}
            </Text>
          </Card>

          <Card style={styles.inputContainer}>
            <Text style={styles.label}>{t("joinEvent.codeLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("joinEvent.codePlaceholder")}
              placeholderTextColor="#999"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => handleJoinWithCode()}
              editable={!isLoading}
              maxLength={10}
            />
          </Card>

          <View style={styles.actions}>
            <Button
              title={t("joinEvent.join")}
              onPress={() => handleJoinWithCode()}
              disabled={!code.trim() || code.trim().length < 4 || isLoading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("joinEvent.or")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title={t("joinEvent.scanQR")}
              onPress={() => setShowScanner(true)}
            />

            <View style={styles.spacer} />
            <Button title={t("common.back")} onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "GreatVibes",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 50,
    marginBottom: 50,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 30,
    color: "#D4526E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#7D5260",
  },
  inputContainer: {
    marginTop: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFD1DC",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 22,
    color: "#333",
    textAlign: "center",
    letterSpacing: 4,
    fontWeight: "700",
  },
  actions: {
    marginTop: 30,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: "#999",
  },
  spacer: {
    height: 12,
  },
  scannerContainer: {
    flex: 1,
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scannerText: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scannerCloseButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scannerCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
