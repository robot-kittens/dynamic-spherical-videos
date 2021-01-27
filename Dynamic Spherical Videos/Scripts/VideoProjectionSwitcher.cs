using System;
using RobotKittens.SoSystem.EventChannels;
using UnityEngine;
using UnityEngine.Video;

[RequireComponent(typeof(VideoPlayer))]
public class VideoProjectionSwitcher : MonoBehaviour
{
    [SerializeField] private IntEventChannel updateVideoProjection = null;
    
    [SerializeField] private Renderer fullSphereRenderer = null;
    [SerializeField] private Renderer halfSphereRenderer = null;
    [SerializeField] private Renderer flatRenderer = null;

    private VideoPlayer _videoPlayer = null;
    
    private void OnEnable()
    {
        _videoPlayer = GetComponent<VideoPlayer>();
        if (updateVideoProjection)
        {
            updateVideoProjection.RegisterAction(ChangeViewMode);
        }
    }

    private void OnDisable()
    {
        if (updateVideoProjection)
        {
            updateVideoProjection.UnregisterAction(ChangeViewMode);
        }
    }

    private void ChangeViewMode(int value)
    {
        VideoPlaySurface playSurface = (VideoPlaySurface) value;
        
        if (fullSphereRenderer)
        {
            fullSphereRenderer.gameObject.SetActive(playSurface == VideoPlaySurface.FullSphere);
        }
        if (halfSphereRenderer)
        {
            halfSphereRenderer.gameObject.SetActive(playSurface == VideoPlaySurface.HalfSphere);
        }
        if (flatRenderer)
        {
            flatRenderer.gameObject.SetActive(playSurface == VideoPlaySurface.Flat);
        }

        switch (playSurface)
        {
            case VideoPlaySurface.FullSphere:
                _videoPlayer.targetMaterialRenderer = fullSphereRenderer;
                break;
            case VideoPlaySurface.HalfSphere:
                _videoPlayer.targetMaterialRenderer = halfSphereRenderer;
                break;
            case VideoPlaySurface.Flat:
                _videoPlayer.targetMaterialRenderer = flatRenderer;
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }
    }
}
