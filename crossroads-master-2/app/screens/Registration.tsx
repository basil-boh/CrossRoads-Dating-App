import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE, FIREBASE_STORAGE } from '../../firebaseConfig';
import { NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface RegistrationProps {
    navigation: NavigationProp<any, any>;
    route: any;
}

const Registration = ({ navigation, route }: RegistrationProps) => {
    const { userId } = route.params;
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gridImages, setGridImages] = useState<string[]>(Array(6).fill(null));
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handleImageUpload = async (index: number) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            const imageUri = pickerResult.assets[0].uri;
            const uploadUrl = await uploadImageAsync(imageUri);
            setGridImages(prevGridImages => {
                const newGridImages = [...prevGridImages];
                newGridImages[index] = uploadUrl;
                return newGridImages;
            });

            // Set the first uploaded image as the profile image
            if (!profileImage) {
                setProfileImage(uploadUrl);
            }
        }
    };

    const uploadImageAsync = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function () {
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

        const fileRef = ref(FIREBASE_STORAGE, `images/${userId}/${Date.now()}`);
        await uploadBytes(fileRef, blob);

        blob.close();

        return await getDownloadURL(fileRef);
    };

    const handleRegistration = async () => {
        if (!name || !age || !profileImage) {
            Alert.alert('Validation Error', 'Please fill in all fields and upload at least one picture.');
            return;
        }

        try {
            await setDoc(doc(FIREBASE_FIRESTORE, 'profiles', userId), {
                userId,
                profileName: name,
                age,
                profileImage, // Save the profile image URL
                gridImages,
                createdAt: new Date(),
            });
            navigation.navigate('Profile');
        } catch (error) {
            console.error('Error saving profile to Firestore: ', error);
            alert('Registration failed: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Complete Your Registration</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
            />
            <ImageGrid gridImages={gridImages} handleImageUpload={handleImageUpload} />
            <TouchableOpacity onPress={handleRegistration} style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
};

const ImageGrid = ({ gridImages, handleImageUpload }: { gridImages: string[], handleImageUpload: (index: number) => void }) => {
    return (
        <View style={styles.gridContainer}>
            {gridImages.slice(0, 6).map((imageUri, index) => (
                <TouchableOpacity key={index} onPress={() => handleImageUpload(index)} style={styles.gridItem}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.gridImage} />
                    ) : (
                        <View style={styles.gridPlaceholder}>
                            <Text style={styles.gridPlaceholderText}>+</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
    },
    gridItem: {
        width: '30%',
        aspectRatio: 1,
        margin: '1.5%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    gridPlaceholderText: {
        fontSize: 24,
        color: '#757575',
    },
    registerButton: {
        backgroundColor: '#72bcd4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    registerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Registration;
