import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useState, useEffect, useRef } from "react";
import WatchTogetherModal from "./components/WatchTogetherModal";
import VideoPlayerModal from "./components/VideoPlayerModal";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { watchingWith, setWatchingWith } = useChatStore();

  const [incomingVideo, setIncomingVideo] = useState(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedTime, setPlayedTime] = useState(0);
  const playerRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("watch-request-received", ({ videoUrl, from, fromId }) => {
      setIncomingVideo({ videoUrl, from, fromId });
    });

    socket.on("watch-response-received", ({ accepted }) => {
      alert(accepted ? "They accepted your watch request!" : "They declined.");
    });

    socket.on("start-video-session-received", ({ videoUrl }) => {
      setPlayingVideoUrl(videoUrl);
    });

    socket.on("video-control-received", ({ action, currentTime }) => {
      if (!playerRef.current) return;

      if (action === "play" || action === "pause" || action === "seek") {
        playerRef.current.seekTo(currentTime);
        setIsPlaying(action === "play");
        if (action === "seek") setPlayedTime(currentTime);
      }
    });

    return () => {
      socket.off("watch-request-received");
      socket.off("watch-response-received");
      socket.off("start-video-session-received");
      socket.off("video-control-received");
    };
  }, [socket]);

  const handleControl = (action, customTime) => {
    const currentTime =
      customTime !== undefined
        ? customTime
        : playerRef.current.getCurrentTime();

    if (watchingWith) {
      socket.emit("video-control", {
        to: watchingWith,
        action,
        currentTime,
      });
    }

    setIsPlaying(action === "play");
    if (action === "seek") setPlayedTime(currentTime);
  };

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* ✅ Modals mounted outside layout for full-screen control */}
      {incomingVideo && (
        <WatchTogetherModal
          videoUrl={incomingVideo.videoUrl}
          from={incomingVideo.from}
          onAccept={() => {
            socket.emit("watch-response", {
              to: incomingVideo.fromId,
              accepted: true,
            });
            socket.emit("start-video-session", {
              to: incomingVideo.fromId,
              from: authUser._id,
              videoUrl: incomingVideo.videoUrl,
            });
            setWatchingWith(incomingVideo.fromId);
            setIncomingVideo(null);
          }}
          onDecline={() => {
            socket.emit("watch-response", {
              to: incomingVideo.fromId,
              accepted: false,
            });
            setIncomingVideo(null);
          }}
          onClose={() => setIncomingVideo(null)}
        />
      )}

      {playingVideoUrl && (
        <VideoPlayerModal
          videoUrl={playingVideoUrl}
          isPlaying={isPlaying}
          onClose={() => {
            setPlayingVideoUrl(null);
            setIsPlaying(false);
            setWatchingWith(null);
            setPlayedTime(0);
          }}
          onControl={handleControl}
          playerRef={playerRef}
          playedTime={playedTime}
          setPlayedTime={setPlayedTime}
        />
      )}

      <Toaster />
    </div>
  );
};

export default App;
