import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, ScrollView, Platform, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE, FIREBASE_STORAGE } from '../../firebaseConfig';
import { NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const EditProfile = ({ navigation }: RouterProps) => {
    const [gridImages, setGridImages] = useState<string[]>(Array(6).fill(null));
    const [profileName, setProfileName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [aboutMe, setAboutMe] = useState<string>('');
    const user = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        const loadProfileData = async () => {
            if (user) {
                const docRef = doc(FIREBASE_FIRESTORE, 'profiles', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const profileData = docSnap.data();
                    setGridImages(profileData.gridImages || Array(6).fill(null));
                    setProfileName(profileData.profileName || '');
                    setAge(profileData.age || '');
                    setAboutMe(profileData.aboutMe || '');
                }
            }
        };

        loadProfileData();
    }, [user]);

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

            if (user) {
                setGridImages(prevGridImages => {
                    const newGridImages = [...prevGridImages];
                    newGridImages[index] = uploadUrl;
                    AsyncStorage.setItem(`${user.uid}_gridImages`, JSON.stringify(newGridImages));
                    return newGridImages;
                });
                saveProfileToFirestore(user.uid, newGridImages, profileName, age, aboutMe);
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

        const fileRef = ref(FIREBASE_STORAGE, `images/${user.uid}/${Date.now()}`);
        await uploadBytes(fileRef, blob);

        blob.close();

        return await getDownloadURL(fileRef);
    };

    const saveProfileToFirestore = async (userId, gridImages, profileName, age, aboutMe) => {
        try {
            await setDoc(doc(FIREBASE_FIRESTORE, 'profiles', userId), {
                userId,
                gridImages,
                profileName,
                age,
                aboutMe,
                createdAt: new Date(),
            });
            console.log('Profile saved to Firestore');
        } catch (error) {
            console.error('Error saving profile to Firestore: ', error);
        }
    };

    const handleSaveAboutMe = async () => {
        if (user) {
            try {
                const docRef = doc(FIREBASE_FIRESTORE, 'profiles', user.uid);
                await updateDoc(docRef, {
                    aboutMe,
                });
                console.log('About Me saved to Firestore');
            } catch (error) {
                console.error('Error saving About Me to Firestore: ', error);
            }
        }
    };

    return (
        <ImageBackground source={require('../../assets/profile-bg.png')} style={styles.background}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <ProfileHeader profileImage={gridImages[0]} profileName={profileName} age={age} />
                    <ImageGrid gridImages={gridImages} handleImageUpload={handleImageUpload} />
                    <View style={styles.aboutMeContainer}>
                        <TextInput
                            style={styles.aboutMeInput}
                            placeholder="Tell us about yourself..."
                            value={aboutMe}
                            onChangeText={setAboutMe}
                            multiline={true}
                        />
                        <TouchableOpacity onPress={handleSaveAboutMe} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const ProfileHeader = ({ profileImage, profileName, age }: { profileImage: string | null, profileName: string, age: string }) => {
    return (
        <View style={styles.profileContainer}>
            {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>No Image</Text>
                </View>
            )}
            <Text style={styles.profileText}>{`${profileName}, ${age}`}</Text>
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
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    profileContainer: {
        marginTop: -120,
        width: '100%',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        zIndex: 1,
    },
    profileText: {
        color: 'black',
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    placeholderText: {
        color: '#757575',
        fontSize: 16,
    },
    aboutMeContainer: {
        alignItems: 'center',
        marginVertical: 20,
        width: '90%',
        marginTop: 10, 
    },
    aboutMeInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        marginBottom: 10, 
    },
    saveButton: {
        backgroundColor: '#72bcd4',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 20,
        marginTop: 20,
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
});

export default EditProfile;
