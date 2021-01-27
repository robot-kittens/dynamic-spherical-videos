using System;
using RobotKittens.SoSystem.EventChannels;
using UnityEngine;
using UnityEngine.Video;

public class VideoRenderTextureUpdater : MonoBehaviour
{
    [SerializeField] private Material videoMaterial = null;
    [SerializeField] private Vector2EventChannel renderTextureResizeEvent = null;
    private VideoPlayer _videoPlayer = null;

    private void OnEnable()
    {
        _videoPlayer = GetComponent<VideoPlayer>();
        if (renderTextureResizeEvent)
        {
            renderTextureResizeEvent.RegisterAction(MakeNewRenderTexture);
        }
    }

    private void OnDisable()
    {
        if (renderTextureResizeEvent)
        {
            renderTextureResizeEvent.UnregisterAction(MakeNewRenderTexture);
        }
    }

    private void MakeNewRenderTexture(Vector2 size)
    {
        throw new NotImplementedException();
    }

    private void SetNewRenderTexture(RenderTexture texture)
    {
        if (videoMaterial)
        {
            videoMaterial.mainTexture = texture;
        }

        if (_videoPlayer)
        {
            //_videoPlayer.texture = texture;
        }
    }
}
