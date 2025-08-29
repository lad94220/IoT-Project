import { useEffect, useState, useRef } from "react"
import { socket } from "../../../libs"
import {Box, Typography, IconButton, TextField, Button, useTheme, Avatar} from "@mui/material"
import ChatIcon from "@mui/icons-material/Chat"
import CloseIcon from "@mui/icons-material/Close"
import SmartToyIcon from "@mui/icons-material/SmartToy"

type Chat = { sender: "user" | "bot"; message: string; time: string }

export const Chatbot = () => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [chats, setChats] = useState<Chat[]>([])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const handleOpen = () => {
    setOpen(true)
    if (chats.length === 0) {
      const now = new Date().toISOString()
      setChats([
        {
          sender: "bot",
          message: `👋 Hello! I’m your virtual assistant for the smart electrical device system.

  You can try the following commands:
  🔹 /status – Check current device status
  🔹 /power_today – View today’s power consumption
  🔹 /review – Get summary of recent usage
  🔹 /help – Show all available commands`,
          time: now,
        },
      ])
    }
    
  }

  const sendCommand = () => {
    if (!input.trim()) return
    const now = new Date().toISOString()
    setChats(prev => [...prev, { sender: "user", message: input, time: now }])
    socket.emit("chatbot-command", { command: input })
    setInput("")
  }

  useEffect(() => {
    socket.on("chatbot-response", (data) => {
      const now = new Date().toISOString()
      setChats(prev => [...prev, { sender: "bot", message: data.msg, time: now }])
    })

    return () => {
      socket.off("chatbot-response")
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats])

  useEffect(() => {
  if (open && chats.length > 0) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }
}, [open])

  const containerSx = {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 1000,
  }

  const popupSx = {
    width: 320,
    height: 420,
    bgcolor: "#eeeeeeff",
    borderRadius: 2,
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ccc",
  }

  const headerSx = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bgcolor: "primary.main",
    color: "white",
    px: 2,
    py: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  }

  const messageSx = (sender: "user" | "bot") => ({
    maxWidth: "85%",
    px: 2,
    py: 1,
    borderRadius: 2,
    color: sender === "user" ? "#000000": theme.palette.text.primary ,
    backgroundColor:
      sender === "user" ? "#ffffffff" : theme.palette.secondary.main,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    typography: 'body2',
  })

  return (
    <Box sx={containerSx}>
      {open ? (
        <Box sx={popupSx}>
          {/* Header */}
          <Box sx={headerSx}>
            <Typography fontWeight="bold">🤖 ChatBot</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Chat area */}
          <Box sx={{flex: 1, overflowY: "auto", p: 1,}}>
            {chats.map((chat, i) => (
            <Box key={i} sx={{display: "flex", justifyContent: chat.sender === "user" ? "flex-end" : "flex-start",mb: 1,}}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                {chat.sender === "bot" && (
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 28, height: 28,}}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                )}
                <Box sx={messageSx(chat.sender)}>
                  {chat.message}
                </Box>
              </Box>
            </Box>
          ))}
          <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ display: "flex", p: 1, borderTop: "1px solid #ccc", color: theme.palette.secondary.dark}}>
            <TextField variant="outlined" size="small" placeholder="Enter..."value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCommand()}
              sx={{ flex: 1, mr: 1, input: { color: '#000000'} }}/>
            <Button variant="contained" onClick={sendCommand}>Send</Button>
          </Box>
        </Box>
      ) : (
        <IconButton onClick={handleOpen} sx={{bgcolor: "primary.main", color: "white", p: 2, borderRadius: "50%", boxShadow: 3,"&:hover": { bgcolor: "primary.dark" },}}>
          <ChatIcon />
        </IconButton>
      )}
    </Box>
  )
}
