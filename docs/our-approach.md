# Highlevel approach & requirements
To implement tracking within a 360 video there is a lot of research that has to be done around key subjects. Our main objective is how do we create a 360 video with tracking implemented?

 1. How do we create a 360 video?
    1. A video in either Equirectangular or Cubemap format can be used imported and projected onto a Skybox with a Skybox/Panoramic shader to translate it to 3d space.
 2. How can we real-time manipulate this video?
 3. How can we support multiple vendors, e.g. Mobile but also Vive or Oculus?
 4. How can we track an object in a deformed space?
