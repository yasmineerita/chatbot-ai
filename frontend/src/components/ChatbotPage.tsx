import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  AppBar,
  Toolbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from 'react-markdown';

export default function ChatbotPage() {
  const socketRef = useRef<WebSocket | null>(null)
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  function cleanLLMResponse(response: string): string {
    try {
      // If response is JSON stringified (e.g. from backend)
      if (response.startsWith("'") || response.includes("\\n")) {
        response = JSON.parse(response.replace(/'''+|'''/g, "").trim());
      }
    } catch (e) {
      // Ignore parse error and continue
    }
  
    // Remove unwanted prefixes or labels
    response = response.replace(/^AI\s*:\s*/i, "");
    // response = response.replace(/^'+|'+$/g, ""); // Remove extra single quotes
    return response.trim();
  }

  useEffect(() => {
    socketRef.current = new WebSocket("ws://0.0.0.0:8085/ws");

    socketRef.current.onopen = () => {
      console.log("Connected to WebSocket");
    };

    // socketRef.current.onmessage = (event: MessageEvent) => {
    //   setMessages((prev) => [...prev, event.data]);
    // };
    socketRef.current.onmessage = (event) => {
      console.log("📨 Message from server:", event.data);
    }

    socketRef.current.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage])
    console.log("new Msg: ", newMessage)
    const socket = socketRef.current;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket is not open.");
    return;
  }
  socket.send(JSON.stringify(newMessage))
  setInput("");

    socket.onmessage = (event: MessageEvent) => {
      console.log("prev data:", event.data)
      const newMessage = { sender: "assistant", text: event.data };
      setMessages((prev) => [...prev, newMessage]);
    };

  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        height: 600,
        mx: "auto",
        my: 4,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        marginTop: "100px"
      }}
    >
      <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
        <img src="/truc_logo.jpg" alt="Logo" width={32} height={32} />
          <Typography variant="h6" component="div">
            Chatbot Assistant
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          bgcolor: "grey.100",
        }}
      >
        <Stack spacing={2}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
            >
              <Paper
                elevation={1}
                sx={{
                  px: 2,
                  py: 1,
                  maxWidth: "75%",
                  bgcolor:
                    msg.sender === "user" ? "primary.main" : "grey.300",
                  color:
                    msg.sender === "user" ? "primary.contrastText" : "black",
                  borderRadius: 2,
                }}
              >
                {/* <Typography variant="body2">{msg.text}</Typography> */}
                <ReactMarkdown>{cleanLLMResponse(msg.text)}</ReactMarkdown>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid #ddd",
          bgcolor: "white",
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message..."
          variant="outlined"
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton color="primary" onClick={sendMessage} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}