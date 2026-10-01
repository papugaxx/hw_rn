import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BooksScreen from "./BooksScreen";
import LoginScreen from "./LoginScreen";
import SettingsScreen from "./SettingsScreen";
import { clearSession, getBooks, getSession } from "../services/storage";
import type { Book, User } from "../types";

export type HomeTabParamList = {
  Books: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

export default function HomeScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [storedBooks, session] = await Promise.all([
        getBooks(),
        getSession(),
      ]);
      setBooks(storedBooks);
      setCurrentUser(session);
      setLoading(false);
    };

    void loadData();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Books"
      >
        {() => (
          <BooksScreen
            currentUser={currentUser}
            books={books}
            setBooks={setBooks}
            onLogout={handleLogout}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
      >
        {() => <SettingsScreen currentUser={currentUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
