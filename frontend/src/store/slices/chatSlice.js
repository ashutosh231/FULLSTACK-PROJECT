import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, getMessages } from "../../api/authApi";

export const fetchUsers = createAsyncThunk(
  "chat/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUsers();
      return data;
    } catch {
      return rejectWithValue([]);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (otherUserId, { rejectWithValue }) => {
    try {
      const data = await getMessages(otherUserId);
      return data;
    } catch {
      return rejectWithValue([]);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    users: [],
    selectedUser: null,
    messagesByConversation: {}, // { [otherUserId]: [...] }
    typingUser: null,
    messagesLoading: false,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setMessages: (state, action) => {
      const { otherUserId, messages } = action.payload;
      state.messagesByConversation[otherUserId] = messages;
    },
    addMessage: (state, action) => {
      const { otherUserId, message } = action.payload;
      const key = String(otherUserId);
      if (!state.messagesByConversation[key]) {
        state.messagesByConversation[key] = [];
      }
      state.messagesByConversation[key].push(message);
    },
    setTypingUser: (state, action) => {
      state.typingUser = action.payload;
    },
    clearTypingUserFor: (state, action) => {
      const typingUserId = action.payload;
      if (state.typingUser && String(state.typingUser.id) === String(typingUserId)) {
        state.typingUser = null;
      }
    },
    clearChat: (state) => {
      state.selectedUser = null;
      state.typingUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.users = [];
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const otherUserId = action.meta.arg;
        state.messagesByConversation[String(otherUserId)] = action.payload || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        const otherUserId = action.meta.arg;
        state.messagesByConversation[String(otherUserId)] = [];
      });
  },
});

export const {
  setSelectedUser,
  setMessages,
  addMessage,
  setTypingUser,
  clearTypingUserFor,
  clearChat,
} = chatSlice.actions;
export default chatSlice.reducer;
