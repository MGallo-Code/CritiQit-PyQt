import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { RatingService } from './src/services/RatingService';
import { formatScore } from './src/models/Rating';

export default function App() {
  const [title, setTitle] = useState('');
  const [score, setScore] = useState('');
  const [textReview, setTextReview] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const refresh = async () => setItems(await RatingService.listAll());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>CritiQit (Movies v0)</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Score (optional, 0.000 - 10.000)" value={score} onChangeText={setScore} style={styles.input} />
      <TextInput placeholder="Text review" value={textReview} onChangeText={setTextReview} style={styles.input} />
      <Button
        title="Add Rating"
        onPress={async () => {
          const parsed = parseFloat(score);
          const numeric = Number.isNaN(parsed) ? undefined : Math.max(0, Math.min(10, parsed));
          const oneScore = numeric == null ? undefined : Math.round(numeric * 1000);
          await RatingService.create({ title, oneScore, textReview });
          setTitle('');
          setScore('');
          setTextReview('');
          refresh();
        }}
      />

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        style={{ marginTop: 16, width: '100%' }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            {item.oneScore != null ? <Text>Score: {formatScore(item.oneScore)}</Text> : <Text>No score</Text>}
            {item.textReview ? <Text>Review: {item.textReview}</Text> : null}
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6, marginBottom: 8 },
  card: { width: '100%', borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 8, marginBottom: 10 },
});
