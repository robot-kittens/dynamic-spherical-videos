#pragma once

#include "VideoFrameTransformHelper.h"

#include <map>
#include <string>
#include <thread>
#include <vector>

#include <opencv2/opencv.hpp>

struct SegmentFilteringConfig
{
  SegmentFilteringConfig(
    int inputLeft,
    int inputTop,
    int inputWidth,
    int inputHeight) {
    left = inputLeft;
    top = inputTop;
    width = inputWidth;
    height = inputHeight;
  }

  int left, top, width, height;
};

class VideoFrameTransform
{
  public:
    explicit VideoFrameTransform(FrameTransformContext* ctx);

    bool generateMapForPlane(
      int inputWidth,
      int inputHeight,
      int outputWidth,
      int outputHeight,
      int transformMatPlaneIndex);

    cv::Mat transformPlane(
      const cv::Mat& inputMat,
      int outputWidth,
      int outputHeight,
      int transformMatPlaneIndex,
      int imagePlaneIndex);

    /// Transform API function for C
    bool transformFramePlane(
      uint8_t* inputData,
      uint8_t* outputData,
      int inputWidthWithPadding,
      int inputHeight,
      int outputWidth,
      int outputHeight,
      int outputWidthWithPadding,
      int transformMatPlaneIndex,
      int imagePlaneIndex);

  private:
    bool transformPos(
      float x,
      float y,
      float* outX,
      float* outY,
      int transformMatPlaneIndex);


    cv::Mat filterPlane(
      const cv::Mat& inputMat,
      int transformMatPlaneIndex,
      int imagePlaneIndex);

    void calcualteFilteringConfig(
      int inputWidth,
      int inputHeight,
      int outputWidth,
      int outputHeight,
      int transformMatPlaneIndex);

    void filterSegment(
      const cv::Mat& inputMat,
      cv::Mat& outputMat,
      const cv::Mat& kernelX,
      const cv::Mat& kernelY,
      int left,
      int top,
      int width,
      int height,
      int imagePlaneIndex);

    void generateKernelsAndFilteringConfigs(
      int startTop,
      int startBottom,
      float sigmaY,
      const cv::Mat& kernelY,
      int baseSegmentHeight,
      int inputWidth,
      int inputHeight,
      int transformMatPlaneIndex);

    void generateKernelAndFilteringConfig(
      int top,
      int bottom,
      float angle,
      float sigmaY,
      const cv::Mat& kernelY,
      int inputWidth,
      int inputHeight,
      int transformMatPlaneIndex);

    void runFiltering(
      const cv::Mat& inputMat,
      cv::Mat& blurredPlane,
      int transformMatPlaneIndex,
      int imagePlaneIndex,
      int leftOffset,
      int topOffset,
      std::vector<std::thread>& segmentFilteringThreads);


    FrameTransformContext ctx_;

    /// Map of <transformMatPlaneIndex, transform mat>
    std::map<int, cv::Mat> warpMats_;

    /// Map of <transformMatPlaneIndex, vector of 1D filter kernels
    /// along X (horizontal) direction> for filtering frame plane
    /// Same for Y (vertical) direction
    std::map<int, std::vector<cv::Mat>> filterKernelsX_,
      filterKernelsY_;

    /// Map of <transformMatPlaneIndex, vector of config parameters>
    /// for filtering frame plane
    std::map<int, std::vector<SegmentFilteringConfig>> segmentFilteringConfigs_;
};
