# Dynamic Spherical Videos
More Bacon Pancakes B.V. ontwikkelt software, onder andere voor het afspelen van dynamische films. Dit houdt in dat men op basis van externe bronnen delen van de film realtime wil kunnen vervangen. Denk hierbij aan de vroegere greenscreen (Chromakey) technieken. Binnen dit project wil men dit in plaats van binnen een normale film, gaan ontwikkelen voor 360 graden spherical video’s. Dit zijn films waardij de weergave in alle richtingen tegelijk wordt opgenomen. Deze opnames worden gedaan met een omnidirectionele camera of een verzameling camera's. Tijdens het afspelen heeft de kijker controle over de kijkrichting, door bijvoorbeeld het mobieltje waarmee hij kijkt te bewegen in een bepaalde richting. Men wil binnen dit project matching transformation en 3d elements injection technieken binnen een spherical video ontwikkelen. Het gaat hierbij om technieken om customized objecten (2d en 3d) in de video te injecteren, maar ook technieken om deze video’s op de verschillende devices (mobiel en VR) af te spelen.

Due to the international nature of our teams, the driving language within this project will be English.

# Structure & Getting started

    /Dynamic Spherical Videos
Our main prototyping playground. To get started simply add the project within the **Unity Hub** making sure to use a 2019 LTS version thats supported.

    /Docs
Holds documentation around decisions within the project.

    /Tools
Holds various tools for creating 360 video content.


# Current status 
For a quick overview of the current state and next steps we have the following checklist;

 - [x] Create a project that can be exported to Mobile devices.
 - [x] Implement a 360 video within the project
 - [x] Implement debugging tools to allow for camera movements
 - [x] Realtime 360 video manipulation
 - [x] Track a regular video 
 - [x] Apply lens deformations for 2D to Equirectangular
 - [x] Test FFD as a tracking technique
 - [x] Translate a 2D space into a 3D space (Equirectangular)
 - [ ] Transform a 3D video into a 2D video to be tracked then convert it back into 3D
