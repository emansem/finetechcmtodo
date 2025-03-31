import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { User } from '../types/types';

export function transformFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous',
        photoURL: firebaseUser.photoURL || '/assets/default-avatar.png',
        role: 'user',
        lastActive: Timestamp.now(),
        createdAt: Timestamp.now(),
        preferences: {
            theme: 'light',
            notifications: true
        }
    };
} 