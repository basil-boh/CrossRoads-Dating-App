import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FIREBASE_FIRESTORE, FIREBASE_AUTH } from '../../firebaseConfig';
import moment from 'moment';

interface NewsFeedProps {
    navigation: NavigationProp<any, any>;
}

const NewsFeed = ({ navigation }: NewsFeedProps) => {
    const [posts, setPosts] = useState<any[]>([]);
    const user = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;
    
            // Fetch matches
            const matchesQuery = query(collection(FIREBASE_FIRESTORE, 'matches'), where('userId', '==', user.uid));
            const matchesSnapshot = await getDocs(matchesQuery);
            const matchIds = matchesSnapshot.docs.map(doc => doc.data().matchedUserId);
    
            // Fetch posts from the user and their matches
            const postsQuery = query(
                collection(FIREBASE_FIRESTORE, 'posts'),
                where('userId', 'in', [user.uid, ...matchIds]),
                orderBy('createdAt', 'desc')
            );
            const postsSnapshot = await getDocs(postsQuery);
            const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
            setPosts(postsData);
        };
    
        fetchPosts();
    }, [user]);

    const renderItem = ({ item }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <Image source={{ uri: item.posterProfileImage }} style={styles.posterProfileImage} />
                <Text style={styles.posterName}>{item.posterName}</Text>
            </View>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            <View style={styles.postCaptionContainer}>
                <Text style={styles.postCaption}>{item.caption}</Text>
                <Text style={styles.postDate}>{moment(item.createdAt.toDate()).fromNow()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>News Feed</Text>
            </View>
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={() => (
                    <View style={styles.noPostsContainer}>
                        <Text style={styles.noPostsText}>It’s pretty quiet here, why not join some events?</Text>
                    </View>
                )}
            />
            <NavigationTab navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        width: '100%',
        backgroundColor: '#72bcd4',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontSize: 22,
    },
    contentContainer: {
        padding: 10,
        paddingBottom: 80, 
    },
    postContainer: {
        marginBottom: 20,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    posterProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    posterName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    postImage: {
        width: '100%',
        height: 400, 
        resizeMode: 'cover',
        borderRadius: 10,
    },
    postCaptionContainer: {
        marginTop: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
    },
    postCaption: {
        fontSize: 16,
        color: '#333',
    },
    postDate: {
        fontSize: 12,
        color: '#777',
        marginTop: 5,
    },
    noPostsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPostsText: {
        fontSize: 18,
        color: '#757575',
        textAlign: 'center',
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

const NavigationTab = ({ navigation }: NewsFeedProps) => {
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

export default NewsFeed;

