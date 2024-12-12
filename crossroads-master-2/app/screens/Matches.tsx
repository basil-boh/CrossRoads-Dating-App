import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

interface MatchedUser {
    id: string;
    name: string;
    profilePic: string;
    age: number;
    additionalPics: string[];
}

const Matches = ({ navigation }: RouterProps) => {
    const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const user = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        const q = query(collection(FIREBASE_FIRESTORE, 'matches'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const matchesData: MatchedUser[] = [];
            querySnapshot.forEach((doc) => {
                const matchData = doc.data();
                matchesData.push({
                    id: matchData.matchedUserId,
                    name: matchData.matchedUserName,
                    profilePic: matchData.matchedUserProfilePic,
                    age: matchData.matchedUserAge,
                    additionalPics: matchData.additionalPics || [],
                });
            });
            setMatchedUsers(matchesData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching matches: ', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleProfilePress = (user: MatchedUser) => {
        navigation.navigate('ProfileSummary', {
            userId: user.id,
        });
    };

    const handleMessagePress = (user: MatchedUser) => {
        navigation.navigate('Message', {
            recipientId: user.id,
            recipientName: user.name
        });
    };

    const renderMatchedUser = ({ item }: { item: MatchedUser }) => (
        <View style={styles.userItem}>
            <TouchableOpacity style={styles.userDetails} onPress={() => handleProfilePress(item)}>
                <View style={styles.profilePicContainer}>
                    <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
                </View>
                <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton} onPress={() => handleMessagePress(item)}>
                <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>Your Matches</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={matchedUsers}
                    renderItem={renderMatchedUser}
                    keyExtractor={(item) => item.id}
                    style={styles.flatList}
                />
            )}
            <NavigationTab navigation={navigation} />
        </View>
    );
};

const Header = () => {
    return (
        <View style={styles.headerContainer}>
        </View>
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
        paddingTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        paddingTop: 15,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        width: '100%',
        backgroundColor: '#72bcd4',
        paddingVertical: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: {
        width: '100%',
        paddingHorizontal: 20,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 15,
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageButton: {
        backgroundColor: '#72bcd4',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    messageButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
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
    }
});

export default Matches;
