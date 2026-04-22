import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [image, setImage] = useState<string | null>(null);

  const openCamera = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Gallery permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveImage = async () => {
    if (!image) {
      alert("No image to save!");
      return;
    }

    try {
      const perm = await MediaLibrary.requestPermissionsAsync(true);

      console.log("PERMISSION:", perm);

      if (perm.status !== "granted") {
        alert("Permission NOT granted!");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(image);

      alert("Image saved to gallery!");
    } catch (error) {
      console.log("ERROR:", error);
      alert("Failed to save image");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Evelyne Natalie - 00000095285</Text>

      <View style={styles.button}>
        <Button title="OPEN CAMERA" onPress={openCamera} />
      </View>

      <View style={styles.button}>
        <Button title="OPEN GALLERY" onPress={openGallery} />
      </View>

      <View style={styles.button}>
        <Button title="SAVE IMAGE" onPress={saveImage} />
      </View>

      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 5,
    width: 150,
  },
  image: {
    width: 250,
    height: 200,
    marginTop: 20,
  },
});
