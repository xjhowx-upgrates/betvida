import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import BetModal from "../BetModal";
import VideoPlayer from "../VideoPlayer";

export default function FortuneRabbit() {
  const [user] = useAuthState(auth);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const handleOpenBetModal = () => {
    if (user) {
      setShowBetModal(true);
    } else {
      alert("Faça login para apostar!");
    }
  };

  const handleBetResult = (result) => {
    setShowBetModal(false);
    if (result && result.requiresVideo) {
      setSelectedVideo(result.video);
      setShowVideo(true);
    }
  };

  const handleVideoComplete = () => {
    setShowVideo(false);
    setSelectedVideo(null);
  };

  return (
    <div className="relative">
      <div className="bg-white/80 rounded-xl p-4 shadow text-center">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Fortune Rabbit</h2>
        <div className="aspect-[9/16] bg-red-100 rounded-lg overflow-hidden relative mb-3">
          <img 
            src="https://img.cacaniqueisonline.com/wp-content/uploads/2024/01/fortune-rabbit.jpg" 
            alt="Fortune Rabbit"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <p className="text-white text-lg font-bold">Clique para jogar</p>
          </div>
        </div>
        <button
          onClick={handleOpenBetModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apostar
        </button>
      </div>

      {showBetModal && (
        <BetModal 
          onClose={() => setShowBetModal(false)} 
          gameId="fortune_rabbit"
          gameName="Fortune Rabbit"
          onBetResult={handleBetResult}
        />
      )}

      {showVideo && selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onComplete={handleVideoComplete}
        />
      )}
    </div>
  );
}
