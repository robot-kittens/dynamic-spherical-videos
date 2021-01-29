#pragma once

#include "VideoFrameTransformHelper.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct VideoFrameTransform VideoFrameTransform;

extern VideoFrameTransform* VideoFrameTransform_new(
  FrameTransformContext* ctx);

extern void VideoFrameTransform_delete(VideoFrameTransform* transform);

extern int VideoFrameTransform_generateMapForPlane(
  VideoFrameTransform* transform,
  int inputWidth,
  int inputHeight,
  int outputWidth,
  int outputHeight,
  int transformMatPlaneIndex);

extern int VideoFrameTransform_transformFramePlane(
  VideoFrameTransform* transform,
  uint8_t* inputData,
  uint8_t* outputData,
  int inputWidth,
  int inputHeight,
  int inputWidthWithPadding,
  int outputWidth,
  int outputHeight,
  int outputWidthWithPadding,
  int transformMatPlaneIndex,
  int imagePlaneIndex);

#ifdef __cplusplus
}
#endif
