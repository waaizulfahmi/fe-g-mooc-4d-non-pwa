"use client";

import { useEffect, useRef } from "react";
import YouTubePlayer from "youtube-player";
import { synth, speech } from "@/utils/text-to-speech";

const VideoFrame = ({ playback, videoId, handleEditMateri }) => {
    const playerRef = useRef(null);

    const handleVideoLength = async (player) => {
        try {
            const videoLength = await player.getDuration();
            console.log("panjang video: ", videoLength);
        } catch (error) {
            console.log(error);
            console.log("error di panjang video: ", error);
        }
    };

    const handleInitialPlay = () => {
        const player = YouTubePlayer("player", {
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                showinfo: 0,
                rel: 0,
                fs: 1,
            },
        });

        playerRef.current = player;

        handleVideoLength(player);

        // Jika playback lebih dari 0, maka akan geser menurut playback
        if (playback > 0) {
            player.seekTo(playback);
            player.pauseVideo();
        }

        // Aksi ketika video dimulai
        player.on("stateChange", async (event) => {
            const currentTime = await player.getCurrentTime();

            if (event.data === 2) {
                let utterance = speech("Anda pause video");
                utterance.onend = () => {
                    handleEditMateri(currentTime, 2);
                    console.log("Video paused");
                };
                synth.speak(utterance);
                return;
            }

            if (event.data === 0) {
                let utterance = speech("Video sudah selesai");
                utterance.onend = () => {
                    handleEditMateri(currentTime, 1);
                    // setVideoEnded(true);
                    console.log("Video selesai");
                };
                synth.speak(utterance);
            }
        });
    };

    const handlePause = () => {
        if (playerRef) {
            playerRef.current.pauseVideo();
        }
    };

    const handlePlay = () => {
        if (playerRef) {
            playerRef.current.playVideo();
        }
    };

    useEffect(() => {
        handleInitialPlay();

        // event listener untuk mendeteksi keydown pada keyboard
        const handleKeyDown = (e) => {
            if (e.keyCode === 81) {
                //Q key clicked
                handlePlay();
            } else if (e.keyCode === 87) {
                //W key clicked
                handlePause();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // hapus event listener saat komponen VideoFrame di-unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);

            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    return (
        <>
            <div id="player" className="w-full h-full" tabIndex="-1"></div>
        </>
    );
};

export default VideoFrame;
