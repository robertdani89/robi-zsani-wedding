import { Alert, Platform } from "react-native";

export const showMessage = (
  title: string,
  message: string,
  onDismiss?: () => void,
  okLabel = "OK",
): void => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onDismiss?.();
    return;
  }

  Alert.alert(title, message, [
    {
      text: okLabel,
      onPress: onDismiss,
    },
  ]);
};

export const showDecision = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel?: () => void;
}): void => {
  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      `${title}\n\n${message}\n\nOK = ${confirmText}\nCancel = ${cancelText}`,
    );

    if (confirmed) {
      onConfirm();
      return;
    }

    onCancel?.();
    return;
  }

  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: confirmText,
      onPress: onConfirm,
    },
  ]);
};
