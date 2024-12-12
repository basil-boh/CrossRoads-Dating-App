import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { NavigationProp } from '@react-navigation/native';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: RouterProps) => {
    const handleLogout = () => {
        FIREBASE_AUTH.signOut();
    };

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.contentContainer}>
                <Text style={styles.heading}>Welcome to CrossRoads</Text>
                <Text style={styles.subHeading}>Explore, Connect, and Share</Text>

                {/* Feature Section: News Feed */}
                <TouchableOpacity style={styles.featureContainer} onPress={() => navigation.navigate('NewsFeed')}>
                    <Text style={styles.featureText}>News Feed 📰</Text>
                    <Text style={styles.featureDescription}>Stay updated with posts from friends and communities</Text>
                </TouchableOpacity>

                {/* Feature Section: Events */}
                <TouchableOpacity style={styles.featureContainer} onPress={() => navigation.navigate('Events')}>
                    <Text style={styles.featureText}>Events 📅</Text>
                    <Text style={styles.featureDescription}>Discover and join events happening soon</Text>
                </TouchableOpacity>

                {/* Feature Section: Connect */}
                <TouchableOpacity style={styles.featureContainer} onPress={() => navigation.navigate('Connect')}>
                    <Text style={styles.featureText}>Connect 🌐</Text>
                    <Text style={styles.featureDescription}>Meet new people near you</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Navigation Tab */}
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
    headerText: {
        color: 'white',
        fontSize: 24,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 100,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subHeading: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 30,
        textAlign: 'center',
    },
    featureContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    featureText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    featureDescription: {
        fontSize: 14,
        color: 'gray',
    },
    logoutButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: '#72bcd4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
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

export default Home;
