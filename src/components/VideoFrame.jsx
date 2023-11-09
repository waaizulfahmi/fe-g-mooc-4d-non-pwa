'use client';

/* 
@DOCS :
1. core
    -> package from react / next
2. third party
    -> package from third party
3. redux
    -> redux global state management
4. components
    -> reusable component
5. data
    -> handle data model or application static data
6. apis
    -> api functions
7. utils
    -> utility functions
*/

// core
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// third party
import YouTubePlayer from 'youtube-player';

// redux
// redux
import { useSelector } from 'react-redux';
import { getIsPermit } from '@/redux/check-permission';

// components
// ---

// data
// ---

// apis
// ---

// utils
import { speechAction } from '@/utils/text-to-speech';
import { buttonAction } from '@/utils/space-button-action';

const VideoFrame = ({ playback, videoId, handleEditMateri, isInterrop }) => {
    const [pause, setPause] = useState(false);
    const playerRef = useRef(null);
    const isPermit = useSelector(getIsPermit);

    useEffect(() => {
        const handleVideoLength = async (player) => {
            try {
                const videoLength = await player.getDuration();
                // console.log('panjang video: ', videoLength);
            } catch (error) {
                // console.log(error);
                // console.log('error di panjang video: ', error);
            }
        };

        const handleInitialPlay = () => {
            const player = YouTubePlayer('player', {
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

            handleVideoLength(player);

            playerRef.current = player;

            // Jika playback lebih dari 0, maka akan geser menurut playback
            if (playback > 0) {
                player.seekTo(playback);
                player.pauseVideo();
            }

            // Aksi ketika video dimulai
            player.on('stateChange', async (event) => {
                const currentTime = await player.getCurrentTime();

                // event pause video
                if (event.data === 2) {
                    speechAction({
                        text: 'Anda pause video',
                        actionOnEnd: () => {
                            if (pause) {
                                setPause(false);
                            }
                            handleEditMateri(currentTime, 2);
                            //console.log('Video paused');
                        },
                    });
                    return;
                }

                // event video selesai
                if (event.data === 0) {
                    speechAction({
                        text: 'Video sudah selesai',
                        actionOnEnd: () => {
                            handleEditMateri(currentTime, 1);
                            //console.log('Video selesai');
                        },
                    });
                }
            });
        };

        handleInitialPlay();

        // hapus event listener saat komponen VideoFrame di-unmount
        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    useEffect(() => {
        // event listener untuk mendeteksi keydown pada keyboard
        const handleKeyDown = (event) => {
            buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (isPermit) {
                        console.log('test', isPermit);
                        if (!isInterrop) {
                            if (!pause) {
                                playerRef.current.playVideo();
                                setPause(true);
                            } else {
                                playerRef.current.pauseVideo();
                                setPause(false);
                            }
                        }
                    }
                },
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [pause, isInterrop, isPermit]);

    return (
        <>
            <div id='player' className='h-full w-full' tabIndex='-1'></div>
        </>
    );
};

VideoFrame.propTypes = {
    playback: PropTypes.number,
    videoId: PropTypes.string,
    handleEditMateri: PropTypes.func,
    isInterrop: PropTypes.bool,
};

export default VideoFrame;
