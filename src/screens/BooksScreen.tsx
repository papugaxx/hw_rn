import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BookItem from "../components/BookItem";
import { saveBooks } from "../services/storage";
import type { Book, User } from "../types";

type Props = {
  currentUser: User;
  books: Book[];
  setBooks: Dispatch<SetStateAction<Book[]>>;
  onLogout: () => Promise<void>;
};

export default function BooksScreen({
  currentUser,
  books,
  setBooks,
  onLogout,
}: Props) {
  const canManage = currentUser.role === "admin";
  const [newBook, setNewBook] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
  });
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleAddBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      Alert.alert("Помилка", "Заповніть назву книги та автора");
      return;
    }

    const book: Book = {
      id: Date.now().toString(),
      title: newBook.title.trim(),
      author: newBook.author.trim(),
    };

    const updatedBooks = [...books, book];
    setBooks(updatedBooks);
    await saveBooks(updatedBooks);
    setNewBook({ title: "", author: "" });
  };

  const handleDeleteBook = async (bookId: string) => {
    const updatedBooks = books.filter((book) => book.id !== bookId);
    setBooks(updatedBooks);
    await saveBooks(updatedBooks);
  };

  const handleUpdateBook = async () => {
    if (!editingBook?.title.trim() || !editingBook.author.trim()) {
      Alert.alert("Помилка", "Заповніть назву книги та автора");
      return;
    }

    const updatedBooks = books.map((book) =>
      book.id === editingBook.id
        ? {
            ...book,
            title: editingBook.title.trim(),
            author: editingBook.author.trim(),
          }
        : book
    );

    setBooks(updatedBooks);
    await saveBooks(updatedBooks);
    setEditingBook(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.userText}>
        User: {currentUser.username} ({currentUser.role})
      </Text>

      <FlatList
        style={styles.list}
        data={books}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>List is empty</Text>}
        renderItem={({ item }) => (
          <BookItem
            book={item}
            canManage={canManage}
            onEdit={setEditingBook}
            onDelete={handleDeleteBook}
          />
        )}
      />

      {canManage ? (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Add book</Text>
          <TextInput
            placeholder="Book Title"
            value={newBook.title}
            onChangeText={(title) => setNewBook({ ...newBook, title })}
            style={styles.input}
          />
          <TextInput
            placeholder="Author"
            value={newBook.author}
            onChangeText={(author) => setNewBook({ ...newBook, author })}
            style={styles.input}
          />
          <Button title="Add Book" onPress={handleAddBook} />
        </View>
      ) : (
        <Text style={styles.viewerMessage}>
          Зміни книг недоступні
        </Text>
      )}

      <View style={styles.logoutButton}>
        <Button title="Logout" color="#555" onPress={onLogout} />
      </View>

      <Modal
        visible={editingBook !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingBook(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.sectionTitle}>Edit book</Text>

            <TextInput
              placeholder="Book Title"
              value={editingBook?.title ?? ""}
              onChangeText={(title) =>
                setEditingBook((previous) =>
                  previous ? { ...previous, title } : previous
                )
              }
              style={styles.input}
            />

            <TextInput
              placeholder="Author"
              value={editingBook?.author ?? ""}
              onChangeText={(author) =>
                setEditingBook((previous) =>
                  previous ? { ...previous, author } : previous
                )
              }
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button title="Save" onPress={handleUpdateBook} />
              <Button
                title="Cancel"
                color="#777"
                onPress={() => setEditingBook(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userText: {
    marginBottom: 8,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  form: {
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  viewerMessage: {
    paddingVertical: 16,
    color: "#666",
  },
  logoutButton: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalActions: {
    gap: 8,
  },
});
