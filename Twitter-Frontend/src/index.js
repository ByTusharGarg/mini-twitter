import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./routes/home";
import Topic from "./routes/topic";
import Profile from "./routes/profile";
import SignUp from "./routes/signUp";
import Search from "./routes/search";
import { ChakraProvider } from "@chakra-ui/react";
import { createContext } from "react";
import config from "./config";

export const urlContext = createContext("");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <urlContext.Provider value={config.baseUrl}>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<App />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/topic/" element={<Topic />} />
          <Route path="/topic/:tag" element={<Topic />} />
          <Route path="/profile/:userName" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </urlContext.Provider>
);
