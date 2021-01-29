#pragma once

#include <stdint.h>

typedef enum TransformFaceType {
  RIGHT = 0,
  LEFT,
  TOP,
  BOTTOM,
  FRONT,
  BACK
} TransformFaceType;

typedef enum Layout {
  LAYOUT_CUBEMAP_32 = 0,
  LAYOUT_CUBEMAP_23_OFFCENTER,
#ifdef FACEBOOK_LAYOUT
  LAYOUT_FB,
#endif
  LAYOUT_EQUIRECT,
  LAYOUT_N
} Layout;

typedef enum StereoFormat {
  STEREO_FORMAT_TB = 0,
  STEREO_FORMAT_LR,
  STEREO_FORMAT_MONO,
  STEREO_FORMAT_GUESS,
  STEREO_FORMAT_N
} StereoFormat;

typedef enum InterpolationAlg {
  NEAREST = 0,
  LINEAR = 1,
  CUBIC = 2,
  LANCZOS4 = 4
} InterpolationAlg;

typedef struct FrameTransformContext {
  Layout output_layout;
  StereoFormat input_stereo_format;
  StereoFormat output_stereo_format;
  int vflip;
  float expand_coef;
  InterpolationAlg interpolation_alg;
  float width_scale_factor; /// Width scale factor for antialiasing purpose
  float height_scale_factor; /// Height scale factor for antialiasing purpose
  float fixed_yaw;    ///< Yaw (asimuth) angle, degrees
  float fixed_pitch;  ///< Pitch (elevation) angle, degrees
  float fixed_roll;   ///< Roll (tilt) angle, degrees
  float fixed_hfov;   ///< Horizontal field of view, degrees
  float fixed_vfov;   ///< Vertical field of view, degrees
  float fixed_cube_offcenter_x; /// offcenter projection x
  float fixed_cube_offcenter_y; /// offcenter projection y
  float fixed_cube_offcenter_z; /// offcenter projection z
  int enable_low_pass_filter;
  float kernel_height_scale_factor; /// Factor to scale the calculated kernel
                                    /// height for low pass filtering
  int min_kernel_half_height; /// Half of the mininum kernel height which is
                              /// usually applied to areas with small pitch
                              /// values

  int enable_multi_threading; /// Use multi-threading to filter segments
                              /// in parallel
  int num_vertical_segments; /// Number of vertical segments in a plane
  int num_horizontal_segments; /// Number of horizontal segments in a plane
  int adjust_kernel; /// Adjust kernels bsed on the "distance" (in radians)
                     /// from the input point (yaw, pitch)
  float kernel_adjust_factor; /// Factor to further adjust the kernel size
} FrameTransformContext;
