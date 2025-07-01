const { getDefaultConfig } = require('expo/metro-config');

module.exports = {
  name: 'proyectoblank',
  version: '1.0.0',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    database: {
      host: process.env.EXPO_PUBLIC_DB_HOST || 'localhost',
      user: process.env.EXPO_PUBLIC_DB_USER || 'root',
      password: process.env.EXPO_PUBLIC_DB_PASSWORD || '',
      database: process.env.EXPO_PUBLIC_DB_DATABASE || 'cobranza',
    },
    eas: {
      projectId: "your-project-id-here"
    }
  },
  plugins: [],
};
