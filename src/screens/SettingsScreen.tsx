import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getUsers, registerViewer } from "../services/storage";
import type { User } from "../types";

type Props = {
  currentUser: User;
};

export default function SettingsScreen({ currentUser }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const storedUsers = await getUsers();
    setUsers(storedUsers);
  };

  useEffect(() => {
    if (currentUser.role === "admin") {
      void loadUsers();
    }
  }, [currentUser.role]);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Помилка", "Заповніть логін і пароль");
      return;
    }

    try {
      const updatedUsers = await registerViewer(
        username.trim(),
        password.trim()
      );
      setUsers(updatedUsers);
      setUsername("");
      setPassword("");
      Alert.alert("Готово", "Користувача зареєстровано");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не вдалося створити користувача";
      Alert.alert("Помилка", message);
    }
  };

  if (currentUser.role !== "admin") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Text style={styles.title}>Settings</Text>
        <Text>Для звичайного користувача немає налаштувань</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Register viewer</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Register user" onPress={handleRegister} />

      <Text style={styles.subtitle}>Registered users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Ще немає користувачів</Text>}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.username}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    color: "#666",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  role: {
    color: "#666",
  },
});
