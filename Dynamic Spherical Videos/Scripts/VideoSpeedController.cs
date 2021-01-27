using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Video;
using UnityEngine.XR;

public class VideoSpeedController : MonoBehaviour
{
    private VideoPlayer _videoPlayer;
    
    private List<InputDevice> _devices = new List<InputDevice>();
    private List<InputFeatureUsage> _features = new List<InputFeatureUsage>();
    private bool _buttonValue = false;
    private bool[] _lastButtonValue = {};
    private Vector2 _inputAxis;
    private float _maxAxisPosition = 0;
    private float _deadZone = 0.25f;
    private float _speedMultiplier = 4;
    
    private void OnEnable()
    {
        CheckDeviceValidity();
        _videoPlayer = GetComponent<VideoPlayer>();
    }

    private void Update()
    {
        CheckDeviceValidity();
        _maxAxisPosition = 0;
        for (int i = 0; i < _devices.Count; i++)
        {
            InputDevice inputDevice = _devices[i];
            inputDevice.TryGetFeatureUsages(_features);
            if (inputDevice.TryGetFeatureValue(CommonUsages.primaryButton, out _buttonValue))
            {
                if (_buttonValue && _buttonValue != _lastButtonValue[i])
                {
                    ButtonPressed();
                }
            }
            if (inputDevice.TryGetFeatureValue(CommonUsages.primary2DAxis, out _inputAxis))
            {
                _maxAxisPosition = Mathf.Max(_inputAxis.x, _maxAxisPosition);
            }
        }

        StickMoved(Mathf.InverseLerp(_deadZone, 1, _maxAxisPosition));
    }

    private void StickMoved(float xAxisPosition)
    {
        _videoPlayer.playbackSpeed = 1 + xAxisPosition * _speedMultiplier;
        //_videoPlayer.Play();
    }

    private void ButtonPressed()
    {
        double newTime = _videoPlayer.time + 30;
        double maxLength = _videoPlayer.length;
        _videoPlayer.time = newTime > maxLength ? maxLength : newTime;
        //_videoPlayer.Play();
    }

    private void GetDevices()
    {
        InputDevices.GetDevicesWithCharacteristics(InputDeviceCharacteristics.Controller, _devices);
        _lastButtonValue = new bool[_devices.Count];
    }
    
    private void CheckDeviceValidity()
    {
        if (_devices.Count > 0)
        {
            foreach (InputDevice inputDevice in _devices)
            {
                if (inputDevice.isValid)
                {
                    continue;
                }
                GetDevices();
                break;
            } 
        }
        else
        {
            GetDevices();
        }
    }
}
