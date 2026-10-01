import { Button, StyleSheet, Text, View } from "react-native";

import type { Book } from "../types";

type Props = {
  book: Book;
  canManage: boolean;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
};

export default function BookItem({
  book,
  canManage,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.item}>
      <View style={styles.info}>
        <Text style={styles.title}>{book.title}</Text>
        <Text>{book.author}</Text>
      </View>

      {canManage && (
        <View style={styles.actions}>
          <Button title="Edit" onPress={() => onEdit(book)} />
          <Button
            title="Delete"
            color="#b00020"
            onPress={() => onDelete(book.id)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  info: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
});
