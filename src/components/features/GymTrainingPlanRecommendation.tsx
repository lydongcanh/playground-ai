import React, { useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";
import { ComboboxItem, Select, NumberInput, Button, Paper, Stack } from "@mantine/core";

const GymTrainingPlanRecommendation: React.FC = () => {
  const [fitnessLevel, setFitnessLevel] = useState<ComboboxItem | null>(null);
  const [trainingGoal, setTrainingGoal] = useState<ComboboxItem | null>(null);
  const [timeCommitment, setTimeCommitment] = useState<string | number>("60");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trainingPlan, setTrainingPlan] = useState<string | null>(null);

  const onGetTrainingPlanClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("https://playground-core.onrender.com/LlmRecommendation/gym-training-plan", {
        fitnessLevel: Number(fitnessLevel?.value),
        trainingGoal: Number(trainingGoal?.value),
        timeCommitmentInMinute: Number(timeCommitment),
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
      <Button fullWidth onClick={onGetTrainingPlanClick} loading={isLoading}>
        Get Training Plan
      </Button>
      {trainingPlan && !isLoading && (
        <Paper shadow="xs" p="xl">
          <Markdown>{trainingPlan}</Markdown>
        </Paper>
      )}
    </Stack>
  );
};

export default GymTrainingPlanRecommendation;
