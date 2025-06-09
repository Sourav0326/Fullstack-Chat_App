import React from "react";
import ReactPlayer from "react-player";

const WatchTogetherModal = ({
  videoUrl,
  from,
  onAccept,
  onDecline,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {from} wants to watch a video with you!
        </h2>

        {/* Video preview */}
        {ReactPlayer.canPlay(videoUrl) ? (
          <div className="mb-4 rounded overflow-hidden">
            <ReactPlayer url={videoUrl} width="100%" height="200px" />
          </div>
        ) : (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline block mb-4"
          >
            {videoUrl}
          </a>
        )}

        <div className="flex justify-center gap-4">
          <button onClick={onAccept} className="btn btn-success">
            Accept
          </button>
          <button onClick={onDecline} className="btn btn-error">
            Decline
          </button>
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchTogetherModal;
