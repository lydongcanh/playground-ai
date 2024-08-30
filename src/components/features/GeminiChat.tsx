import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Paper, ScrollArea, Text, TextInput, ActionIcon, Notification, rem } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend2, IconX } from "@tabler/icons-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  role: "user" | "ai";
  content: string;
}

const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

  const form = useForm({
    initialValues: {
      message: "",
    },
    validate: {
      message: (value) => (value.trim().length > 0 ? null : "Message cannot be empty"),
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (values: { message: string }) => {
    const userMessage: Message = { role: "user", content: values.message };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(values.message);
      const aiResponse = result.response.text();

      const aiMessage: Message = { role: "ai", content: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setError(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm">
      <Paper shadow="md" p="md" style={{ marginTop: 12 }}>
        {error && (
          <Notification icon={xIcon} color="red" title="Error!">
            {error}
          </Notification>
        )}
        <ScrollArea h="83vh" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <Box
              key={index}
              mb="sm"
              style={{
                textAlign: message.role === "user" ? "right" : "left",
              }}
            >
              <Paper
                p="xs"
                style={{
                  display: "inline-block",
                  backgroundColor: message.role === "user" ? "#e3f2fd" : "#f5f5f5",
                }}
              >
                <Text>{message.content}</Text>
              </Paper>
            </Box>
          ))}
        </ScrollArea>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            placeholder="Type your message..."
            {...form.getInputProps("message")}
            rightSection={
              <ActionIcon type="submit" loading={isLoading}>
                <IconSend2 style={{ width: "70%", height: "70%" }} stroke={1.5} />
              </ActionIcon>
            }
          />
        </form>
      </Paper>
    </Container>
  );
};

export default GeminiChat;
