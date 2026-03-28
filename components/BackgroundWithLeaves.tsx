import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Leaf {
  id: number;
  animatedValue: Animated.Value;
  startX: number;
  duration: number;
  delay: number;
  frameOffset: number;
  horizontalDrift: number;
}

const LEAF_IMAGES = [
  require("@/assets/leaves/1.png"),
  require("@/assets/leaves/2.png"),
  require("@/assets/leaves/3.png"),
  require("@/assets/leaves/4.png"),
  require("@/assets/leaves/5.png"),
  require("@/assets/leaves/6.png"),
  require("@/assets/leaves/7.png"),
  require("@/assets/leaves/8.png"),
  require("@/assets/leaves/9.png"),
  require("@/assets/leaves/10.png"),
  require("@/assets/leaves/11.png"),
];

function AnimatedLeaf({ leaf }: { leaf: Leaf }) {
  const [currentFrame, setCurrentFrame] = useState(leaf.frameOffset);

  useEffect(() => {
    // Cycle through frames for animation effect
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % LEAF_IMAGES.length);
    }, 150);

    return () => clearInterval(frameInterval);
  }, []);

  const translateY = leaf.animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, SCREEN_HEIGHT + 10],
  });

  const translateX = leaf.animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, leaf.horizontalDrift],
  });

  const opacity = leaf.animatedValue.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.leaf,
        {
          left: leaf.startX,
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    >
      <Image source={LEAF_IMAGES[currentFrame]} style={styles.leafImage} />
    </Animated.View>
  );
}

export default function BackgroundWithLeaves({
  children,
}: {
  children: React.ReactNode;
}) {
  const leavesRef = useRef<Leaf[]>([]);

  if (leavesRef.current.length === 0) {
    for (let i = 0; i < 20; i++) {
      leavesRef.current.push({
        id: i,
        animatedValue: new Animated.Value(0),
        startX: Math.random() * SCREEN_WIDTH,
        duration: 3000 + 1 * 10000,
        delay: Math.random() * 5000,
        frameOffset: Math.floor(Math.random() * LEAF_IMAGES.length),
        horizontalDrift: (Math.random() - 0.5) * 100,
      });
    }
  }

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    leavesRef.current.forEach((leaf) => {
      const timeout = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(leaf.animatedValue, {
              toValue: 1,
              duration: leaf.duration,
              useNativeDriver: true,
            }),
            Animated.timing(leaf.animatedValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, leaf.delay);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      leavesRef.current.forEach((leaf) => {
        leaf.animatedValue.stopAnimation();
        leaf.animatedValue.setValue(0);
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      />
      <View style={styles.leavesContainer}>
        {leavesRef.current.map((leaf) => (
          <AnimatedLeaf key={leaf.id} leaf={leaf} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  leavesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  leaf: {
    position: "absolute",
    width: 30,
    height: 30,
  },
  leafImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
});
