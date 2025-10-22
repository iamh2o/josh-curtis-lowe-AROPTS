import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { Camera, CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

import instructionData from './assets/instructions/bosch_wat28400uc_quick_wash.json';

const FEEDBACK_OPTIONS = {
  HELPED: 'helped',
  WRONG: 'wrong'
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedGoalId, setSelectedGoalId] = useState(instructionData.goals[0]?.id);
  const [stepIndex, setStepIndex] = useState(0);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    setStepIndex(0);
    setFeedback(null);
  }, [selectedGoalId]);

  const selectedGoal = useMemo(
    () => instructionData.goals.find((goal) => goal.id === selectedGoalId),
    [selectedGoalId]
  );

  const steps = selectedGoal?.steps ?? [];
  const currentStep = steps[stepIndex];

  const handleAdvance = () => {
    setFeedback(null);
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setFeedback(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleFeedback = (value) => {
    setFeedback(value);
  };

  const isLastStep = stepIndex === steps.length - 1;

  const highlightStyle = currentStep ? computeHighlightStyle(currentStep.bbox, layout, instructionData.imageSize) : null;

  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.message}>Requesting camera access…</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.message}>HintLens needs camera access to overlay instructions.</Text>
        <Pressable onPress={requestPermission} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>Grant access</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.cameraWrapper} onLayout={(event) => setLayout(event.nativeEvent.layout)}>
        <Camera style={styles.camera} type={CameraType.back}>
          {currentStep && layout.width > 0 && layout.height > 0 && (
            <View style={[styles.highlight, highlightStyle]}>
              <View style={styles.highlightPulse} />
            </View>
          )}
        </Camera>
      </View>

      <View style={styles.overlayPanel}>
        <Text style={styles.deviceLabel}>{instructionData.modelName}</Text>
        <Text style={styles.sectionTitle}>Pick a goal</Text>
        <FlatList
          data={instructionData.goals}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.goalList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedGoalId(item.id)}
              style={[styles.goalPill, item.id === selectedGoalId && styles.goalPillSelected]}
            >
              <Text style={[styles.goalPillText, item.id === selectedGoalId && styles.goalPillTextSelected]}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />

        {currentStep ? (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCounter}>
              Step {stepIndex + 1} of {steps.length}
            </Text>
            <Text style={styles.stepText}>{currentStep.text}</Text>

            <View style={styles.controlsRow}>
              <Pressable onPress={handleBack} style={[styles.secondaryButton, stepIndex === 0 && styles.disabledButton]} disabled={stepIndex === 0}>
                <Text style={[styles.secondaryButtonLabel, stepIndex === 0 && styles.disabledButtonLabel]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleAdvance}
                style={[styles.primaryButton, isLastStep && styles.disabledButton]}
                disabled={isLastStep}
              >
                <Text style={[styles.primaryButtonLabel, isLastStep && styles.disabledButtonLabel]}>
                  {isLastStep ? 'Done' : 'Next'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackPrompt}>Was this helpful?</Text>
              <Pressable
                onPress={() => handleFeedback(FEEDBACK_OPTIONS.HELPED)}
                style={[styles.feedbackButton, feedback === FEEDBACK_OPTIONS.HELPED && styles.feedbackButtonSelected]}
              >
                <Text
                  style={[styles.feedbackButtonLabel, feedback === FEEDBACK_OPTIONS.HELPED && styles.feedbackButtonLabelSelected]}
                >
                  This helped
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleFeedback(FEEDBACK_OPTIONS.WRONG)}
                style={[styles.feedbackButton, feedback === FEEDBACK_OPTIONS.WRONG && styles.feedbackButtonSelected]}
              >
                <Text
                  style={[styles.feedbackButtonLabel, feedback === FEEDBACK_OPTIONS.WRONG && styles.feedbackButtonLabelSelected]}
                >
                  This was wrong
                </Text>
              </Pressable>
            </View>
            {feedback && (
              <Text style={styles.feedbackThanks}>
                Thanks! Your feedback will help improve HintLens instructions.
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.message}>No instructions available for this goal yet.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function computeHighlightStyle(bbox, layout, imageSize) {
  if (!bbox || !layout.width || !layout.height) {
    return {};
  }

  const [x, y, width, height] = bbox;
  const left = (x / imageSize.width) * layout.width;
  const top = (y / imageSize.height) * layout.height;
  const boxWidth = (width / imageSize.width) * layout.width;
  const boxHeight = (height / imageSize.height) * layout.height;

  return {
    left,
    top,
    width: boxWidth,
    height: boxHeight
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a'
  },
  message: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12
  },
  cameraWrapper: {
    flex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#020617'
  },
  camera: {
    flex: 1
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#38bdf8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  highlightPulse: {
    width: '60%',
    height: '60%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#38bdf8',
    opacity: 0.6
  },
  overlayPanel: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12
  },
  deviceLabel: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 16
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '600'
  },
  goalList: {
    gap: 12
  },
  goalPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  goalPillSelected: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8'
  },
  goalPillText: {
    color: '#94a3b8',
    fontWeight: '500'
  },
  goalPillTextSelected: {
    color: '#0f172a',
    fontWeight: '600'
  },
  stepContainer: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  stepCounter: {
    color: '#38bdf8',
    fontWeight: '600'
  },
  stepText: {
    color: '#f8fafc',
    fontSize: 18,
    lineHeight: 24
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonLabel: {
    color: '#0f172a',
    fontWeight: '700'
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  secondaryButtonLabel: {
    color: '#e2e8f0',
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.4
  },
  disabledButtonLabel: {
    color: '#94a3b8'
  },
  feedbackRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  feedbackPrompt: {
    color: '#94a3b8',
    marginRight: 8
  },
  feedbackButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  feedbackButtonSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)'
  },
  feedbackButtonLabel: {
    color: '#cbd5f5',
    fontWeight: '500'
  },
  feedbackButtonLabelSelected: {
    color: '#38bdf8'
  },
  feedbackThanks: {
    color: '#22d3ee',
    fontSize: 12
  }
});
