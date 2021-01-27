using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using RobotKittens.SoSystem.EventChannels;
using RobotKittens.SoSystem.References;
using RobotKittens.SoSystem.Variables;
using UnityEngine;
using UnityEngine.Android;
/*using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;*/
using UnityEngine.Video;
using Object = UnityEngine.Object;

[RequireComponent(typeof(VideoPlayer))]
public class VideoManager : MonoBehaviour
{
    private VideoPlayer _videoPlayer = null;

    [SerializeField]
    private StringEventChannel onVideoPlayEvent = null;

    [SerializeField]
    private EventChannel onVideoReadyEvent = null;
    
    [SerializeField]
    private EventChannel startExperienceEvent = null;

    [SerializeField] 
    private FloatReference seekDelayTime;
    
    [SerializeField] 
    private FloatReference experienceTime;
    
    private double _savedVideoTime;
    private float _savedGameTime;
    
    
    private void Awake()
    {
        if (!Permission.HasUserAuthorizedPermission(Permission.ExternalStorageRead))
            Permission.RequestUserPermission(Permission.ExternalStorageRead);
    }

    private void OnEnable()
    {
        _videoPlayer = GetComponent<VideoPlayer>();
        
        if (onVideoPlayEvent)
        {
            onVideoPlayEvent.RegisterAction(SetClip);
        }
    }

    private void OnDisable()
    {
        if (onVideoPlayEvent)
        {
            onVideoPlayEvent.UnregisterAction(SetClip);
        }
    }

    public void SetClip(VideoClip clip)
    {
        _videoPlayer.clip = clip;
        _videoPlayer.Play();
    }
    
    public void SetClip(string clipPath)
    {
        if (!_videoPlayer.isPlaying && startExperienceEvent)
        {
            startExperienceEvent.RaiseEvent();
        }
        SaveVideoInfo();
        string rootPath;
        if (Application.platform == RuntimePlatform.Android)
        {
            rootPath = Application.persistentDataPath.Substring(0, Application.persistentDataPath.IndexOf("Android", StringComparison.Ordinal));
            rootPath = Path.Combine(rootPath, "Movies");
        }
        else
        {
            rootPath = Path.Combine(Application.dataPath, "Videos/TestVideo") ;
        }
        
        string path = Path.Combine(rootPath,  $"{clipPath}.mp4");

        _videoPlayer.url = path;
        _videoPlayer.Play();
        _videoPlayer.started += IsPrepared;
        _videoPlayer.seekCompleted += SeekIsCompleted;
    }

    private void SaveVideoInfo()
    {
        _savedVideoTime = _videoPlayer.time;
        _savedGameTime = experienceTime.Value;
    }

    private void ApplyVideoInfo()
    {
        _savedVideoTime = _savedVideoTime + Time.time - _savedGameTime;
        double maxLength = _videoPlayer.length;
        _savedVideoTime = _savedVideoTime > maxLength ? maxLength : _savedVideoTime;
        //Set up with padding to make sure we can play it synced with the music
        _videoPlayer.time = _savedVideoTime + seekDelayTime.Value;
    }

    private float _seekStarted = 0;
    private Coroutine _videoDelayRoutine;
    
    private void IsPrepared(VideoPlayer player)
    {
        ApplyVideoInfo();
        _seekStarted = experienceTime.Value;
        //_videoPlayer.prepareCompleted -= IsPrepared;
        _videoPlayer.started -= IsPrepared;
    }
    
    private void SeekIsCompleted(VideoPlayer player)
    {
        _videoPlayer.Pause();
        float currentTime = experienceTime.Value;
        float loadDuration = currentTime - _seekStarted;
        
        if (loadDuration < seekDelayTime.Value)
        {
            _videoDelayRoutine = StartCoroutine(DelayVideoStart(seekDelayTime.Value - loadDuration));
        }
        else
        {
            PlayVideo();
        }
        
        _videoPlayer.seekCompleted -= SeekIsCompleted;
    }
    
    IEnumerator DelayVideoStart(float time)
    {
        yield return new WaitForSeconds(time);

        PlayVideo();
    }

    private void PlayVideo()
    {
        if (onVideoReadyEvent)
        {
            onVideoReadyEvent.RaiseEvent();
        }
        _videoPlayer.Play();
    }
}
