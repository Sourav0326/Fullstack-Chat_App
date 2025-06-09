import React from "react";
import ReactPlayer from "react-player";

const VideoPlayerModal = ({
  videoUrl,
  onClose,
  onControl,
  playerRef,
  isPlaying,
  playedTime,
  setPlayedTime,
}) => {
  const handleSeekChange = (e) => {
    const seekTo = parseFloat(e.target.value);
    playerRef.current.seekTo(seekTo);
    onControl("seek", seekTo);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          controls
          playing={isPlaying}
          muted={false}
          width="600px"
          onProgress={({ playedSeconds }) => setPlayedTime(playedSeconds)}
          config={{
            youtube: {
              playerVars: { modestbranding: 1 },
            },
          }}
        />

        {/* Custom Seek Slider */}
        <div className="my-3 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={playerRef.current ? playerRef.current.getDuration() : 0}
            value={playedTime}
            onChange={handleSeekChange}
            step="0.1"
            className="w-full"
          />
          <span className="text-xs w-12 text-right">
            {playedTime.toFixed(0)}s
          </span>
        </div>

        <div className="flex gap-4 mt-2">
          <button onClick={() => onControl("play")} className="btn btn-success">
            ▶️ Play
          </button>
          <button
            onClick={() => onControl("pause")}
            className="btn btn-warning"
          >
            ⏸️ Pause
          </button>
          <button onClick={onClose} className="btn btn-sm btn-error">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
