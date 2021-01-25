# How to create tracking data and export it
Tracking within After Effects can easily be done by using the Mocha Plugin.
Using a Cornerpin approach we can track four corner pins to track a square across a video.

## To export
After running mocha to track the composition. Choose 'create tracking data' and 'Apply tracking data' to a layer with a shape. After this data is applied these keyframes can be copy and pasted towards a file. We can then translate the cornerpin data to c# or json for use in other applications.

# How do we track in applications
Within our applications we read the cornerpin data per frame and apply the transformations to our object.