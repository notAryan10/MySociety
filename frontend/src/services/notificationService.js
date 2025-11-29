import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;

            if (!projectId) {
                console.log('No projectId found - push notifications require a development build or production app');
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (error) {
            console.log('Error getting push token:', error.message);
            return;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export function setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        if (onNotificationResponse) {
            onNotificationResponse(response);
        }
    });

    return () => {
        if (Notifications.removeNotificationSubscription) {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        }
    };
}
