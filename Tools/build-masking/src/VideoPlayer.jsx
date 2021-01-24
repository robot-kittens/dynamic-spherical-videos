import react from "react";

const VideoPlayer = ({ width, height, src }) => (
  <video width={width} height={height} controls>
    <source src={src} type='video/mp4' />
    Your browser does not support the video tag.
  </video>
);

export default VideoPlayer;
