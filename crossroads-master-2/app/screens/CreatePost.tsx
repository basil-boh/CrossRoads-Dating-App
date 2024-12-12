import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE, FIREBASE_STORAGE } from '../../firebaseConfig';
import { NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const CreatePost = ({ navigation }: RouterProps) => {
    const [caption, setCaption] = useState<string>('');
    const [postImage, setPostImage] = useState<string | null>(null);
    const user = FIREBASE_AUTH.currentUser;

    const handleImageUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            const imageUri = pickerResult.assets[0].uri;
            const uploadUrl = await uploadImageAsync(imageUri);
            setPostImage(uploadUrl);
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

        const fileRef = ref(FIREBASE_STORAGE, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(fileRef, blob);

        blob.close();

        return await getDownloadURL(fileRef);
    };

    const handleCreatePost = async () => {
        if (user && postImage) {
            const userDoc = await getDoc(doc(FIREBASE_FIRESTORE, 'profiles', user.uid));
            const userData = userDoc.data();
            const posterName = userData?.profileName || 'Unknown';
            const posterProfileImage = userData?.profileImage || null;

            try {
                await setDoc(doc(FIREBASE_FIRESTORE, 'posts', `${user.uid}_${Date.now()}`), {
                    userId: user.uid,
                    caption: caption,
                    imageUrl: postImage,
                    posterName: posterName,
                    posterProfileImage: posterProfileImage,
                    createdAt: new Date(),
                });
                console.log('Post created successfully');
                navigation.goBack();
            } catch (error) {
                console.error('Error creating post: ', error);
            }
        }
    };

    return (
        <ImageBackground source={require('../../assets/profile-bg.png')} style={styles.background}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
                    <Text style={styles.imageUploadButtonText}>Upload Image</Text>
                </TouchableOpacity>
                {postImage && <Image source={{ uri: postImage }} style={styles.postImage} />}
                <TextInput
                    style={styles.captionInput}
                    placeholder="Write a caption..."
                    value={caption}
                    onChangeText={setCaption}
                />
                <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
                    <Text style={styles.createPostButtonText}>Share</Text>
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    captionInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    imageUploadButton: {
        backgroundColor: '#72bcd4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    imageUploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    postImage: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    createPostButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    createPostButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CreatePost;
