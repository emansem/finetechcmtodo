import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, githubProvider } from './firebase';
import { User } from '../types/types';
import { setItem, removeItem, StorageKeys } from './storage';
import { Timestamp } from 'firebase/firestore';

export class AuthService {
    static async signInWithGithub(): Promise<User | null> {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            const user = this.transformFirebaseUser(result.user);
            if (user) {
                setItem(StorageKeys.USER, user);
            }
            return user;
        } catch (error) {
            console.error('GitHub sign in error:', error);
            return null;
        }
    }

    static async signOut(): Promise<void> {
        try {
            await signOut(auth);
            removeItem(StorageKeys.USER);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    static onAuthStateChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, (firebaseUser) => {
            const user = firebaseUser ? this.transformFirebaseUser(firebaseUser) : null;
            callback(user);
        });
    }

    static async getCurrentUser(): Promise<User | null> {
        const user = auth.currentUser;
        if (!user) return null;
        return this.transformFirebaseUser(user);
    }

    private static transformFirebaseUser(firebaseUser: FirebaseUser): User {
        const now = Timestamp.now();
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous',
            photoURL: firebaseUser.photoURL || '/assets/default-avatar.png',
            role: 'user',
            lastActive: now,
            createdAt: now,
            preferences: {
                theme: 'light',
                notifications: true,
                categoriesOrder: [],
                defaultView: 'list'
            }
        };
    }
}