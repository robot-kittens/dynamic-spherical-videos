#include "VideoFrameTransformHandler.h"

#include "VideoFrameTransform.h"

VideoFrameTransform* VideoFrameTransform_new(
    FrameTransformContext* ctx) {
  return new VideoFrameTransform(ctx);
}

void VideoFrameTransform_delete(VideoFrameTransform* transform) {
  delete transform;
}

int VideoFrameTransform_generateMapForPlane(
  VideoFrameTransform* transform,
  int inputWidth,
  int inputHeight,
  int outputWidth,
  int outputHeight,
  int transformMatPlaneIndex) {
  return transform->generateMapForPlane(
    inputWidth,
    inputHeight,
    outputWidth,
    outputHeight,
    transformMatPlaneIndex);
}

int VideoFrameTransform_transformFramePlane(
  VideoFrameTransform* transform,
  uint8_t* inputData,
  uint8_t* outputData,
  int inputWidthWithPadding,
  int inputHeight,
  int outputWidth,
  int outputHeight,
  int outputWidthWithPadding,
  int transformMatPlaneIndex,
  int imagePlaneIndex) {
  return transform->transformFramePlane(
    inputData,
    outputData,
    inputWidthWithPadding,
    inputHeight,
    outputWidth,
    outputHeight,
    outputWidthWithPadding,
    transformMatPlaneIndex,
    imagePlaneIndex);
}
