import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ExampleImage } from "../lib/types";

interface Props {
  images: ExampleImage[];
}

export default function ExampleGallery({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Example Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((img, i) => (
          <View key={i} style={styles.item}>
            <Image source={{ uri: img.thumbnail_url }} style={styles.image} />
            <Text style={styles.attribution} numberOfLines={1}>
              {img.attribution}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#52B788",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  scroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  item: {
    marginRight: 12,
    width: 120,
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#1C3829",
  },
  attribution: {
    fontSize: 10,
    color: "#8CB49B",
    marginTop: 4,
    width: 120,
  },
});
