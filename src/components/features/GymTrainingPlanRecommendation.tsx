import React, { useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";
import { ComboboxItem, Select, NumberInput, Button, Paper, Textarea, Stack } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

const GymTrainingPlanRecommendation: React.FC = () => {
  const [fitnessLevel, setFitnessLevel] = useState<ComboboxItem | null>(null);
  const [trainingGoal, setTrainingGoal] = useState<ComboboxItem | null>(null);
  const [timeCommitment, setTimeCommitment] = useState<string | number>("60");
  const [additionalContext, setAdditionalContext] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trainingPlan, setTrainingPlan] = useState<string | null>(null);

  const onGetTrainingPlanClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("https://playground-core.onrender.com/LlmRecommendation/gym-training-plan", {
        fitnessLevel: Number(fitnessLevel?.value),
        trainingGoal: Number(trainingGoal?.value),
        timeCommitmentInMinute: Number(timeCommitment),
        additionalContext,
      });
      console.info(response);
      setTrainingPlan(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <Select
        label="Fitness level"
        data={[
          { value: "0", label: "Beginner" },
          { value: "1", label: "Intermediate" },
          { value: "2", label: "Advanced" },
        ]}
        value={fitnessLevel ? fitnessLevel.value : null}
        onChange={(_value, option) => setFitnessLevel(option)}
      />
      <Select
        label="Training goal"
        data={[
          { value: "0", label: "Weight loss" },
          { value: "1", label: "Muscle gain" },
          { value: "2", label: "Strength training" },
          { value: "3", label: "Endurance" },
          { value: "4", label: "Flexibility" },
        ]}
        value={trainingGoal ? trainingGoal.value : null}
        onChange={(_value, option) => setTrainingGoal(option)}
      />
      <NumberInput label="Time commitment (in minutes)" value={timeCommitment} onChange={setTimeCommitment} min={1} />
      <Textarea
        label="Additional context"
        description="Available equipment, dietary restrictions, injury or limitations,..."
        resize="vertical"
        autosize
        value={additionalContext}
        onChange={(event) => setAdditionalContext(event.currentTarget.value)}
      />
      <Button
        fullWidth
        disabled={!fitnessLevel || !trainingGoal}
        onClick={onGetTrainingPlanClick}
        loading={isLoading}
        loaderProps={{ type: "dots" }}
        rightSection={<IconDownload size={14} />}
      >
        Get Training Plan
      </Button>
      {trainingPlan && !isLoading && (
        <Paper shadow="xl" p="xl">
          <Markdown>{trainingPlan}</Markdown>
        </Paper>
      )}
    </Stack>
  );
};

export default GymTrainingPlanRecommendation;
