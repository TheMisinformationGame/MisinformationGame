import React, {Component} from 'react';

/**
 * Extracts video ID and platform from various video URL formats
 */
function parseVideoUrl(content) {
    if (!content || typeof content !== 'string')
        return null;

    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of youtubePatterns) {
        const match = content.match(pattern);
        if (match) {
            return { platform: 'youtube', id: match[1] };
        }
    }

    // Vimeo pattern
    const vimeoMatch = content.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    return null;
}

/**
 * Component for embedding videos with tracking capabilities
 */
export class VideoEmbed extends Component {
    constructor(props) {
        super(props);
        this.playerRef = React.createRef();
        this.containerRef = React.createRef();
        this.player = null;
        this.playerId = `video-player-${Math.random().toString(36).substr(2, 9)}`;
        this.observer = null;
        
        this.state = {
            hasPlayed: false,
            hasPaused: false,
            hasEnded: false,
            isApiReady: false
        };
    }

    componentDidMount() {
        const video = parseVideoUrl(this.props.content);
        if (video && video.platform === 'youtube') {
            this.loadYouTubeAPI();
        }
        
        // Set up intersection observer to pause video when scrolled off screen
        this.setupIntersectionObserver();
    }

    componentWillUnmount() {
        if (this.player && this.player.destroy) {
            this.player.destroy();
        }
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    setupIntersectionObserver() {
        if (!this.containerRef.current) return;

        const options = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.25 // Video needs to be at least 25% visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If video is scrolled off screen (not intersecting)
                if (!entry.isIntersecting) {
                    // Pause YouTube video
                    if (this.player && this.player.pauseVideo) {
                        this.player.pauseVideo();
                    }
                    // Pause Vimeo video
                    const iframe = this.containerRef.current?.querySelector('iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage('{"method":"pause"}', '*');
                    }
                }
            });
        }, options);

        this.observer.observe(this.containerRef.current);
    }

    loadYouTubeAPI() {
        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
            this.initializeYouTubePlayer();
            return;
        }

        // Load the YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Set up callback for when API is ready
            window.onYouTubeIframeAPIReady = () => {
                this.setState({ isApiReady: true });
                this.initializeYouTubePlayer();
            };
        }
    }

    initializeYouTubePlayer() {
        if (!window.YT || !window.YT.Player) return;

        const video = parseVideoUrl(this.props.content);
        if (!video || video.platform !== 'youtube') return;

        this.player = new window.YT.Player(this.playerId, {
            videoId: video.id,
            playerVars: {
                rel: 0,              // Don't show related videos from other channels
                modestbranding: 1,   // Minimal YouTube branding
                controls: 1,         // Show player controls
                enablejsapi: 1,      // Enable JavaScript API
                origin: window.location.origin
            },
            events: {
                onStateChange: this.onPlayerStateChange.bind(this)
            }
        });
    }

    onPlayerStateChange(event) {
        const YT = window.YT;
        if (!YT) return;

        const currentTime = this.player?.getCurrentTime ? this.player.getCurrentTime() : 0;
        const duration = this.player?.getDuration ? this.player.getDuration() : 0;
        const percentWatched = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

        const clickData = {
            videoId: parseVideoUrl(this.props.content)?.id,
            currentTime: Math.round(currentTime),
            duration: Math.round(duration),
            percentWatched: percentWatched
        };

        switch (event.data) {
            case YT.PlayerState.PLAYING:
                if (!this.state.hasPlayed) {
                    this.setState({ hasPlayed: true });
                    if (this.props.onVideoEvent) {
                        this.props.onVideoEvent({ ...clickData, event: 'play' });
                    }
                }
                break;

            case YT.PlayerState.PAUSED:
                if (!this.state.hasPaused) {
                    this.setState({ hasPaused: true });
                }
                if (this.props.onVideoEvent) {
                    this.props.onVideoEvent({ ...clickData, event: 'pause' });
                }
                break;

            case YT.PlayerState.ENDED:
                if (!this.state.hasEnded) {
                    this.setState({ hasEnded: true });
                    if (this.props.onVideoEvent) {
                        this.props.onVideoEvent({ ...clickData, event: 'ended' });
                    }
                }
                break;

            default:
                break;
        }
    }

    renderYouTube(videoId) {
        return (
            <div ref={this.containerRef}
                 className="relative w-full mb-3 rounded-lg overflow-hidden bg-black" 
                 style={{ paddingBottom: '56.25%' }}>
                <div 
                    id={this.playerId}
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
        );
    }

    renderVimeo(videoId) {
        const handleIframeClick = () => {
            if (this.props.onVideoEvent) {
                this.props.onVideoEvent({
                    timestamp: Date.now(),
                    videoId: videoId,
                    event: 'click'
                });
            }
        };

        return (
            <div ref={this.containerRef}
                 className="relative w-full mb-3 rounded-lg overflow-hidden bg-black" 
                 style={{ paddingBottom: '56.25%' }}
                 onClick={handleIframeClick}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                />
            </div>
        );
    }

    render() {
        const video = parseVideoUrl(this.props.content);
        
        if (!video) {
            // Not a video URL, render as HTML content
            return (
                <div ref={this.props.contentRef}>
                    <p className="text-lg font-normal p-2 pt-0" 
                       dangerouslySetInnerHTML={{__html: this.props.content}} />
                </div>
            );
        }

        if (video.platform === 'youtube') {
            return this.renderYouTube(video.id);
        }

        if (video.platform === 'vimeo') {
            return this.renderVimeo(video.id);
        }

        return null;
    }
}
