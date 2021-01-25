# Highlevel approach & requirements
To implement tracking within a 360 video there is a lot of research that has to be done around key subjects. Our main objective is how do we create a 360 video with tracking implemented?

 1. How do we create a 360 video?
    1. A video in either Equirectangular or Cubemap format can be used imported and projected onto a Skybox with a Skybox/Panoramic shader to translate it to 3d space.
 2. How can we real-time manipulate this video?
    1. By creating a (2D) canvas which we project onto the skybox. We can have the 360 video as a layer and add elements on top of it. For example images or text.
 3. How can we support multiple vendors, e.g. Mobile but also Vive or Oculus?
    1. Unity supports Vive and Oculus, implementing the SDK's creates a unified approach to exporting for Stereoscopic content.
 4. How can we create tracking data that we can use within our toolkit?
    1. 
 5. How can we track objects?
    1. With After Effects and Mocha we can create our tracking data which can be translated toward c# or json to be used in external applications. These transforms are basic on solid shapes.
 6. How can we track an object in a deformed space?
 7. How can we transform 2D space to an Equirect space?
 8. 
