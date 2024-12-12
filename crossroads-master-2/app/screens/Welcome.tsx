// import React, { useEffect, useState } from 'react';
// import { View, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from 'react-native';
// import { NavigationProp } from '@react-navigation/native';
// import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../../firebaseConfig';
// import { doc, getDoc } from 'firebase/firestore';

// interface RouterProps {
//     navigation: NavigationProp<any, any>;
// }

// const Welcome = ({ navigation }: RouterProps) => {
//     const [userName, setUserName] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchUserProfile = async () => {
//             const user = FIREBASE_AUTH.currentUser;
//             if (user) {
//                 const docRef = doc(FIREBASE_FIRESTORE, 'profiles', user.uid);
//                 const docSnap = await getDoc(docRef);

//                 if (docSnap.exists()) {
//                     setUserName(docSnap.data().profileName || user.email); // Default to email if profileName is not set
//                 } else {
//                     setUserName(user.email); // Fallback to email if no profile found
//                 }
//             }
//         };

//         fetchUserProfile();
//     }, []);

//     return (
//         <View style={styles.container}>
//             <TouchableOpacity onPress={() => navigation.navigate('Home')}>
//                 <Image source={require('../../assets/loadingscreen2.png')} style={styles.image} />
//             </TouchableOpacity>
//             <Text style={styles.overlayText}>Hello,{'\n'}{userName}</Text>
//         </View>
//     );
// }

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         paddingTop: 20,
//         paddingBottom: 20,
//     },
//     image: {
//         width: 500,
//         height: 1000,
//         resizeMode: 'contain',
//     },
//     logoutButtonContainer: {
//         position: 'absolute',
//         bottom: 5,
//         width: 100,
//         left: 150,
//     },
//     logoutButton: {
//         backgroundColor: '#72bcd4',
//         paddingVertical: 5,
//         paddingHorizontal: 20,
//         borderRadius: 5,
//     },
//     logoutButtonText: {
//         color: '#fff',
//         textAlign: 'center',
//     },
//     overlayText: {
//         position: 'absolute',
//         top: '50%',
//         left: 170,
//         transform: [{ translateX: -width * 0.25 }, { translateY: -10 }],
//         fontSize: 24,
//         color: '#fff',
//         fontWeight: 'bold',
//         textAlign: 'center',
//     },
// });

// export default Welcome;

