import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { setUser, setLoading, logout } from '../store/authSlice';
import { RootState } from '../store';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }));
            } else {
                dispatch(logout());
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            dispatch(logout());
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        signOut: handleSignOut
    };
};