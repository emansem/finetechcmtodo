import { Timestamp } from 'firebase/firestore';
export function transformFirebaseUser(firebaseUser) {
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
//# sourceMappingURL=userTransform.js.map