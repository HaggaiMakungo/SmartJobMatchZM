import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Briefcase01Icon } from "@hugeicons/core-free-icons";

export default function Index() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#202c39", "#283845"]}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
    >
      {/* Logo Area */}
      <View style={{ alignItems: 'center', marginBottom: 48 }}>
        <View style={{ 
          backgroundColor: 'rgba(242, 212, 146, 0.3)', 
          padding: 24, 
          borderRadius: 9999,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}>
          <HugeiconsIcon icon={Briefcase01Icon} size={64} color="#f2d492" />
        </View>
        <Text style={{ color: '#f2d492', fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
          JobMatch
        </Text>
        <Text style={{ color: '#b8b08d', fontSize: 18, textAlign: 'center' }}>
          AI-Powered Job Matching for Zambia
        </Text>
      </View>

      {/* Welcome Text */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ color: '#b8b08d', textAlign: 'center', fontSize: 16, lineHeight: 24 }}>
          Find your perfect career match with intelligent job recommendations
          powered by AI
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ width: '100%', gap: 16 }}>
        {/* Primary CTA - Tangerine (energetic) */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={{
            backgroundColor: '#f29559',
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
            Get Started
          </Text>
        </TouchableOpacity>

        {/* Secondary CTA - Sage outline */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{
            backgroundColor: 'rgba(184, 176, 141, 0.1)',
            borderWidth: 2,
            borderColor: '#b8b08d',
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 24
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#b8b08d', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 32 }}>
        <Text style={{ color: '#b8b08d', fontSize: 14 }}>Made in Zambia 🇿🇲</Text>
      </View>
    </LinearGradient>
  );
}
