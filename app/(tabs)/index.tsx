import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// @ts-ignore
import {
  NativeText,
  NativeVirtualText,
} from "react-native/Libraries/Text/TextNativeComponent";

const ITEM_COUNT = 2000;
const DATA = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    id: i.toString(),
}));

export default function HomeScreen() {
    const [useOptimized, setUseOptimized] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        !useOptimized && styles.activeButton,
                    ]}
                    onPress={() => setUseOptimized(false)}
                >
                    <Text style={styles.btnText}>
                        Scenario A: HEAVY (Views)
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, useOptimized && styles.activeButton]}
                    onPress={() => setUseOptimized(true)}
                >
                    <Text style={styles.btnText}>
                        Scenario B: LIGHT (Virtual)
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
                <Text>
                    Mode:{" "}
                    {useOptimized
                        ? "Optimized (Virtual Nodes)"
                        : "Heavy (Native Views)"}
                </Text>
                <Text>Items: {ITEM_COUNT}</Text>
            </View>

            <FlatList
                data={DATA}
                key={useOptimized ? "optimized" : "heavy"} // Force re-mount when switching
                renderItem={({ item }) =>
                    useOptimized ? (
                        <LightItem index={item.id} />
                    ) : (
                        <HeavyItem index={item.id} />
                    )
                }
                keyExtractor={(item) => item.id}
            />
        </SafeAreaView>
    );
}

// --- SCENARIO A: THE "BAD" WAY (NativeText everywhere) ---
// Every single text line here creates a UIView / TextView.
// Fabric sees: View -> View -> View -> View
const HeavyItem = ({ index }: { index: string }) => (
    <View style={styles.row}>
        <NativeText style={styles.iconBox}>icon</NativeText>
        <View style={styles.textContainer}>
            <NativeText style={styles.title}>Title #{index}</NativeText>
            <NativeText style={styles.description}>
                <NativeText>Some Text </NativeText>
                <NativeText>
                    This is a description that uses a separate Native View.
                </NativeText>
            </NativeText>
            <NativeText style={styles.tag}>Tag View</NativeText>
        </View>
    </View>
);

// --- SCENARIO B: THE "GOOD" WAY (NativeVirtualText) ---
// Only the Parent (NativeText) creates a UIView / TextView.
// The children are Virtual Nodes (C++) that merge into the parent.
// Fabric sees: View -> (Text Content)
const LightItem = ({ index }: { index: string }) => (
    <View style={styles.row}>
        <NativeText style={styles.iconBox}>icon</NativeText>
        <View style={styles.textContainer}>
            <NativeText style={styles.title}>Title #{index}</NativeText>
            <NativeText style={styles.description}>
                {/* Only diff */}
                <NativeVirtualText>Some Text </NativeVirtualText>
                <NativeVirtualText>
                    This is a description that merges into the parent text node.
                </NativeVirtualText>
                {/* Only diff */}
            </NativeText>
            <NativeText style={styles.tag}>Tag Span</NativeText>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0f0f0" },
    header: {
        flexDirection: "row",
        padding: 10,
        justifyContent: "space-between",
    },
    button: {
        padding: 15,
        backgroundColor: "#ddd",
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center",
    },
    activeButton: { backgroundColor: "#4CAF50" },
    btnText: { fontWeight: "bold" },
    infoBox: { padding: 10, alignItems: "center", marginBottom: 5 },
    row: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        height: 80,
    },
    iconBox: {
        width: 50,
        height: 50,
        backgroundColor: "#eee",
        marginRight: 10,
    },
    textContainer: { flex: 1 },
    // Styles for Heavy (Blocks)
    title: { fontWeight: "bold", fontSize: 16 },
    description: { color: "#666" },
    tag: { color: "blue", fontSize: 12 },
    // Styles for Light (Virtual)
    virtualContainer: { flex: 1 },
});
