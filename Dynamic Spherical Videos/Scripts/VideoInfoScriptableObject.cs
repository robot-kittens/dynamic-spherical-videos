using UnityEngine;

[CreateAssetMenu(menuName = "VideoInfo")]
public class VideoInfoScriptableObject : ScriptableObject
{
    public string filename;
    public Video3DFormat Video3DFormat = Video3DFormat.UpDown;
    public VideoPlaySurface VideoPlaySurface = VideoPlaySurface.FullSphere;
}

public enum Video3DFormat {
    Flat,
    SideBySide,
    UpDown
}

public enum VideoPlaySurface {
    FullSphere,
    HalfSphere,
    Flat
}