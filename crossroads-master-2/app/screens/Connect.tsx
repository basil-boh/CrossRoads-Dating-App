import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../firebaseConfig';
import { collection, getDocs, setDoc, doc, query, where, getDoc, writeBatch, GeoPoint } from 'firebase/firestore';
import * as Location from 'expo-location';
import { geohashForLocation, distanceBetween } from 'geofire-common';

interface ConnectProps {
    navigation: NavigationProp<any, any>;
}

const Connect = ({ navigation }: ConnectProps) => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [singleProfileData, setSingleProfileData] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matchedUserIds, setMatchedUserIds] = useState<string[]>([]);
    const [location, setLocation] = useState(null);
    const user = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        const fetchLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            // Update user location in Firestore
            const geohash = geohashForLocation([location.coords.latitude, location.coords.longitude]);
            await setDoc(doc(FIREBASE_FIRESTORE, 'profiles', user.uid), {
                location: new GeoPoint(location.coords.latitude, location.coords.longitude),
                geohash: geohash
            }, { merge: true });
        };

        fetchLocation();
    }, []);

    useEffect(() => {
        const fetchProfiles = async () => {
            if (!location) return;

            try {
                const matchedUsersQuery = query(collection(FIREBASE_FIRESTORE, 'matches'), where('userId', '==', user.uid));
                const matchedUsersSnapshot = await getDocs(matchedUsersQuery);
                const matchedIds = matchedUsersSnapshot.docs.map(doc => doc.data().matchedUserId);
                setMatchedUserIds(matchedIds);

                const querySnapshot = await getDocs(collection(FIREBASE_FIRESTORE, 'profiles'));
                const docRef = doc(FIREBASE_FIRESTORE, 'profiles', user.uid);
                const docSnap = await getDoc(docRef);
                const profilesData: any[] = [];

                querySnapshot.forEach((doc) => {
                    const profileData = doc.data();
                    if (
                        profileData.userId !== user.uid &&
                        !matchedIds.includes(profileData.userId) &&
                        profileData.location &&
                        profileData.profileName && // Check if profile name exists
                        profileData.profileImage // Check if profile image exists
                    ) {
                        const distance = distanceBetween(
                            [location.coords.latitude, location.coords.longitude],
                            [profileData.location.latitude, profileData.location.longitude]
                        );
                        if (distance <= 5) { // distance in km
                            profilesData.push({ id: doc.id, ...profileData });
                        }
                    }
                });

                setSingleProfileData(docSnap.data());
                setProfiles(profilesData);
            } catch (error) {
                console.error('Error fetching profiles: ', error);
            }
        };

        fetchProfiles();
    }, [location, user]);

    const handleReject = () => {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handleAccept = async () => {
        if (profiles.length === 0) return;

        const likedUserId = profiles[currentIndex].userId;

        try {
            // Set the like from the current user to the liked user
            await setDoc(doc(FIREBASE_FIRESTORE, 'likes', `${user.uid}_${likedUserId}`), {
                userId: user.uid,
                likedUserId: likedUserId,
            });

            // Check if the liked user has already liked the current user
            const mutualLikeDoc = await getDoc(doc(FIREBASE_FIRESTORE, 'likes', `${likedUserId}_${user.uid}`));
            if (mutualLikeDoc.exists()) {
                const profile = profiles[currentIndex];
                // Create batch for writing match documents
                const batch = writeBatch(FIREBASE_FIRESTORE);

                const matchDocRef1 = doc(FIREBASE_FIRESTORE, 'matches', `${user.uid}_${likedUserId}`);
                const matchDocRef2 = doc(FIREBASE_FIRESTORE, 'matches', `${likedUserId}_${user.uid}`);

                batch.set(matchDocRef1, {
                    userId: user.uid,
                    matchedUserId: likedUserId,
                    matchedUserName: profile.profileName,
                    matchedUserProfilePic: profile.profileImage,
                });
                batch.set(matchDocRef2, {
                    userId: likedUserId,
                    matchedUserId: user.uid,
                    matchedUserName: singleProfileData.profileName || user.email,
                    matchedUserProfilePic: singleProfileData.profileImage || user.photoURL, // Ensure this is the user's profile picture
                });

                await batch.commit();

                // Remove the matched user from the profiles list
                setProfiles(prevProfiles => prevProfiles.filter(profile => profile.userId !== likedUserId));
            }
        } catch (error) {
            console.error('Error handling like: ', error);
        }

        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const navigateToEvents = () => {
        navigation.navigate('Events');
    };

    const renderProfile = (profile) => (
        <View style={styles.userAvailableContainer}>
            <Text style={styles.title}>Love is right around the corner!</Text>
            <Image source={{ uri: profile.profileImage }} style={styles.userImage} />
            <Text style={styles.subtitle}>Match with {profile.profileName}?</Text>
            <Text style={styles.profileDetails}>Age: {profile.age}</Text>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                    <Text style={styles.rejectButtonText}>✗</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                    <Text style={styles.acceptButtonText}>✓</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/connect_background.png')} style={styles.background}>
            <View style={styles.container}>
                {profiles.length > 0 ? (
                    renderProfile(profiles[currentIndex])
                ) : (
                    <View style={styles.noUserContainer}>
                        <Text style={styles.title}>It’s real quiet around this area!</Text>
                        <Text style={styles.subtitle}>Why not sign up for some activities?</Text>
                        <TouchableOpacity style={styles.navigateButton} onPress={navigateToEvents}>
                            <Text style={styles.navigateButtonText}>Go to Events</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <NavigationTab navigation={navigation} />
            </View>
        </ImageBackground>
    );
};

const NavigationTab = ({ navigation }: RouterProps) => {
    const tabs = [
        { name: "Home", icon: "🏠" },
        { name: "Events", icon: "📅" },
        { name: "Connect", icon: "🌐" },
        { name: "Matches", icon: "❤️" },
        { name: "Profile", icon: "👤" },
    ];

    return (
        <View style={styles.navigationTabContainer}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.tabButton}
                    onPress={() => navigation.navigate(tab.name)}
                >
                    <Text style={styles.tabIcon}>{tab.icon}</Text>
                    <Text style={styles.tabText}>{tab.name}</Text>
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
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    userAvailableContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noUserContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    userImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    profileDetails: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
    },
    rejectButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 50,
    },
    rejectButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 50,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    navigateButton: {
        backgroundColor: '#72bcd4',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    navigateButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    navigationTabContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ddd',
        paddingVertical: 10,
    },
    tabButton: {
        alignItems: 'center',
    },
    tabIcon: {
        fontSize: 24,
    },
    tabText: {
        fontSize: 12,
    },
});

export default Connect;

