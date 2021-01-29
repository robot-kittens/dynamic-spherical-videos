# Equirectangular camera
Currently we can add 2d images within our 3d space.
How it works:
- Our camera renders our video into a cubemap
- the cubemap is translated to an equirectangular using a shader
- The equirectangular is layer on top of the video in another canvas
- The canvas is rendered to a skybox