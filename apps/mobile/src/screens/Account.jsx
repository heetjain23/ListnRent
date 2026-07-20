import { ScrollView, Text, View, StyleSheet } from 'react-native'
import React, { Component } from 'react'

export default function Account() {
    return (
        <ScrollView >
            <View style={styles.View}>
                <Text style={styles.text}>
                    Account
                </Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    View: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
    }
})