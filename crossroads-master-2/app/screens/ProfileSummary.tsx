import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { FIREBASE_FIRESTORE } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: RouteProp<{ params: { userId: string } }, 'params'>;
}

const ProfileSummary = ({ navigation, route }: RouterProps) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(FIREBASE_FIRESTORE, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchProfile();

    navigation.setOptions({
      headerShown: false,
    });
  }, [userId, navigation]);

  const handleNextImage = () => {
    if (profile && currentIndex < profile.gridImages.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const gridImages = [profile.profileImage, ...profile.gridImages].filter(Boolean);
  const aboutMeText = profile.aboutMe
    ? profile.aboutMe
    : `${profile.profileName} has yet to update their profile`;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{profile.profileName}, {profile.age}</Text>
      </View>
      <View style={styles.imageContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.leftHalf} onPress={handlePrevImage} />
        )}
        <Image source={{ uri: gridImages[currentIndex] }} style={styles.image} />
        {currentIndex < gridImages.length - 1 && (
          <TouchableOpacity style={styles.rightHalf} onPress={handleNextImage} />
        )}
      </View>
      <View style={styles.aboutMeContainer}>
        <Text style={styles.aboutMeText}>{aboutMeText}</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    paddingVertical: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    position: 'relative',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 5,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  leftHalf: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    left: 0,
    zIndex: 2,
  },
  rightHalf: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    right: 0,
    zIndex: 2,
  },
  aboutMeContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#72bcd4',
    borderRadius: 10,
    padding: 20,
  },
  aboutMeText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default ProfileSummary;
