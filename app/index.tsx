import { decode } from "base64-arraybuffer";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../utils/supabase";

export default function Index() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);

  const getLastLocation = async () => {
    const { data } = await supabase
      .from("location")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setLocation({
        latitude: data[0].latitude,
        longitude: data[0].longitude,
      });
    }
  };

  const openCamera = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await getLastLocation();
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Gallery permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await getLastLocation();
    }
  };

  const saveImage = async () => {
    if (!image) {
      alert("No image to save!");
      return;
    }

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (!permission.granted) {
        alert("Media library permission is required!");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(image);

      const fileName = `photo_${Date.now()}.jpg`;

      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: "base64",
      });

      const arrayBuffer = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.log(uploadError);
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("photo").insert([
        {
          image_url: data.publicUrl,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      ]);

      if (insertError) {
        console.log(insertError);
        alert(insertError.message);
        return;
      }

      alert("Image saved successfully!");
    } catch (error: any) {
      console.log(error);
      alert(error.message);
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

      {location && (
        <>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </>
      )}
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
