import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

type TabBarProps = {
  tabs: { key: string; title: string }[];
  activeTab: string;
  onChangeTab: (key: string) => void;
  primaryColor?: string;
};

/**
 * Componente TabBar personalizado para la navegación entre dispositivos
 */
export default function TabBarDevices({ 
  tabs, 
  activeTab, 
  onChangeTab,
  primaryColor = '#1976D2'
}: TabBarProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && { 
              borderBottomColor: primaryColor,
              borderBottomWidth: 3
            }
          ]}
          onPress={() => onChangeTab(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && { 
                color: primaryColor,
                fontWeight: 'bold'
              }
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
});
